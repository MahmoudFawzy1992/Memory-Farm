const { z } = require('zod');

// Image data schema for base64 images
const ImageDataSchema = z.object({
  id: z.string(),
  url: z.string().refine(
    (url) => url.startsWith('data:image/') && url.includes('base64,'),
    { message: "Image must be a valid base64 data URL" }
  ),
  name: z.string().max(255),
  alt: z.string().max(255).optional(),
  caption: z.string().max(255).optional(),
  size: z.number().max(10 * 1024 * 1024), // Max 10MB
  type: z.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/),
  uploadedAt: z.string().datetime().optional()
});

// Inline content schema (text formatting within blocks)
const InlineContentSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  styles: z.record(z.boolean()).optional()
});

// Block schemas for different content types
const ParagraphBlockSchema = z.object({
  id: z.string(),
  type: z.literal('paragraph'),
  props: z.object({
    textAlignment: z.enum(['left', 'center', 'right']).optional(),
    textColor: z.string().optional(),
    backgroundColor: z.string().optional()
  }).optional(),
  content: z.array(z.union([
    z.string(),
    InlineContentSchema
  ])).optional(),
  createdAt: z.string().optional()
});

const CheckListSchema = z.object({
  id: z.string(),
  type: z.literal('checkList'),
  props: z.object({
    textColor: z.string().optional()
  }).optional(),
  content: z.array(z.object({
    id: z.union([z.string(), z.number()]), // Accept both string and number IDs
    text: z.string(),
    checked: z.boolean().default(false),
    completedAt: z.string().datetime().nullable().optional()
  })).optional(),
  createdAt: z.string().optional()
});

// FIXED: Enhanced image block schema with proper image data validation
const ImageBlockSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  props: z.object({
    images: z.array(ImageDataSchema).min(1, "Image block must have at least one image")
  }),
  content: z.array(z.any()).optional().default([]),
  createdAt: z.string().optional()
});

const MoodBlockSchema = z.object({
  id: z.string(),
  type: z.literal('mood'),
  props: z.object({
    emotion: z.string().min(1, "Emotion is required"),
    intensity: z.number().min(1).max(10),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    note: z.string().max(500).optional()
  }),
  content: z.array(z.any()).optional().default([]),
  createdAt: z.string().optional()
});

const DividerBlockSchema = z.object({
  id: z.string(),
  type: z.literal('divider'),
  props: z.object({
    style: z.enum(['line', 'dashed', 'dotted', 'double', 'stars', 'wave']).default('line'),
    color: z.string().default('#E5E7EB')
  }).optional(),
  content: z.array(z.any()).optional().default([]),
  createdAt: z.string().optional()
});

// Union of all block types
const BlockContentSchema = z.discriminatedUnion('type', [
  ParagraphBlockSchema,
  CheckListSchema,
  ImageBlockSchema,
  MoodBlockSchema,
  DividerBlockSchema
]);

// Full memory content schema
const MemoryContentSchema = z.array(BlockContentSchema).min(1, "Memory must have at least one block");

// Memory creation/update schema with title field
const CreateMemorySchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  content: MemoryContentSchema,
  emotion: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be valid hex code"),
  isPublic: z.boolean().default(false),
  memoryDate: z.string().datetime().or(z.date())
});

const UpdateMemorySchema = CreateMemorySchema.partial().extend({
  title: z.string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title cannot exceed 100 characters")
    .trim()
    .optional(),
  content: MemoryContentSchema.optional()
});

// Validation helpers
const validateBlockContent = (content) => {
  try {
    MemoryContentSchema.parse(content);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      errors: error.errors.map(err => err.message) 
    };
  }
};

const validateMemoryData = (data, isUpdate = false) => {
  try {
    const schema = isUpdate ? UpdateMemorySchema : CreateMemorySchema;
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    return { 
      valid: false, 
      errors: error.errors ? error.errors.map(err => `${err.path.join('.')}: ${err.message}`) : ['Validation failed']
    };
  }
};

// FIXED: Image-specific validation
const validateImageData = (imageData) => {
  try {
    ImageDataSchema.parse(imageData);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors.map(err => err.message)
    };
  }
};

module.exports = {
  InlineContentSchema,
  ParagraphBlockSchema,
  CheckListSchema,
  ImageBlockSchema,
  MoodBlockSchema,
  DividerBlockSchema,
  BlockContentSchema,
  MemoryContentSchema,
  CreateMemorySchema,
  UpdateMemorySchema,
  ImageDataSchema,
  validateBlockContent,
  validateMemoryData,
  validateImageData
};
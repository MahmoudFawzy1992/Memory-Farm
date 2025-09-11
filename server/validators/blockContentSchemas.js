const { z } = require('zod');

// Inline content schema (text formatting within blocks)
const InlineContentSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  styles: z.record(z.boolean()).optional() // bold, italic, underline, etc.
});

// Block schemas for different content types
const ParagraphBlockSchema = z.object({
  id: z.string(),
  type: z.literal('paragraph'),
  props: z.any().optional(),
  content: z.any().optional(),
  createdAt: z.string().optional()
});

const CheckListSchema = z.object({
  id: z.string(),
  type: z.literal('checkList'),
  props: z.any().optional(),
  content: z.any().optional(),
  createdAt: z.string().optional()
});

const ImageBlockSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  props: z.any().optional(),
  content: z.any().optional(),
  createdAt: z.string().optional()
});

const MoodBlockSchema = z.object({
  id: z.string(),
  type: z.literal('mood'),
  props: z.any().optional(),
  content: z.any().optional(),
  createdAt: z.string().optional()
});

const DividerBlockSchema = z.object({
  id: z.string(),
  type: z.literal('divider'),
  props: z.any().optional(),
  content: z.any().optional(),
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

// FIXED: Memory creation/update schema with title field
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
  validateBlockContent,
  validateMemoryData
};
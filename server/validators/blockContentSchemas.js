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
  props: z.object({
    textAlignment: z.enum(['left', 'center', 'right']).default('left'),
    textColor: z.string().default('#000000'),
    backgroundColor: z.string().default('transparent')
  }).optional(),
  content: z.array(InlineContentSchema)
});

const HeadingBlockSchema = z.object({
  id: z.string(),
  type: z.literal('heading'),
  props: z.object({
    level: z.enum(['1', '2', '3']).default('1'),
    textAlignment: z.enum(['left', 'center', 'right']).default('left'),
    textColor: z.string().default('#000000')
  }).optional(),
  content: z.array(InlineContentSchema)
});

const BulletListItemSchema = z.object({
  id: z.string(),
  type: z.literal('bulletListItem'),
  props: z.object({
    textColor: z.string().default('#000000')
  }).optional(),
  content: z.array(InlineContentSchema)
});

const NumberedListItemSchema = z.object({
  id: z.string(),
  type: z.literal('numberedListItem'),
  props: z.object({
    textColor: z.string().default('#000000')
  }).optional(),
  content: z.array(InlineContentSchema)
});

const CheckListItemSchema = z.object({
  id: z.string(),
  type: z.literal('checkListItem'),
  props: z.object({
    checked: z.boolean().default(false),
    textColor: z.string().default('#000000')
  }).optional(),
  content: z.array(InlineContentSchema)
});

const ImageBlockSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  props: z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    width: z.number().positive().optional(),
    previewUrl: z.string().url().optional() // thumbnail for performance
  }),
  content: z.array().length(0) // Images have no text content
});

const MoodBlockSchema = z.object({
  id: z.string(),
  type: z.literal('mood'),
  props: z.object({
    emotion: z.string().min(1).max(50),
    intensity: z.number().min(1).max(10).default(5),
    color: z.string().regex(/^#[0-9A-F]{6}$/i),
    note: z.string().max(200).optional()
  }),
  content: z.array(InlineContentSchema).optional()
});

// Union of all block types
export const BlockContentSchema = z.discriminatedUnion('type', [
  ParagraphBlockSchema,
  HeadingBlockSchema,
  BulletListItemSchema,
  NumberedListItemSchema,
  CheckListItemSchema,
  ImageBlockSchema,
  MoodBlockSchema
]);

// Full memory content schema
export const MemoryContentSchema = z.array(BlockContentSchema).min(1, "Memory must have at least one block");

// Memory creation/update schema
export const CreateMemorySchema = z.object({
  content: MemoryContentSchema,
  emotion: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be valid hex code"),
  isPublic: z.boolean().default(false),
  memoryDate: z.string().datetime().or(z.date())
});

export const UpdateMemorySchema = CreateMemorySchema.partial().extend({
  content: MemoryContentSchema.optional()
});

// Validation helpers
export const validateBlockContent = (content) => {
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

export const validateMemoryData = (data, isUpdate = false) => {
  try {
    const schema = isUpdate ? UpdateMemorySchema : CreateMemorySchema;
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    return { 
      valid: false, 
      errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`) 
    };
  }
};
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name cannot exceed 100 characters'),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name cannot exceed 100 characters'),
  isActive: z.boolean(),
});

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

export const categoryLookupSchema = z.object({
  id: z.number().int(),
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name cannot exceed 100 characters'),
  isActive: z.boolean(),
});

export type CategoryLookupDto = z.infer<typeof categoryLookupSchema>;


export const categoryLookupServiceSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: categoryLookupSchema, 
});

export type CategoryLookupService = z.infer<typeof categoryLookupServiceSchema>;

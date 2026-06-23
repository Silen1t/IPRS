import type {
  categoryLookupSchema,
  createCategorySchema,
  updateCategorySchema,
} from '@/schemas/category';
import type { z } from 'zod';

export type CategoryLookupDto = z.infer<typeof categoryLookupSchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

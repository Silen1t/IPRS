import type {
  createDepartmentSchema,
  departmentResponseSchema,
  updateDepartmentSchema,
} from '@/schemas/department';
import type { z } from 'zod';

export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;
export type DepartmentResponseDto = z.infer<typeof departmentResponseSchema>;
export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>;

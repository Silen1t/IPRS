import { z } from 'zod';


export const departmentResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  createdAt: z.iso.datetime(),
  managerId: z.guid().nullable(), 
});

export type DepartmentResponseDto = z.infer<typeof departmentResponseSchema>;



export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  managerId: z.guid().nullable().optional(),
});

export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>;


export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Department name cannot be empty')
    .nullable()
    .optional(),
  managerId: z.guid().nullable().optional(),
});

export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;
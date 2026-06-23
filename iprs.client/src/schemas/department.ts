import { z } from 'zod';

export const departmentResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  createdAt: z.iso.datetime(),
  managerId: z.guid().nullable(),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  managerId: z.guid().nullable().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Department name cannot be empty')
    .nullable()
    .optional(),
  managerId: z.guid().nullable().optional(),
  removeManager: z.boolean().default(false),
});


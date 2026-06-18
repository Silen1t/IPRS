import { z } from 'zod';
import { UserRole } from '../types/enums';

export const createUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(UserRole),
  departmentId: z.number().int().nullable().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const userResponseSchema = z.object({
  id: z.guid(),
  employeeId: z.string(),
  fullName: z.string(),
  email: z.email(),
  role: z.enum(UserRole),
  departmentId: z.number().int().nullable(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
});

export type UserResponseDto = z.infer<typeof userResponseSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().nullable().optional(),
  role: z.enum(UserRole).nullable().optional(),
  departmentId: z.number().int().nullable().optional(),
  removeDepartment: z.boolean().default(false),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export const userProfileSchema = z.object({
  employeeId: z.string(),
  fullName: z.string(),
  email: z.email(),
  role: z.enum(UserRole),
  departmentId: z.number().int().nullable().optional(),
  departmentName: z.string().nullable().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const userSummaryResponseSchema = z.object({
  id: z.guid(),
  employeeId: z.string(),
  fullName: z.string(),
  email: z.email(),
  departmentId: z.number().int().nullable(),
});

export type UserSummaryResponse = z.infer<typeof userSummaryResponseSchema>;

export const userResponseServiceSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: userResponseSchema, 
});

export type UserResponseService = z.infer<typeof userResponseServiceSchema>;

import { z } from 'zod';
import { UserRole } from '@/types/enums';

export const createUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(UserRole),
  departmentId: z.number().int().nullable().optional(),
});


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



export const updateUserSchema = z.object({
  fullName: z.string().nullable().optional(),
  role: z.enum(UserRole).nullable().optional(),
  departmentId: z.number().int().nullable().optional(),
  removeDepartment: z.boolean().default(false),
});


export const userProfileSchema = z.object({
  employeeId: z.string(),
  fullName: z.string(),
  email: z.email(),
  role: z.enum(UserRole),
  departmentId: z.number().int().nullable().optional(),
  departmentName: z.string().nullable().optional(),
});


export const userSummaryResponseSchema = z.object({
  id: z.guid(),
  employeeId: z.string(),
  fullName: z.string(),
  email: z.email(),
  departmentId: z.number().int().nullable(),
});


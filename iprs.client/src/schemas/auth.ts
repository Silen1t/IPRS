import { z } from 'zod';
import { UserRole } from '../types/enums';

export const loginEmailSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginEmployeeIdSchema = z.object({
  employeeId: z.string().length(10, 'Employee ID must be 10 digit'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginEmail = z.infer<typeof loginEmailSchema>;
export type LoginEmployeeId = z.infer<typeof loginEmployeeIdSchema>;

export const authResponseSchema = z.object({
  employeeId: z.string(),
  fullName: z.string(),
  token: z.string(),
  role: z.enum(UserRole),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;



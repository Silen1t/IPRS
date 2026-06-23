import type {
  authResponseSchema,
  loginEmailSchema,
  loginEmployeeIdSchema,
} from '@/schemas/auth';
import type { z } from 'zod';

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type LoginEmail = z.infer<typeof loginEmailSchema>;
export type LoginEmployeeId = z.infer<typeof loginEmployeeIdSchema>;

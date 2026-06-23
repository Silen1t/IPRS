import type {
  createUserSchema,
  updateUserSchema,
  userProfileSchema,
  userResponseSchema,
  userSummaryResponseSchema,
} from '@/schemas/user';
import type { z } from 'zod';


export type UserSummaryResponse = z.infer<typeof userSummaryResponseSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserResponseDto = z.infer<typeof userResponseSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;

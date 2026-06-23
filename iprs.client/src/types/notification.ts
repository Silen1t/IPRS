import type {
  notificationResponseSchema,
  updateNotificationReadStatusSchema,
} from '@/schemas/notification';
import type { z } from 'zod';

export type UpdateNotificationReadStatusDto = z.infer<
  typeof updateNotificationReadStatusSchema
>;
export type NotificationResponseDto = z.infer<
  typeof notificationResponseSchema
>;

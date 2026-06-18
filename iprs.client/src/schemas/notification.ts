import { z } from 'zod';

export const notificationResponseSchema = z.object({
  id: z.guid(),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.iso.datetime(),
});

export type NotificationResponseDto = z.infer<
  typeof notificationResponseSchema
>;

export const updateNotificationReadStatusSchema = z.object({
  isRead: z.boolean(),
});

export type UpdateNotificationReadStatusDto = z.infer<
  typeof updateNotificationReadStatusSchema
>;
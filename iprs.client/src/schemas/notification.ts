import { z } from 'zod';

export const notificationResponseSchema = z.object({
  id: z.guid(),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.iso.datetime(),
  relatedRequestId: z.guid(),
});



export const updateNotificationReadStatusSchema = z.object({
  isRead: z.boolean(),
});


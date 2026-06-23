import type { NotificationResponseDto } from '@/types/notification';
import { Guid } from 'guid-typescript';

export function handleNotificationClick (
  notification: NotificationResponseDto,
  markAsRead: (id: Guid) => void,
  setSelectedNotification: (notification: NotificationResponseDto) => void
) {
  setSelectedNotification(notification);

  if (!notification.isRead && markAsRead) {
    markAsRead(Guid.parse(notification.id));
  }
};

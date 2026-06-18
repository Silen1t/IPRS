import { type NotificationResponseDto } from '../schemas/notification';
import { api } from './api';
import type { Guid } from 'guid-typescript';

export async function getAllNotifications(): Promise<
  NotificationResponseDto[]
> {
  const res = await api.get<NotificationResponseDto[]>('notifications');
  return res.data;
}

export async function readNotification(id: Guid) {
  await api.patch(`notifications/${id}/read`, { isRead: true });
}

export async function readAllNotifications() {
  await api.patch('notifications/read-all');
}

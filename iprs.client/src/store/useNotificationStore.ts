import { create } from 'zustand';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';

import type { NotificationResponseDto } from '@/schemas/notification';
import type { Guid } from 'guid-typescript';
import {
  getAllNotifications,
  readAllNotifications,
  readNotification,
} from '@/services/notificationService';

interface NotificationState {
  notifications: NotificationResponseDto[];
  connection: HubConnection | null;
  unreadCount: () => number;
  initNotifications: () => void;
  initSignalR: (token: string) => void;
  disconnectSignalR: () => void;
  markAsRead: (id: Guid) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  connection: null,

  unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
  initNotifications: () => {
    const getNotifications = async () => {
      const data = await getAllNotifications();
      set({ notifications: data });
    };
    getNotifications();
  },
  initSignalR: (token: string) => {
    if (get().connection) return;

    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7209/api/hubs/notifications', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection
      .start()
      .then(() => {
        if (import.meta.env.DEV) {
          console.log('SignalR Connected seamlessly via Zustand store.');
        }

        connection.on(
          'ReceiveNotification',
          (newNotification: NotificationResponseDto) => {
            set((state) => ({
              notifications: [newNotification, ...state.notifications],
            }));
          }
        );
      })
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.error('SignalR Hub initialization failed:', err);
        }
      });

    set({ connection });
  },

  disconnectSignalR: () => {
    const { connection } = get();
    if (connection) {
      connection.stop();
      set({ connection: null });
    }
  },

  markAsRead: async (id) => {
    await readNotification(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id.toString() ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllAsRead: async () => {
    await readAllNotifications();
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
      })),
    }));
  },
}));

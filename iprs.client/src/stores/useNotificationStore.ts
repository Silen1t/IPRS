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
import { toast } from 'sonner';

interface NotificationState {
  notifications: NotificationResponseDto[];
  connection: HubConnection | null;
  initSignalR: (token: string) => void;
  disconnectSignalR: () => void;
  unreadCount: () => number;
  initNotifications: () => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: Guid) => void;
  markAllAsRead: () => void;
}

interface NotificationsSyncMessage {
  type: 'NOTIFICATIONS_UPDATED';
}

const CHANNEL_NAME = 'notifications_sync';
const channel = new BroadcastChannel(CHANNEL_NAME);

const useNotificationStore = create<NotificationState>((set, get) => ({
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

  refreshNotifications: async () => {
    const data = await getAllNotifications();
    set({ notifications: data });
    channel.postMessage({
      type: 'NOTIFICATIONS_UPDATED',
    } satisfies NotificationsSyncMessage);
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
            toast.info('New Notification Received', {
              description:
                newNotification.message ||
                'You have received a new update regarding a purchase request.',
            });
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
}));

channel.onmessage = (event: MessageEvent<NotificationsSyncMessage>) => {
  if (event.data?.type === 'NOTIFICATIONS_UPDATED') {
    useNotificationStore.getState().refreshNotifications();
  }
};

export default useNotificationStore;

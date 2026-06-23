import useNotificationStore from '@/stores/useNotificationStore';

import { Button } from '@/shadcn-ui/components/ui/button';
import { Inbox } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationCard from '@/components/notifications/NotificationCard';
import NotificationDialog from '@/components/notifications/NotificationDialog';
import useHeaderTitle from '@/contexts/HeaderTitleContext';
import { handleNotificationClick } from '@/utils/notification';
import type { NotificationResponseDto } from '@/types/notification';

export default function NotificationsPanel() {
  const notifications = useNotificationStore((state) => state.notifications);
  const { setTitle } = useHeaderTitle();
  useEffect(() => {
    setTitle('Notifications');
  }, [setTitle]);

  // Selectors for state modification
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationResponseDto | null>(null);

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="w-full mx-auto p-6 min-h-screen text-foreground">
      {/* --- HEADER SECTION --- */}
      <div className="border-b border-border pb-4 mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Monitor updates and workflow items requiring your attention.
          </p>
        </div>

        {hasUnread && (
          <Button
            variant="link"
            onClick={() => markAllAsRead?.()}
            className="text-sm h-auto p-0 text-primary hover:text-primary/80"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* --- EMPTY STATE --- */}
      {notifications.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card text-card-foreground">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground mb-3 stroke-[1.5]" />
          <h3 className="font-semibold text-sm">Inbox Clear</h3>
          <p className="text-xs text-muted-foreground mt-1">
            All caught up! You have no new alerts.
          </p>
        </div>
      )}

      {/* --- NOTIFICATION FEED STREAM --- */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            notification={notification}
            key={notification.id}
            onNotificationClicked={() => {
              handleNotificationClick(
                notification,
                markAsRead,
                setSelectedNotification
              );
            }}
          />
        ))}
      </div>

      <NotificationDialog
        selectedNotification={selectedNotification}
        setSelectedNotification={setSelectedNotification}
      />
    </div>
  );
}

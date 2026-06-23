import type { NotificationResponseDto } from '@/types/notification';
import { formatDate } from '@/utils/date';
import { Bell, FileText } from 'lucide-react';

interface NotificationCardProps {
  notification: NotificationResponseDto;
  onNotificationClicked: () => void;
}

export default function NotificationCard({
  notification,
  onNotificationClicked,
}: NotificationCardProps) {
  return (
    <button
      key={notification.id}
      onClick={() => onNotificationClicked()}
      className={`w-full text-left flex gap-4 p-4 rounded-xl border transition-all relative hover:bg-accent/50 ${
        notification.isRead
          ? 'bg-card border-border/60 opacity-80'
          : 'bg-primary/5 border-primary/20 shadow-sm'
      }`}
    >
      {/* Unread Glowing Node Indicator */}
      {!notification.isRead && (
        <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
      )}

      {/* Contextual Adaptive Icon Container */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm transition-colors ${
          notification.isRead
            ? 'bg-muted text-muted-foreground border-border'
            : 'bg-primary/10 text-primary border-primary/20'
        }`}
      >
        {notification.relatedRequestId ? (
          <FileText className="h-4 w-4 stroke-2" />
        ) : (
          <Bell className="h-4 w-4 stroke-2" />
        )}
      </div>

      {/* Content Meta Text Block */}
      <div className="space-y-1 pr-6 w-full min-w-0">
        <div className="flex justify-between items-center w-full">
          <span
            className={`text-xs font-semibold tracking-wider uppercase ${
              notification.isRead ? 'text-muted-foreground' : 'text-primary'
            }`}
          >
            {notification.relatedRequestId
              ? 'Workflow Request'
              : 'System Notice'}
          </span>
        </div>

        <p
          className={`text-sm line-clamp-1 ${
            notification.isRead
              ? 'text-muted-foreground'
              : 'text-foreground font-medium'
          }`}
        >
          {notification.message}
        </p>

        <p className="text-xs text-muted-foreground">
          {formatDate(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}

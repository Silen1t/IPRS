import { ROUTES } from '@/config/routes';
import { Button } from '@/shadcn-ui/components/ui/button';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shadcn-ui/components/ui/dropdown-menu';
import { cn } from '@/shadcn-ui/lib/utils';
import { formatDate } from '@/utils/date';
import { handleNotificationClick } from '@/utils/notification';
import { Guid } from 'guid-typescript';
import { Check, Circle, X } from 'lucide-react';
import NotificationDialog from './NotificationDialog';
import useNotificationStore from '@/stores/useNotificationStore';
import { ScrollArea } from '@/shadcn-ui/components/ui/scroll-area';
import { useNavigate } from 'react-router';
import type { NotificationResponseDto } from '@/types/notification';

interface NotificationListContentProps {
  isMobileOrTablet: boolean;
  setIsMobileDrawerOpen: (isOpen: boolean) => void;
  setSelectedNotification: (
    notification: NotificationResponseDto | null
  ) => void;
  selectedNotification: NotificationResponseDto | null;
}

export default function NotificationListContent({
  isMobileOrTablet,
  setIsMobileDrawerOpen,
  setSelectedNotification,
  selectedNotification,
}: NotificationListContentProps) {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const unreadCount = useNotificationStore((state) => state.unreadCount());
  const nav = useNavigate();

  return (
    <>
      <div className="font-normal p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold leading-none text-foreground">
              Notifications
            </h4>
            <p className="text-xs text-muted-foreground">
              You have {unreadCount} unread update alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  markAllAsRead();
                }}
                className="h-auto text-xs py-1 px-2 text-primary hover:text-primary/90 hover:bg-primary/5"
              >
                <Check className="mr-1 h-3 w-3" /> Mark all read
              </Button>
            )}
            {/* Show an explicit close button on mobile viewports */}
            {isMobileOrTablet && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:hidden"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <DropdownMenuSeparator />

      <ScrollArea className="h-[50vh] sm:h-75">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No new portal updates received.
          </div>
        ) : (
          notifications.map((item) => {
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  markAsRead(Guid.parse(item.id));
                  handleNotificationClick(
                    item,
                    markAsRead,
                    setSelectedNotification
                  );
                }}
                className={cn(
                  'flex items-start gap-3 p-4 cursor-pointer focus:bg-muted/60 transition-colors',
                  !item.isRead && 'bg-primary/5 focus:bg-primary/10'
                )}
              >
                <div className="mt-1 shrink-0">
                  {!item.isRead ? (
                    <Circle className="h-2 w-2 fill-primary text-primary" />
                  ) : (
                    <div className="h-2 w-2" />
                  )}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-normal wrap-break-word whitespace-normal">
                    {item.message}
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </ScrollArea>

      <DropdownMenuSeparator />

      <div className="p-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs font-medium justify-center h-8 text-muted-foreground hover:text-foreground"
          onClick={() => {
            nav(ROUTES.notifications, { replace: true });
          }}
        >
          View all history
        </Button>
      </div>
      <NotificationDialog
        selectedNotification={selectedNotification}
        setSelectedNotification={setSelectedNotification}
      />
    </>
  );
}

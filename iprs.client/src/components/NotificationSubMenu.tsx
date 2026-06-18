import { useState, useEffect } from 'react';
import { BellIcon, Check, Circle, X } from 'lucide-react'; // 🟢 Added X for a mobile close button
import { Button } from '@/shadcn-ui/components/ui/button';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/shadcn-ui/components/ui/dropdown-menu';
import { cn } from '@/shadcn-ui/lib/utils';
import { useNotificationStore } from '@/store/useNotificationStore';
import dayjs from 'dayjs';
import { Guid } from 'guid-typescript';

export default function NotificationSubMenu() {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const unreadCount = useNotificationStore((state) => state.unreadCount());

  const [isMobileOrTablet, setIsMobileOrTablet] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 1023px)').matches;
    }
    return false;
  });

  // 🟢 Local state to handle the native mobile drawer overlay
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const listener = (e: MediaQueryListEvent) => {
      setIsMobileOrTablet(e.matches);
      if (!e.matches) setIsMobileDrawerOpen(false); // Close drawer if resizing up to desktop
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // 📝 SHARED INNER CONTENT: Extracted to prevent repeating layout code
  const notificationListContent = (
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

      <div className="max-h-[50vh] sm:max-h-75 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No new portal updates received.
          </div>
        ) : (
          notifications.map((item) => {
            const createdAt = dayjs(item.createdAt).format(
              'MMM D, YYYY h:mm A'
            );
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  markAsRead(Guid.parse(item.id));
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
                      {createdAt}
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
      </div>

      <DropdownMenuSeparator />

      <div className="p-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs font-medium justify-center h-8 text-muted-foreground hover:text-foreground"
        >
          View all history
        </Button>
      </div>
    </>
  );

  if (isMobileOrTablet) {
    return (
      <>
        {/* Turns the sub-menu trigger into a normal menu link item */}
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()} // Stops parent context menu from snapping shut
          onClick={() => setIsMobileDrawerOpen(true)}
          className="cursor-pointer flex items-center justify-between w-full gap-2 p-2 "
        >
          <div className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />
            <span>Notifications</span>
          </div>
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </DropdownMenuItem>

        {/* Full Viewport App-Style Drawer Overlay */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Click-outside backdrop trap */}
            <div
              className="fixed inset-0"
              onClick={() => setIsMobileDrawerOpen(false)}
            />

            {/* Content Sheet Card */}
            {/* 🟢 Changed from bg-background to bg-popover to match desktop menus exactly */}
            <div className="relative w-full sm:max-w-110 bg-popover rounded-t-xl sm:rounded-xl border border-border shadow-2xl animate-in slide-in-from-bottom-8 duration-300 flex flex-col overflow-hidden pb-2 mb-safe">
              {/* Native Pull Bar indicator */}
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-3 shrink-0" />

              {notificationListContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-2">
          <BellIcon className="h-4 w-4" />
          <span>Notifications</span>
        </div>
        {unreadCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[10px] font-medium text-destructive-foreground animate-pulse">
            {unreadCount}
          </span>
        )}
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent
        className="w-85 p-0 mental-scroll"
        sideOffset={4}
        align="start"
      >
        {notificationListContent}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

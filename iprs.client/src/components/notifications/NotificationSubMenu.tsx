import { useState, useEffect } from 'react';
import { BellIcon } from 'lucide-react';
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/shadcn-ui/components/ui/dropdown-menu';
import useNotificationStore from '@/stores/useNotificationStore';
import NotificationDialog from './NotificationDialog';
import NotificationListContent from './NotificationListContent';
import type { NotificationResponseDto } from '@/types/notification';

export default function NotificationSubMenu() {
  const unreadCount = useNotificationStore((state) => state.unreadCount());

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationResponseDto | null>(null);

  const [isMobileOrTablet, setIsMobileOrTablet] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 1023px)').matches;
    }
    return false;
  });

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const listener = (e: MediaQueryListEvent) => {
      setIsMobileOrTablet(e.matches);
      if (!e.matches) setIsMobileDrawerOpen(false);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  if (isMobileOrTablet) {
    return (
      <>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
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

        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
              className="fixed inset-0"
              onClick={() => setIsMobileDrawerOpen(false)}
            />

            <div className="relative w-full sm:max-w-110 bg-popover rounded-t-xl sm:rounded-xl border border-border shadow-2xl animate-in slide-in-from-bottom-8 duration-300 flex flex-col overflow-hidden pb-2 mb-safe">
              {/* Native Pull Bar indicator */}
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-3 shrink-0" />

              <NotificationListContent
                isMobileOrTablet={isMobileOrTablet}
                setIsMobileDrawerOpen={setIsMobileDrawerOpen}
                selectedNotification={selectedNotification}
                setSelectedNotification={setSelectedNotification}
              />
            </div>
          </div>
        )}

        <NotificationDialog
          selectedNotification={selectedNotification}
          setSelectedNotification={setSelectedNotification}
        />
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
        <NotificationListContent
          isMobileOrTablet={isMobileOrTablet}
          setIsMobileDrawerOpen={setIsMobileDrawerOpen}
          selectedNotification={selectedNotification}
          setSelectedNotification={setSelectedNotification}
        />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

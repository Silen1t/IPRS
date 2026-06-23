import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shadcn-ui/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shadcn-ui/components/ui/dropdown-menu';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shadcn-ui/components/ui/sidebar';
import useAuthStore from '@/stores/useAuthStore';
import useNotificationStore from '@/stores/useNotificationStore';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import {
  EllipsisVerticalIcon,
  LogOutIcon,
} from 'lucide-react';
import NotificationSubMenu from '../notifications/NotificationSubMenu';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const logout = useAuthStore((state) => state.logout);
  const disconnectNotifications = useNotificationStore(
    (state) => state.disconnectSignalR
  );
  const disconnectPurchaseRequests = usePurchaseRequestStore(
    (state) => state.disconnectSignalR
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground elements-upgrade"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>

              {/* Added min-w-0 to prevent text nodes from pushing out parent box widths */}
              <div className="flex flex-col flex-1 min-w-0 text-start text-sm leading-tight">
                <span className="truncate font-medium text-foreground block">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground block">
                  {user.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ms-auto size-4 shrink-0 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0 text-start text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* <DropdownMenuItem>
                <CircleUserRoundIcon className="size-4 mr-2 text-muted-foreground" />
                Account
              </DropdownMenuItem> */}
              <NotificationSubMenu />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              onClick={() => {
                disconnectNotifications();
                disconnectPurchaseRequests();
                logout();
              }}
            >
              <LogOutIcon className="size-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

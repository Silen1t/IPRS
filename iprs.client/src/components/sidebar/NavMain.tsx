import RoleGuard from '@/components/auth/RoleGuard';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shadcn-ui/components/ui/sidebar';
import { UserRole } from '@/types/enums';
import { File } from 'lucide-react';
import { Fragment } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES, type NavItem } from '@/config/routes';
import MenuItemContent from '@/components/sidebar/MenuItemContent';
import useNotificationStore from '@/stores/useNotificationStore';

export function NavMain({ items }: { items: NavItem[] }) {
  const nav = useNavigate();
  const unreadCount = useNotificationStore((state) => state.unreadCount());
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <RoleGuard allowedRoles={[UserRole.Employee]}>
            <SidebarMenuItem
              className="flex items-center gap-2"
              onClick={() => nav(ROUTES.requests.create)}
            >
              <SidebarMenuButton
                tooltip="Quick Create"
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              >
                <File />
                <span>Create Request</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </RoleGuard>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            if (item.roles && item.roles.length > 0) {
              return (
                <RoleGuard key={item.title} allowedRoles={item.roles}>
                  <MenuItemContent item={item} nav={nav} />
                </RoleGuard>
              );
            } else if (item.url == ROUTES.notifications) {
              return (
                <Fragment key={item.title}>
                  <MenuItemContent
                    item={item}
                    nav={nav}
                    children={
                      unreadCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[10px] font-medium text-destructive-foreground animate-pulse">
                          {unreadCount}
                        </span>
                      )
                    }
                  />
                </Fragment>
              );
            }
            return (
              <Fragment key={item.title}>
                <MenuItemContent item={item} nav={nav} />
              </Fragment>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

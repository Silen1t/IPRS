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

export function NavMain({ items }: { items: NavItem[] }) {
  const nav = useNavigate();
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

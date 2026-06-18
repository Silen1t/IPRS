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

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    roles?: UserRole[] | null;
  }[];
}) {
  const nav = useNavigate();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <RoleGuard allowedRoles={[UserRole.Employee]}>
            <SidebarMenuItem className="flex items-center gap-2">
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
            const menuItemContent = (
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => nav(item.url, { replace: true })}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
            if (item.roles && item.roles.length > 0) {
              return (
                <RoleGuard key={item.title} allowedRoles={item.roles}>
                  {menuItemContent}
                </RoleGuard>
              );
            }
            return <Fragment key={item.title}>{menuItemContent}</Fragment>;
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

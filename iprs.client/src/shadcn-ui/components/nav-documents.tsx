'use client';
import RoleGuard from '@/components/auth/RoleGuard';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shadcn-ui/components/ui/sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/types/enums';
import { Fragment } from 'react';
import { useNavigate } from 'react-router';

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon?: React.ReactNode;
    roles?: UserRole[] | null;
  }[];
}) {
  const userRole = useAuthStore((state) => state.role);
  const nav = useNavigate();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{userRole}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const menuItem = (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                onClick={() => nav(item.url, { replace: true })}
              >
                <div>
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
          if (item.roles != null) {
            return (
              <RoleGuard allowedRoles={item.roles} key={item.name}>
                {menuItem}
              </RoleGuard>
            );
          }

          return <Fragment key={item.name}>{menuItem}</Fragment>;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

'use client';
import RoleGuard from '@/components/auth/RoleGuard';
import MenuItemContent from '@/components/sidebar/MenuItemContent';
import type { NavItem } from '@/config/routes';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/shadcn-ui/components/ui/sidebar';
import useAuthStore  from '@/stores/useAuthStore';
import { Fragment } from 'react';
import { useNavigate } from 'react-router';

export function NavDocuments({ items }: { items: NavItem[] }) {
  const userRole = useAuthStore((state) => state.role);
  const nav = useNavigate();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{userRole}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.roles != null) {
            return (
              <RoleGuard allowedRoles={item.roles} key={item.title}>
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
    </SidebarGroup>
  );
}

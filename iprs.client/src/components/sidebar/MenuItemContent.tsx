import type { NavItem } from '@/config/routes';
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shadcn-ui/components/ui/sidebar';
import type { ReactNode } from 'react';
import type { NavigateFunction } from 'react-router';

export default function MenuItemContent({
  item,
  nav,
  children,
}: {
  item: NavItem;
  nav: NavigateFunction;
  children?: ReactNode;
}) {
  const IconComponent = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        onClick={() => nav(item.url, { replace: true })}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent />
            <span>{item.title}</span>
          </div>
          {children}
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

import type { NavItem } from '@/config/routes';
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shadcn-ui/components/ui/sidebar';
import type { NavigateFunction } from 'react-router';

export default function MenuItemContent({
  item,
  nav,
}: {
  item: NavItem;
  nav: NavigateFunction;
}) {
  const IconComponent = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        onClick={() => nav(item.url, { replace: true })}
      >
        <div>
          <IconComponent />
          <span>{item.title}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

import * as React from 'react';
import { NavDocuments } from '@/components/sidebar/NavRoles';
import { NavMain } from '@/components/sidebar/NavMain';
import { NavUser } from '@/components/sidebar/NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shadcn-ui/components/ui/sidebar';
import {
  LayersIcon,
} from 'lucide-react';

import { useAuthStore } from '@/stores/useAuthStore';
import { UserRole } from '@/types/enums';
import { SIDEBAR_CONFIG } from '@/config/routes';

interface Props extends React.ComponentProps<typeof Sidebar> {
  userRole: UserRole | null;
}

export function AppSidebar({ userRole, ...props }: Props) {
  const { fullName, employeeId} = useAuthStore();

  const config = SIDEBAR_CONFIG;

  const filteredNavMain = config.navMain.filter(
    (item) =>
      !item.roles || (userRole && (item.roles as UserRole[]).includes(userRole))
  );

  const filteredDocuments = config.roles.filter(
    (doc) =>
      !doc.roles || (userRole && (doc.roles as UserRole[]).includes(userRole))
  );

  const currentUser = {
    name: fullName || 'Employee Account',
    email: employeeId ? `ID: ${employeeId}` : 'IPRS Portal User',
    avatar: '',
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <LayersIcon className="size-5!" />
                <span className="text-base font-semibold">IPRS Portal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavDocuments items={filteredDocuments} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}

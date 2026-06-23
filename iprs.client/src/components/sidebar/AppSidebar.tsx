import { NavDocuments } from '@/components/sidebar/NavRoles';
import { NavMain } from '@/components/sidebar/NavMain';
import { NavUser } from '@/components/sidebar/NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shadcn-ui/components/ui/sidebar';
import { LayersIcon } from 'lucide-react';

import useAuthStore from '@/stores/useAuthStore';
import { UserRole } from '@/types/enums';
import { SIDEBAR_CONFIG } from '@/config/routes';
import type { ComponentProps } from 'react';

interface Props extends ComponentProps<typeof Sidebar> {
  userRole: UserRole | null;
}

export default function AppSidebar({ userRole, ...props }: Props) {
  const { fullName, employeeId } = useAuthStore();

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

      {/* Structured flex layout container inside SidebarContent */}
      <SidebarContent className="flex flex-col justify-between h-full min-h-0 overflow-hidden">
        {/* Scrollable menu links area */}
        <div className="flex-1 overflow-y-auto">
          <NavMain items={filteredNavMain} />
          <NavDocuments items={filteredDocuments} />
        </div>

        {/* Pinned profile container block at the bottom of the content stack */}
        <div className="shrink-0 p-2 border-t border-sidebar-border bg-sidebar sticky bottom-0 z-10">
          <NavUser user={currentUser} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
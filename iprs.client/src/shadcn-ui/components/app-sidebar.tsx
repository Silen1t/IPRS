import * as React from 'react';
import { NavDocuments } from '@/shadcn-ui/components/nav-documents';
import { NavMain } from '@/shadcn-ui/components/nav-main';
import { NavUser } from '@/shadcn-ui/components/nav-user';
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
  LayoutDashboardIcon,
  UsersIcon,
  FileChartColumnIcon,
  LayersIcon,
  Files,
} from 'lucide-react';

// 🟢 Import your global state engine and roles enum
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/enums';

// ⚙️ NAVIGATION DATA CONFIGURATION
// Added an optional 'roles' array to any item that needs protection
const sidebarData = {
  navMain: [
    {
      title: 'Dashboard',
      url: 'dashboard',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'Department Requests',
      url: 'Department',
      icon: <UsersIcon />,
      roles: [UserRole.Manager],
    },
  ],

  documents: [
    {
      name: 'My Requests',
      url: 'my-requests',
      icon: <Files />,
      roles: [UserRole.Employee],
    },
    {
      name: 'Reports',
      url: 'reports',
      icon: <FileChartColumnIcon />,
      roles: [UserRole.Admin],
    },
  ],
};

interface Props extends React.ComponentProps<typeof Sidebar> {
  userRole: UserRole | null;
}

export function AppSidebar({ userRole, ...props }: Props) {
  const { fullName, employeeId } = useAuthStore();

  const filteredNavMain = sidebarData.navMain.filter(
    (item) =>
      !item.roles || (userRole && (item.roles as UserRole[]).includes(userRole))
  );

  const filteredDocuments = sidebarData.documents.filter(
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
      {/* SIDEBAR HEADER BRANDING */}
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

      {/* SIDEBAR NAVIGATION CONTENT AREA */}
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavDocuments items={filteredDocuments} />
      </SidebarContent>

      {/* SIDEBAR USER FOOTER INTERACTION ACCORDION */}
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}

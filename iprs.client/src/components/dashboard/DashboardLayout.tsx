

import { type CSSProperties } from 'react';
import { Outlet } from 'react-router';
import { SiteHeader } from '@/components/sidebar/SiteHeader';
import {
  SidebarInset,
  SidebarProvider,
} from '@/shadcn-ui/components/ui/sidebar';
import AppSidebar from '@/components/sidebar/AppSidebar';
import useAppInitialization from '@/hooks/useAppInitialization';

export default function DashboardLayout() {
  const { role, isAuthenticated } = useAppInitialization();

  if (!isAuthenticated) {
    return <div>Loading session validation...</div>;
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" userRole={role} />

      <SidebarInset>
        <SiteHeader />

        <main className="flex flex-1 flex-col overflow-y-auto bg-muted/10 p-4 md:p-6">
          <div className="@container/main max-w-7xl mx-auto w-full space-y-6">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

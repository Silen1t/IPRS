import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AppSidebar } from '@/shadcn-ui/components/app-sidebar';
import { SiteHeader } from '@/shadcn-ui/components/site-header';
import {
  SidebarInset,
  SidebarProvider,
} from '@/shadcn-ui/components/ui/sidebar';
import { getAllNotifications } from '@/services/notificationService';

export default function DashboardLayout() {
  const { initSignalR, initNotifications } = useNotificationStore();
  const disconnectSignalR = useNotificationStore(
    (state) => state.disconnectSignalR
  );
  const role = useAuthStore((state) => state.role);

  // 🚀 Maintain the live WebSocket handshake globally within the authenticated wrapper
  useEffect(() => {
    const getNotifgications = async () => {
      const data = await getAllNotifications();
      initNotifications(data);
    };
    getNotifgications();
  }, [initNotifications]);
  
  useEffect(() => {
    initSignalR();
    return () => disconnectSignalR();
  }, [initSignalR, disconnectSignalR]);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      {/* Pass the role to the sidebar so it can hide/show restricted tabs */}
      <AppSidebar variant="inset" userRole={role} />

      <SidebarInset>
        <SiteHeader />

        {/* 💻 DYNAMIC MAIN VIEWPORT */}
        <main className="flex flex-1 flex-col overflow-y-auto bg-muted/10 p-4 md:p-6">
          <div className="@container/main max-w-7xl mx-auto w-full space-y-6">
            {/* React Router safely injects Pages*/}
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

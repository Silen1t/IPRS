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
import { usePurchaseRequestStore } from '@/store/usePurchaseRequestStore';

export default function DashboardLayout() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  const initNotifications = useNotificationStore(
    (state) => state.initNotifications
  );
  const initNotificationSignalR = useNotificationStore(
    (state) => state.initSignalR
  );
  const disconnectNotificationSignalR = useNotificationStore(
    (state) => state.disconnectSignalR
  );

  const initPurchaseRequests = usePurchaseRequestStore(
    (state) => state.initPurchaseRequests
  ); 
  const initRequestSignalR = usePurchaseRequestStore(
    (state) => state.initSignalR
  );
  const disconnectRequestSignalR = usePurchaseRequestStore(
    (state) => state.disconnectSignalR
  );

  useEffect(() => {
    if (!token) return;

    initNotifications();
    initPurchaseRequests();

  }, [token, initNotifications, initPurchaseRequests]);

  useEffect(() => {
    if (!token) return;

    initNotificationSignalR(token);
    initRequestSignalR(token);

    return () => {
      disconnectNotificationSignalR();
      disconnectRequestSignalR();
    };
  }, [
    token,
    initNotificationSignalR,
    initRequestSignalR,
    disconnectNotificationSignalR,
    disconnectRequestSignalR,
  ]);

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

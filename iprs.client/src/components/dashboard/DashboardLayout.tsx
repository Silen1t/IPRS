import { type CSSProperties } from 'react';
import { Navigate, Outlet } from 'react-router';
import { SiteHeader } from '@/components/sidebar/SiteHeader';
import {
  SidebarInset,
  SidebarProvider,
} from '@/shadcn-ui/components/ui/sidebar';
import AppSidebar from '@/components/sidebar/AppSidebar';
import useAppInitialization from '@/hooks/useAppInitialization';
import { ROUTES } from '@/config/routes';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import SessionExtensionDialog from '@/components/auth/SessionExtensionDialog';

export default function DashboardLayout() {
  const { role, isAuthenticated } = useAppInitialization();
  const {
    showWarning,
    handleExtendSession,
    handleLogout,
    warningDurationSeconds,
  } = useSessionTimeout();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.errors.forbidden} />;
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

      <SessionExtensionDialog
        key={showWarning ? 'session-modal-active' : 'session-modal-idle'}
        isOpen={showWarning}
        onExtend={handleExtendSession}
        onLogout={handleLogout}
        warningDurationSeconds={warningDurationSeconds}
      />
    </SidebarProvider>
  );
}

import { useEffect} from 'react';
import { Outlet } from 'react-router';
import useNotificationStore from '@/stores/useNotificationStore';
import useAuthStore  from '@/stores/useAuthStore';
import { SiteHeader } from '@/components/sidebar/SiteHeader';
import {
  SidebarInset,
  SidebarProvider,
} from '@/shadcn-ui/components/ui/sidebar';
import usePurchaseRequestStore  from '@/stores/usePurchaseRequestStore';
import useCategoryStore from '@/stores/useCategoryStore';
import  useDashboardStore from '@/stores/useDashboardStore';
import useDepartmentStore from '@/stores/useDepartmentStore';
import useUserStore  from '@/stores/useUserStore';
import { UserRole } from '@/types/enums';
import { useSignalROrchestrator } from '@/hooks/useSignalROrchestrator';
import { AppSidebar } from './sidebar/AppSidebar';

export default function DashboardLayout() {
  useSignalROrchestrator();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  const initNotifications = useNotificationStore(
    (state) => state.initNotifications
  );

  const initPurchaseRequests = usePurchaseRequestStore(
    (state) => state.initPurchaseRequests
  );

  const fetchDepartments = useDepartmentStore(
    (state) => state.fetchDepartments
  );
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const fetchProfile = useUserStore((state) => state.fetchProfile);
  const fetchUsers = useUserStore((state) => state.fetchUsers);
  const fetchMetrics = useDashboardStore((state) => state.fetchMetrics);


  useEffect(() => {
    if (!token) return;

    initNotifications();
    initPurchaseRequests();
    fetchProfile();
    fetchCategories();
    fetchDepartments();
    fetchMetrics();

    if (role === UserRole.Admin) {
      fetchUsers();
    }
  }, [
    token,
    role,
    initNotifications,
    initPurchaseRequests,
    fetchProfile,
    fetchCategories,
    fetchDepartments,
    fetchMetrics,
    fetchUsers,
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

import { useEffect } from 'react';
import useAuthStore from '@/stores/useAuthStore';
import useNotificationStore from '@/stores/useNotificationStore';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import useDashboardStore from '@/stores/useDashboardStore';
import useDepartmentStore from '@/stores/useDepartmentStore';
import useCategoryStore from '@/stores/useCategoryStore';
import useUserStore from '@/stores/useUserStore';
import { UserRole } from '@/types/enums';
import useSignalROrchestrator from './useSignalROrchestrator';

export default function useAppInitialization() {
  useSignalROrchestrator();

  const role = useAuthStore((state) => state.role);
  const token = useAuthStore((state) => state.token);

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
  const fetchStats = useDashboardStore((state) => state.fetchStats);

  useEffect(() => {
    // Prevent execution if user is unauthenticated
    if (!token) return;

    // Run core cross-role state hydration concurrently
    initNotifications();
    initPurchaseRequests();
    fetchProfile();
    fetchCategories();
    fetchDepartments();
    fetchStats();

    // Contextually load admin-specific collections
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
    fetchStats,
    fetchUsers,
  ]);

  // Return the current authentication and configuration state flags for structural usage if needed
  return { token, role, isAuthenticated: !!token };
}

import useAuthStore from '@/stores/useAuthStore';
import useNotificationStore from '@/stores/useNotificationStore';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import useUserStore from '@/stores/useUserStore';
import useDashboardStore from '@/stores/useDashboardStore';
import useCategoryStore from '@/stores/useCategoryStore';
import useDepartmentStore from '@/stores/useDepartmentStore';
import { useEffect, useRef } from 'react';

export default function useSignalROrchestrator() {
  const token = useAuthStore((state) => state.token);

  // Notification Hub bindings
  const initNotificationHub = useNotificationStore(
    (state) => state.initSignalR
  );
  const disconnectNotificationHub = useNotificationStore(
    (state) => state.disconnectSignalR
  );

  // Purchase Request Hub bindings
  const initRequestHub = usePurchaseRequestStore((state) => state.initSignalR);
  const disconnectRequestHub = usePurchaseRequestStore(
    (state) => state.disconnectSignalR
  );

  // Users Hub bindings
  const initUserHub = useUserStore((state) => state.initSignalR);
  const disconnectUserHub = useUserStore((state) => state.disconnectSignalR);


  // Dashboard Hub bindings
  const initDashboardHub = useDashboardStore((state) => state.initSignalR);
  const disconnectDashboardHub = useDashboardStore(
    (state) => state.disconnectSignalR
  );

  // Category Hub bindings
  const initCategoryHub = useCategoryStore((state) => state.initSignalR);
  const disconnectCategoryHub = useCategoryStore(
    (state) => state.disconnectSignalR
  );

  // Department Hub bindings
  const initDepartmentHub = useDepartmentStore((state) => state.initSignalR);
  const disconnectDepartmentHub = useDepartmentStore(
    (state) => state.disconnectSignalR
  );

  const processedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      if (processedTokenRef.current) {
        disconnectNotificationHub();
        disconnectRequestHub();
        disconnectUserHub();
        disconnectDashboardHub();
        disconnectCategoryHub();
        disconnectDepartmentHub();
        processedTokenRef.current = null;
      }
      return;
    }

    if (processedTokenRef.current === token) return;
    processedTokenRef.current = token;

    initNotificationHub(token);
    initRequestHub(token);
    initUserHub(token);
    initDashboardHub(token);
    initCategoryHub(token);
    initDepartmentHub(token);

    return () => {
      processedTokenRef.current = null;
      disconnectNotificationHub();
      disconnectRequestHub();
      disconnectUserHub();
      disconnectDashboardHub();
      disconnectCategoryHub();
      disconnectDepartmentHub();
    };
  }, [
    token,
    initNotificationHub,
    disconnectNotificationHub,
    initRequestHub,
    disconnectRequestHub,
    initUserHub,
    disconnectUserHub,
    initDashboardHub,
    disconnectDashboardHub,
    initCategoryHub,
    disconnectCategoryHub,
    initDepartmentHub,
    disconnectDepartmentHub,
  ]);
}

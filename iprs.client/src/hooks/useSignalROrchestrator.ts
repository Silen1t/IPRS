import useAuthStore  from '@/stores/useAuthStore';
import useNotificationStore from '@/stores/useNotificationStore';
import usePurchaseRequestStore  from '@/stores/usePurchaseRequestStore';
import { useEffect, useRef } from 'react';

export default function useSignalROrchestrator() {
  const token = useAuthStore((state) => state.token);

  // Notification Hub bindings
  const initNotificationHub = useNotificationStore((state) => state.initSignalR);
  const disconnectNotificationHub = useNotificationStore((state) => state.disconnectSignalR);

  // Purchase Request Hub bindings
  const initRequestHub = usePurchaseRequestStore((state) => state.initSignalR);
  const disconnectRequestHub = usePurchaseRequestStore((state) => state.disconnectSignalR);

  // Prevent overlapping socket initializations on fast remounts
  const processedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      if (processedTokenRef.current) {
        disconnectNotificationHub();
        disconnectRequestHub();
        processedTokenRef.current = null;
      }
      return;
    }

    if (processedTokenRef.current === token) return;
    processedTokenRef.current = token;

    initNotificationHub(token);
    initRequestHub(token);

    return () => {
      processedTokenRef.current = null;
      disconnectNotificationHub();
      disconnectRequestHub();
    };
  }, [
    token,
    initNotificationHub,
    disconnectNotificationHub,
    initRequestHub,
    disconnectRequestHub,
  ]);
}
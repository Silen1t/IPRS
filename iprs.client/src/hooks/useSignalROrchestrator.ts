import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import usePurchaseRequestStore  from '@/stores/usePurchaseRequestStore';
import { useEffect, useRef } from 'react';

export function useSignalROrchestrator() {
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
    // 1. Handle Logout / No Token state
    if (!token) {
      if (processedTokenRef.current) {
        disconnectNotificationHub();
        disconnectRequestHub();
        processedTokenRef.current = null;
      }
      return;
    }

    // 2. Prevent duplicate startup if already connected to this token
    if (processedTokenRef.current === token) return;
    processedTokenRef.current = token;

    // 3. Initialize secure connections
    initNotificationHub(token);
    initRequestHub(token);

    // 4. Graceful cleanup on unmount
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
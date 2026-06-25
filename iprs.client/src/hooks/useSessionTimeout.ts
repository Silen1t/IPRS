import { useEffect, useState, useCallback, useMemo } from 'react';
import useAuthStore from '@/stores/useAuthStore';
import { ROUTES } from '@/config/routes';

export function useSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const refreshAuth = useAuthStore((state) => state.refreshAuth);
  const getSessionDurationMs = useAuthStore((state) => state.getSessionDurationMs);

  const SESSION_DURATION_MS = useMemo(
    () => getSessionDurationMs(),
    [getSessionDurationMs] 
  );

  const WARNING_BUFFER_MS = 5 * 60 * 1000;

  //Exact timeout target (e.g., 45m - 5m = 40m)
  const TIMEOUT_TRIGGER_MS = useMemo(() => {
    const trigger = SESSION_DURATION_MS - WARNING_BUFFER_MS;
    return trigger > 0 ? trigger : 0; 
  }, [SESSION_DURATION_MS, WARNING_BUFFER_MS]);

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    logout();
    window.location.href = ROUTES.errors.sessionExpired;
  }, [logout]);

  const handleExtendSession = useCallback(async () => {
    try {
      const status = await refreshAuth();
      if (status === 200) {
        setShowWarning(false);
      }
    } catch (error) {
      console.error(
        'Critical failure during silent renewal token sync pass.',
        error
      );
      handleLogout();
    }
  }, [handleLogout, refreshAuth]);

  
  useEffect(() => {
    if (!token) return;

    const warningTimerId = setTimeout(() => {
      setShowWarning(true);
    }, TIMEOUT_TRIGGER_MS);

    return () => {
      clearTimeout(warningTimerId);
    };
  }, [token, TIMEOUT_TRIGGER_MS]);

  return {
    showWarning: token ? showWarning : false,
    handleExtendSession,
    handleLogout,
    warningDurationSeconds: WARNING_BUFFER_MS / 1000,
  };
}
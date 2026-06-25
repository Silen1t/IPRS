import { Hammer, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/config/routes';
import { api } from '@/services/api';

export default function MaintenancePage() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkSystemStatus = async () => {
      setIsChecking(true);
      try {
        const response = await api.get('/health');

        if (response.status === 200) {
          navigate(ROUTES.dashboard.home, { replace: true });
        }
      } catch {
        console.log('System is still undergoing maintenance...');
      } finally {
        setTimeout(() => setIsChecking(false), 800);
      }
    };

    checkSystemStatus();

    const intervalId = setInterval(checkSystemStatus, 5000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 text-center select-none">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 mb-6 shadow-sm animate-bounce">
        <Hammer className="h-9 w-9" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Under Scheduled Maintenance
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        We are optimizing database indexes and updating the platform
        architecture framework. Normal tracking services will be restored
        shortly.
      </p>

      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground font-medium border">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System Engineering Node: Online
        </div>

        {/* Subtle polling sync status display */}
        <div className="flex items-center gap-1.5 min-h-6 text-[11px] text-muted-foreground/60 transition-opacity duration-300">
          <RefreshCw
            className={`size-3 ${isChecking ? 'animate-spin text-amber-500' : ''}`}
          />
          {isChecking
            ? 'Checking operational stream...'
            : 'Auto-checking system status every 5s'}
        </div>
      </div>
    </div>
  );
}

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/shadcn-ui/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/config/routes';

export default function NetworkErrorPage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const nav = useNavigate();
  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      nav(ROUTES.dashboard.home);
    }, 1000);
  };

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 text-center select-none">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted border border-border text-muted-foreground mb-6 shadow-sm">
        <WifiOff className="h-9 w-9" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Connection Lost
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        Unable to communicate with the central API data stream layer. Please
        verify your connection status or try again shortly.
      </p>

      <div className="mt-8">
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          className="h-9 px-4 text-xs font-semibold gap-1.5 border border-dashed bg-background hover:bg-accent text-foreground shadow-sm"
        >
          <RefreshCw
            className={`size-3.5 ${isRetrying ? 'animate-spin' : ''}`}
          />
          {isRetrying ? 'Checking connection...' : 'Retry Connection'}
        </Button>
      </div>
    </div>
  );
}

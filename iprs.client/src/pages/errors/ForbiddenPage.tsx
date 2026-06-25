import { ShieldX, Home } from 'lucide-react';
import { Button } from '@/shadcn-ui/components/ui/button';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/config/routes';

export default function ForbiddenPage() {
  const nav = useNavigate();
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 text-center select-none">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 text-destructive mb-6 shadow-sm animate-pulse">
        <ShieldX className="h-10 w-10" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Access Denied
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        Your current system access role does not possess the permissions
        required to view this administrative context link.
      </p>

      <div className="mt-8">
        <Button
          onClick={() => nav(ROUTES.dashboard.home)}
          className="h-9 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shadow-sm"
        >
          <Home className="size-3.5" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}

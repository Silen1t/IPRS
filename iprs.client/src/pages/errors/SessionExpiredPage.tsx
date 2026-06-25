import { LogIn, KeyRound } from 'lucide-react';
import { Button } from '@/shadcn-ui/components/ui/button';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/config/routes';

export default function SessionExpiredPage() {
  const nav = useNavigate();
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 text-center select-none">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 mb-6 shadow-sm">
        <KeyRound className="h-9 w-9" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Session Expired
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        For your security, your login token expired due to a period of system
        inactivity. Please sign back into your security profile.
      </p>

      <div className="mt-8">
        <Button
          onClick={() => (nav(ROUTES.auth.login))}
          className="h-9 px-4 text-xs font-semibold bg-amber-500 text-black hover:bg-amber-600 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-neutral-950 gap-1.5 shadow-sm"
        >
          <LogIn className="size-3.5" />
          Log In Again
        </Button>
      </div>
    </div>
  );
}

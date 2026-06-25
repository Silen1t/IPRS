import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shadcn-ui/components/ui/dialog';
import { Button } from '@/shadcn-ui/components/ui/button';
import { Clock, LogOut, RefreshCw } from 'lucide-react';

interface SessionExtensionDialogProps {
  isOpen: boolean;
  onExtend: () => Promise<void>;
  onLogout: () => void;
  warningDurationSeconds: number;
}

export default function SessionExtensionDialog({
  isOpen,
  onExtend,
  onLogout,
  warningDurationSeconds,
}: SessionExtensionDialogProps) {
  const [timeLeft, setTimeLeft] = useState(warningDurationSeconds);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExtendClick = async () => {
    setIsSubmitting(true);
    try {
      await onExtend();
    } catch (error) {
      console.error('Failed to extend session validation pool context', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        /* Lock closing via clicking outside */
      }}
    >
      <DialogContent className="sm:max-w-105 select-none border border-border/60">
        <DialogHeader className="flex flex-col items-center text-center pt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-3 border border-amber-500/20 shadow-sm">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Security Session Expiring
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1 max-w-[320px]">
            Your data tracking environment has been inactive. Your access token
            context will auto-expire in:
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 flex items-center justify-center py-3 bg-muted/40 rounded-lg border border-dashed border-border text-center font-mono text-3xl font-bold tracking-widest text-amber-500 dark:text-yellow-400">
          {formatTime(timeLeft)}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={onLogout}
            disabled={isSubmitting}
            className="w-full sm:flex-1 h-9 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-3.5" />
            Log Out Now
          </Button>

          <Button
            type="button"
            onClick={handleExtendClick}
            disabled={isSubmitting}
            className="w-full sm:flex-1 h-9 text-xs font-semibold bg-amber-500 text-black hover:bg-amber-600 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-neutral-950 gap-1.5 shadow-sm"
          >
            <RefreshCw
              className={`size-3.5 ${isSubmitting ? 'animate-spin' : ''}`}
            />
            Extend Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

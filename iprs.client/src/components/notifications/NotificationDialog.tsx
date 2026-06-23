import { ROUTES } from '@/config/routes';
import type { NotificationResponseDto } from '@/schemas/notification';
import { Button } from '@/shadcn-ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn-ui/components/ui/dialog';
import { formatDate } from '@/utils/date';
import { useNavigate } from 'react-router';

export default function NotificationDialog({
  selectedNotification,
  setSelectedNotification,
}: {
  selectedNotification: NotificationResponseDto | null;
  setSelectedNotification: (
    notification: NotificationResponseDto | null
  ) => void;
}) {
  const nav = useNavigate();
  return (
    <Dialog
      open={!!selectedNotification}
      onOpenChange={(open: boolean) => !open && setSelectedNotification(null)}
    >
      {selectedNotification && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Notification Details
            </DialogTitle>
          </DialogHeader>

          {/* Content Display Body */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border/60 my-2">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {selectedNotification.message}
            </p>
            <span className="block mt-3 text-[10px] font-mono text-muted-foreground">
              Received: {formatDate(selectedNotification.createdAt)}
            </span>
          </div>

          {/* Interactive Conditional Actions Footer */}
          <DialogFooter className="sm:justify-end gap-2 pt-2 border-t border-border/40">
            {selectedNotification.relatedRequestId ? (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground self-start sm:self-center">
                  <span>Ref:</span>
                  <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/40">
                    REQ-
                    {selectedNotification.relatedRequestId
                      .toString()
                      .slice(0, 8)
                      .toUpperCase()}
                  </span>
                </div>

                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    nav(
                      `${ROUTES.requests.detail(selectedNotification.relatedRequestId)}`,
                      { replace: true }
                    );
                    setSelectedNotification(null);
                  }}
                >
                  Go to Request Details &rarr;
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setSelectedNotification(null)}
              >
                Dismiss Window
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

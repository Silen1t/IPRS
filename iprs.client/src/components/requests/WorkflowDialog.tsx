import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { UserRole, WorkflowAction } from '@/types/enums';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shadcn-ui/components/ui/dialog';

interface WorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeAction: WorkflowAction | null;
  role: UserRole | null;
  requestNumber: string;
  onSubmit: (data: { poNumber?: string; note?: string }) => Promise<void>;
}

interface WorkflowFormInputs {
  poNumber: string;
  note: string;
}

export default function WorkflowDialog({
  isOpen,
  onClose,
  activeAction,
  role,
  requestNumber,
  onSubmit,
}: WorkflowDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkflowFormInputs>({
    defaultValues: {
      poNumber: '',
      note: '',
    },
  });

  const isFinanceApproval =
    activeAction === WorkflowAction.Approve_Finance && role === UserRole.Finance;
  const isRejection = activeAction === WorkflowAction.Reject;
  const isApproval =
    activeAction === WorkflowAction.Approve_Manager ||
    activeAction === WorkflowAction.Approve_Finance;

  // Sync and clear form states when modal visibility or actions flip
  useEffect(() => {
    if (isOpen) {
      reset({ poNumber: '', note: '' });
    }
  }, [isOpen, activeAction, reset]);

  const handleFormSubmit = async (data: WorkflowFormInputs) => {
    setSubmitting(true);
    try {
      await onSubmit({
        poNumber: isFinanceApproval ? data.poNumber.trim() : undefined,
        note: data.note.trim() ? data.note.trim() : undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to commit workflow transaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {isApproval ? 'Confirm Authorization' : 'Reject Purchase Request'}
          </DialogTitle>
          <DialogDescription>
            Processing updates for request ref:{' '}
            <span className="font-mono font-semibold text-foreground">
              {requestNumber}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Bind form submission to React Hook Form handler */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          
          {/* Conditional PO Input for Finance Approvals */}
          {isFinanceApproval && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Purchase Order (PO) Number{' '}
                <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., PO-2026-9042"
                className={`w-full text-sm px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                  errors.poNumber ? 'border-destructive focus:ring-destructive' : 'border-input'
                }`}
                {...register('poNumber', {
                  validate: (value) => {
                    if (isFinanceApproval && (!value || !value.trim())) {
                      return 'A valid PO number is required for finance release.';
                    }
                    return true;
                  },
                })}
              />
              {errors.poNumber && (
                <p className="text-xs font-medium text-destructive">{errors.poNumber.message}</p>
              )}
            </div>
          )}

          {/* Justification note input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Notes {isRejection && <span className="text-destructive">*</span>}
            </label>
            <textarea
              placeholder={
                isApproval
                  ? 'Add an optional review comment...'
                  : 'A justification note is strictly required...'
              }
              className={`w-full text-sm p-3 rounded-lg border bg-background resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                errors.note ? 'border-destructive focus:ring-destructive' : 'border-input'
              }`}
              {...register('note', {
                validate: (value) => {
                  if (isRejection && (!value || !value.trim())) {
                    return 'A justification reason must be filled out for rejections.';
                  }
                  return true;
                },
              })}
            />
            {errors.note && (
              <p className="text-xs font-medium text-destructive">{errors.note.message}</p>
            )}
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-1.5 shadow-sm transition-colors ${
                isApproval
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-destructive hover:bg-destructive/90'
              }`}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isApproval ? 'Commit Approval' : 'Reject Request'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
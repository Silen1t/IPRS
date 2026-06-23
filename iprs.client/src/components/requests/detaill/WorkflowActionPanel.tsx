// Components/WorkflowActionPanel.tsx
import { useState } from 'react';
import { ShieldCheck, FileEdit, Trash2 } from 'lucide-react';
import { PurchaseRequestStatus, WorkflowAction } from '@/types/enums';
import { Button } from '@/shadcn-ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shadcn-ui/components/ui/card';
import { Input } from '@/shadcn-ui/components/ui/input';
import { Textarea } from '@/shadcn-ui/components/ui/textarea';
import { Label } from '@/shadcn-ui/components/ui/label';
import type { WorkflowPayload } from '@/hooks/useRequestDetailsWorkflow';
import { toast } from 'sonner';

interface WorkflowActionPanelProps {
  status: PurchaseRequestStatus;
  isAuthorizedForAction: boolean;
  onActionSubmit: (
    actionType: WorkflowAction,
    payload?: WorkflowPayload
  ) => Promise<boolean>;
}

export default function WorkflowActionPanel({
  status,
  isAuthorizedForAction,
  onActionSubmit,
}: WorkflowActionPanelProps) {
  const [note, setNote] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDraftState = status === PurchaseRequestStatus.Draft;

  const handleSubmit = async (approve: boolean) => {
    setIsSubmitting(true);
    try {
      if (!approve) {
        if (!note || !note.trim()) {
          toast.error(
            'A justification note is required to reject this request.'
          );
          setIsSubmitting(false);
          return;
        }

        const success = await onActionSubmit(WorkflowAction.Reject, { note });
        if (success) {
          toast.success('Request rejected successfully.');
          setNote('');
        }
        return;
      }

      if (status === PurchaseRequestStatus.Pending_Manager && approve) {
        const success = await onActionSubmit(WorkflowAction.Approve_Manager, {
          note,
        });
        if (success) setNote('');
        return;
      } else if (status === PurchaseRequestStatus.Pending_Finance && approve) {
        if (!poNumber.trim()) {
          toast.error(
            'Compliance Requirement: A valid Purchase Order (PO) number is required for Finance approval.'
          );
          setIsSubmitting(false);
          return;
        }
        const success = await onActionSubmit(WorkflowAction.Approve_Finance, {
          note,
          purchaseOrderNumber: poNumber,
        });
        if (success) {
          setNote('');
          setPoNumber('');
        }
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraftAction = async (action: WorkflowAction) => {
    setIsSubmitting(true);
    try {
      if (action === WorkflowAction.Cancel) {
        await onActionSubmit(WorkflowAction.Cancel);
      } else {
        await onActionSubmit(WorkflowAction.Edit);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDraftState) {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5 shadow-md overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
            <FileEdit className="h-4 w-4 text-amber-500" />
            Modify Draft Request
          </CardTitle>
          <CardDescription className="text-xs">
            This request has not yet been submitted to the workflow queue. You
            can modify its contents or delete it entirely.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col sm:flex-row gap-2 border-t border-border/40 pt-4 bg-muted/20">
          <Button
            variant="destructive"
            size="sm"
            className="w-full sm:w-1/2 font-semibold gap-1.5"
            disabled={isSubmitting}
            onClick={() => handleDraftAction(WorkflowAction.Cancel)}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Request
          </Button>
          <Button
            variant="default"
            size="sm"
            className="w-full sm:w-1/2 font-semibold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
            disabled={isSubmitting}
            onClick={() => handleDraftAction(WorkflowAction.Edit)}
          >
            <FileEdit className="h-3.5 w-3.5" /> Edit Request
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Fallback for non-authorized roles on manager/finance steps
  if (!isAuthorizedForAction) {
    return (
      <Card className=" bg-primary/5 opacity-80 shadow-md ">
        <CardHeader>
          <CardTitle className="text-sm font-bold tracking-tight">
            Workflow Authorization Action
          </CardTitle>
          <CardDescription className="text-xs">
            Viewing details only. Your assigned identity role does not possess
            sign-off authority for this phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4 pt-1">
          <div className="flex gap-2 items-center bg-muted/60 p-3 rounded-lg border text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>
              Awaiting operational signature from qualified clearing agent.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Standard Management Approval View
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-md overflow-hidden">
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-tight">
          Workflow Authorization Action
        </CardTitle>
        <CardDescription className="text-xs">
          Review transaction parameters to fulfill compliance requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === PurchaseRequestStatus.Pending_Finance && (
          <div className="space-y-1.5">
            <Label
              htmlFor="poNumber"
              className="text-xs font-bold text-foreground"
            >
              Purchase Order (PO) Number{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="poNumber"
              placeholder="e.g., PO-2026-89710"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="note" className="text-xs font-bold text-foreground">
            Review Context Note{' '}
            <span className="text-muted-foreground font-normal">
              (Required for rejections)
            </span>
          </Label>
          <Textarea
            id="note"
            placeholder="Provide tracking justification or contextual reasoning..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="text-sm"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 border-t border-border/40 pt-4 bg-muted/20">
        <Button
          variant="destructive"
          size="sm"
          className="w-full sm:w-1/2 font-semibold"
          disabled={isSubmitting}
          onClick={() => handleSubmit(false)}
        >
          Decline Request
        </Button>
        <Button
          variant="default"
          size="sm"
          className="w-full sm:w-1/2 font-semibold"
          disabled={isSubmitting}
          onClick={() => handleSubmit(true)}
        >
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
}

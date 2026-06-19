// Components/WorkflowActionPanel.tsx
import{ useState } from 'react';
import { ShieldCheck } from 'lucide-react';
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
import type {
  WorkflowPayload,
} from '@/hooks/useRequestDetailsWorkflow';
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

  const handleSubmit = async (approve: boolean) => {
    if (!approve && !note.trim()) {
      toast.error(
        'A justification note is explicitly required for system rejections.'
      );
      return;
    }
    if(status === PurchaseRequestStatus.Pending_Manager && approve){

    }
    else if (
      status === PurchaseRequestStatus.Pending_Finance &&
      approve &&
      !poNumber.trim()
    ) {
      toast.error(
        'Compliance Requirement: A valid Purchase Order (PO) number is required for Finance approval.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onActionSubmit(WorkflowAction.Approve_Finance, { note, purchaseOrderNumber: poNumber });
      setNote('');
      setPoNumber('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorizedForAction) {
    return (
      <Card className="border-primary/20 bg-primary/5 opacity-80 shadow-md">
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

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-md relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/40" />
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

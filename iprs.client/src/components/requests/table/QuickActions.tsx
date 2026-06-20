import { useState } from 'react';
import { Eye, Check, X } from 'lucide-react';
import { Link } from 'react-router';
import useAuthStore from '@/stores/useAuthStore';
import { UserRole, WorkflowAction } from '@/types/enums';
import { ROUTES } from '@/config/routes';
import WorkflowDialog from '../WorkflowDialog';
import useRequestDetailsWorkflow from '@/hooks/useRequestDetailsWorkflow';

interface QuickActionsProps {
  request: {
    id: string;
    requestNumber: string;
  };
}

export default function QuickActions({ request }: QuickActionsProps) {
  const role = useAuthStore((state) => state.role);
  const { handleWorkflowExecution } = useRequestDetailsWorkflow(request.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<WorkflowAction | null>(null);

  const handleOpenDialog = (action: WorkflowAction) => {
    setActiveAction(action);
    setDialogOpen(true);
  };

  const handleWorkflowSubmit = async (formData: {
    poNumber?: string;
    note?: string;
  }) => {
    if (activeAction === WorkflowAction.Approve_Manager) {
      handleWorkflowExecution(activeAction, { note: formData.note });
    } else if (activeAction === WorkflowAction.Approve_Finance) {
      handleWorkflowExecution(activeAction, {
        note: formData.note,
        purchaseOrderNumber: formData.poNumber,
      });
    } else if (activeAction === WorkflowAction.Reject) {
      handleWorkflowExecution(activeAction, {
        note: formData.note,
        purchaseOrderNumber: formData.poNumber,
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <Link
        to={ROUTES.requests.detail(request.id)}
        replace
        className="inline-flex items-center justify-center p-2 rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        title="View Full Details"
      >
        <Eye className="h-4 w-4" />
      </Link>

      {(role === UserRole.Manager || role === UserRole.Finance) && (
        <ActionButtons
          onApprove={() =>
            handleOpenDialog(
              role === UserRole.Manager
                ? WorkflowAction.Approve_Manager
                : WorkflowAction.Approve_Finance
            )
          }
          onReject={() => handleOpenDialog(WorkflowAction.Reject)}
          id={request.id}
        />
      )}

      {/* Isolated Workflow Form Dialog */}
      <WorkflowDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        activeAction={activeAction}
        role={role}
        requestNumber={request.requestNumber}
        onSubmit={handleWorkflowSubmit}
      />
    </div>
  );
}

const ActionButtons = ({
  onApprove,
  onReject,
  id,
}: {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  id: string;
}) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onApprove(id)}
      className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
      title="Approve Request"
    >
      <Check className="h-4 w-4" />
    </button>
    <button
      onClick={() => onReject(id)}
      className="inline-flex items-center justify-center p-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
      title="Reject Request"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

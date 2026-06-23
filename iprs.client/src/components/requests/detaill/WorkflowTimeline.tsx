import { useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shadcn-ui/components/ui/card';
import {
  Check,
  X,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  FileEdit,
  BanIcon,
} from 'lucide-react';
import { PurchaseRequestStatus } from '@/types/enums';
import { formatDate } from '@/utils/date';
import TimelineStep from './TimelineStep';
import type { PurchaseRequestResponseDto } from '@/types/purchaseRequest';

interface WorkflowTimelineProps {
  request: PurchaseRequestResponseDto;
}

export default function WorkflowTimeline({ request }: WorkflowTimelineProps) {
  const currentStatus = request.status;

  const managerStep = useMemo(() => {
    const isPending = currentStatus === PurchaseRequestStatus.Pending_Manager;
    const isApproved =
      currentStatus === PurchaseRequestStatus.Pending_Finance ||
      currentStatus === PurchaseRequestStatus.Approved ||
      (currentStatus === PurchaseRequestStatus.Rejected &&
        !!request.managerApproval?.note);
    const isRejected =
      currentStatus === PurchaseRequestStatus.Rejected &&
      !request.managerApproval?.note;

    return { isPending, isApproved, isRejected };
  }, [currentStatus, request.managerApproval]);

  const financeStep = useMemo(() => {
    const isPending = currentStatus === PurchaseRequestStatus.Pending_Finance;
    const isApproved = currentStatus === PurchaseRequestStatus.Approved;
    const isRejected =
      currentStatus === PurchaseRequestStatus.Rejected &&
      !!request.financeApproval?.note;

    return { isPending, isApproved, isRejected };
  }, [currentStatus, request.financeApproval]);

  const isFinalized =
    currentStatus === PurchaseRequestStatus.Approved ||
    currentStatus === PurchaseRequestStatus.Rejected ||
    currentStatus === PurchaseRequestStatus.Cancelled;

  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          Request Approval Progress
          <div className="font-mono normal-case font-normal text-muted-foreground">
            Last update: {formatDate(request.updatedAt)}
          </div>
        </CardTitle>
        <CardDescription className="text-xs">
          Track the live step-by-step verification history of this purchase
          request.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Core Timeline Vertical Track Line */}
        <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:top-2 before:left-2.5 before:w-0.5 before:bg-border">
          {/* STEP 0: INITIAL SUBMISSION */}
          <TimelineStep
            icon={
              currentStatus === PurchaseRequestStatus.Draft ? (
                <FileEdit className="size-3" />
              ) : currentStatus === PurchaseRequestStatus.Cancelled ? (
                <BanIcon className="size-3 stroke-3" />
              ) : (
                <Check className="size-3 stroke-3" />
              )
            }
            iconBgClass={
              currentStatus === PurchaseRequestStatus.Draft
                ? 'bg-blue-500 text-white animate-pulse'
                : currentStatus === PurchaseRequestStatus.Cancelled
                  ? 'bg-red-500 text-white'
                  : 'bg-emerald-500 text-white'
            }
            title={
              currentStatus === PurchaseRequestStatus.Draft
                ? 'Draft Mode'
                : currentStatus === PurchaseRequestStatus.Cancelled
                  ? 'Request Cancelled'
                  : 'Request Submitted'
            }
            titleColorClass={
              currentStatus === PurchaseRequestStatus.Draft
                ? 'text-blue-500'
                : currentStatus === PurchaseRequestStatus.Cancelled
                  ? 'text-red-500'
                  : 'text-foreground'
            }
            description={
              currentStatus === PurchaseRequestStatus.Draft
                ? 'This request is currently a draft and has not been submitted to managers yet.'
                : currentStatus === PurchaseRequestStatus.Cancelled
                  ? 'This purchase request has been cancelled and removed from active routing.'
                  : 'The request was successfully submitted for approval routing.'
            }
            actionBy={request.requestedBy.fullName}
            actionAt={`${formatDate(request.createdAt)}`}
          />

          {/* STEP 1: OPERATIONAL MANAGER REVIEW */}
          <TimelineStep
            icon={
              managerStep.isApproved ? (
                <Check className="size-3 stroke-3" />
              ) : managerStep.isRejected ? (
                <X className="size-3 stroke-3" />
              ) : (
                <User className="size-3" />
              )
            }
            iconBgClass={
              managerStep.isApproved
                ? 'bg-emerald-500 text-white'
                : managerStep.isRejected
                  ? 'bg-destructive text-white'
                  : managerStep.isPending
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-muted text-muted-foreground'
            }
            title="Step 1: Department Manager Approval"
            titleColorClass={
              managerStep.isPending
                ? 'text-blue-500'
                : managerStep.isRejected
                  ? 'text-destructive'
                  : 'text-foreground'
            }
            description={
              managerStep.isApproved
                ? 'Approved by department manager.'
                : managerStep.isRejected
                  ? 'Rejected by department manager.'
                  : managerStep.isPending
                    ? 'Awaiting review and sign-off from manager.'
                    : 'Waiting for previous step.'
            }
            note={request.managerApproval?.note}
            badgeText={
              managerStep.isApproved
                ? 'Approved'
                : managerStep.isRejected
                  ? 'Rejected'
                  : undefined
            }
            badgeClass={
              managerStep.isApproved
                ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                : 'text-destructive bg-destructive/5 border-destructive/20'
            }
            actionBy={request.managerApproval?.actionBy.fullName}
            actionAt={
              request.managerApproval
                ? `${formatDate(request.managerApproval.actionAt)}`
                : undefined
            }
          />

          {/* STEP 2: FINANCE DEPARTMENT REVIEW */}
          <TimelineStep
            icon={
              financeStep.isApproved ? (
                <Check className="size-3 stroke-3" />
              ) : financeStep.isRejected ? (
                <X className="size-3 stroke-3" />
              ) : (
                <Shield className="size-3" />
              )
            }
            iconBgClass={
              financeStep.isApproved
                ? 'bg-emerald-500 text-white'
                : financeStep.isRejected
                  ? 'bg-destructive text-white'
                  : financeStep.isPending
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-muted text-muted-foreground'
            }
            title="Step 2: Finance Department Review"
            titleColorClass={
              financeStep.isPending
                ? 'text-blue-500'
                : financeStep.isRejected
                  ? 'text-destructive'
                  : 'text-foreground'
            }
            description={
              financeStep.isApproved
                ? 'Financial clearance complete and authorized.'
                : financeStep.isRejected
                  ? 'Rejected during financial audit.'
                  : financeStep.isPending
                    ? 'Awaiting financial allocation verification.'
                    : 'Waiting for previous step.'
            }
            note={request.financeApproval?.note}
            badgeText={
              financeStep.isApproved
                ? 'Approved'
                : financeStep.isRejected
                  ? 'Rejected'
                  : undefined
            }
            badgeClass={
              financeStep.isApproved
                ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                : 'text-destructive bg-destructive/5 border-destructive/20'
            }
            actionBy={request.financeApproval?.actionBy.fullName}
            actionAt={
              request.financeApproval
                ? `${formatDate(request.financeApproval.actionAt)}`
                : undefined
            }
            extraContent={
              request.purchaseOrderNumber ? (
                <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] font-bold text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded w-fit">
                  PO NUMBER: {request.purchaseOrderNumber}
                </div>
              ) : null
            }
          />

          {/* STEP 3: FINAL RESOLUTION */}
          {isFinalized && (
            <TimelineStep
              icon={
                currentStatus === PurchaseRequestStatus.Approved ? (
                  <CheckCircle2 className="size-3" />
                ) : (
                  <XCircle className="size-3" />
                )
              }
              iconBgClass={
                currentStatus === PurchaseRequestStatus.Approved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-destructive text-white'
              }
              title={
                currentStatus === PurchaseRequestStatus.Approved
                  ? 'Request Approved & Closed'
                  : currentStatus === PurchaseRequestStatus.Cancelled
                    ? 'Request Cancelled'
                    : 'Request Rejected & Closed'
              }
              titleColorClass={
                currentStatus === PurchaseRequestStatus.Approved
                  ? 'text-emerald-500'
                  : 'text-destructive'
              }
              description="This transaction is completed and sealed against further modifications."
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

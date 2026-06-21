import React from 'react';
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
import type { PurchaseRequestResponseDto } from '@/schemas/purchaseRequest';

interface WorkflowTimelineProps {
  request: PurchaseRequestResponseDto;
}

export default function WorkflowTimeline({ request }: WorkflowTimelineProps) {
  const currentStatus = request.status;

  const managerStep = React.useMemo(() => {
    const isPending = currentStatus === PurchaseRequestStatus.Pending_Manager;
    const isApproved =
      currentStatus === PurchaseRequestStatus.Pending_Finance ||
      currentStatus === PurchaseRequestStatus.Approved ||
      (currentStatus === PurchaseRequestStatus.Rejected &&
        !!request.financeApproval?.note);
    const isRejected =
      currentStatus === PurchaseRequestStatus.Rejected &&
      !request.financeApproval?.note;

    return { isPending, isApproved, isRejected };
  }, [currentStatus, request.financeApproval]);

  const financeStep = React.useMemo(() => {
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
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Request Approval Progress
        </CardTitle>
        <CardDescription className="text-xs">
          Track the live step-by-step verification history of this purchase
          request.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:top-2 before:left-2.5 before:w-0.5 before:bg-border">
          {/* INITIAL DRAFT / SUBMISSION */}
          <div className="relative">
            <div
              className={`absolute -left-5 mt-0.5 rounded-full p-0.5 flex items-center justify-center border border-background ${
                currentStatus === PurchaseRequestStatus.Draft
                  ? 'bg-blue-500 text-white animate-pulse'
                  : currentStatus === PurchaseRequestStatus.Cancelled
                    ? 'bg-red-500 text-white'
                    : 'bg-emerald-500 text-white'
              }`}
            >
              {currentStatus === PurchaseRequestStatus.Draft ? (
                <FileEdit className="h-3 w-3" />
              ) : currentStatus === PurchaseRequestStatus.Cancelled ? (
                <BanIcon className="h-3 w-3 stroke-3" />
              ) : (
                <Check className="h-3 w-3 stroke-3" />
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1">
              <div>
                <h4
                  className={`text-sm font-semibold ${
                    currentStatus === PurchaseRequestStatus.Draft
                      ? 'text-blue-500'
                      : currentStatus === PurchaseRequestStatus.Cancelled
                        ? 'text-red-500'
                        : 'text-foreground'
                  }`}
                >
                  {currentStatus === PurchaseRequestStatus.Draft
                    ? 'Draft Mode'
                    : currentStatus === PurchaseRequestStatus.Cancelled
                      ? 'Request Cancelled'
                      : 'Request Submitted'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {currentStatus === PurchaseRequestStatus.Draft
                    ? 'This request is currently a draft and has not been submitted to managers yet.'
                    : currentStatus === PurchaseRequestStatus.Cancelled
                      ? 'This purchase request has been cancelled and removed from active routing.'
                      : 'The request was successfully submitted for approval routing.'}
                </p>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border/50">
                By {request.requestedBy.fullName}
              </div>
            </div>
          </div>

          {/* OPERATIONAL MANAGER REVIEW */}
          <div className="relative">
            <div
              className={`absolute -left-5 mt-0.5 rounded-full p-0.5 flex items-center justify-center border border-background ${
                managerStep.isApproved
                  ? 'bg-emerald-500 text-white'
                  : managerStep.isRejected
                    ? 'bg-destructive text-white'
                    : managerStep.isPending
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-muted text-muted-foreground'
              }`}
            >
              {managerStep.isApproved ? (
                <Check className="h-3 w-3 stroke-3" />
              ) : managerStep.isRejected ? (
                <X className="h-3 w-3 stroke-3" />
              ) : (
                <User className="h-3 w-3" />
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1">
              <div>
                <h4
                  className={`text-sm font-semibold ${
                    managerStep.isPending
                      ? 'text-blue-500'
                      : managerStep.isRejected
                        ? 'text-destructive'
                        : 'text-foreground'
                  }`}
                >
                  Step 1: Department Manager Approval
                </h4>
                <p className="text-xs text-muted-foreground">
                  {managerStep.isApproved
                    ? 'Approved by department manager.'
                    : managerStep.isRejected
                      ? 'Rejected by department manager.'
                      : managerStep.isPending
                        ? 'Awaiting review and sign-off from manager.'
                        : 'Waiting for previous step.'}
                </p>
                {request.managerApproval?.note && (
                  <blockquote className="mt-2 text-xs border-l-2 border-muted-foreground/30 bg-muted/60 pl-2 py-1 italic rounded-r text-foreground/80">
                    "{request.managerApproval.note}"
                  </blockquote>
                )}
              </div>
              {managerStep.isApproved && (
                <div className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Approved
                </div>
              )}
              {managerStep.isRejected && (
                <div className="text-[11px] text-destructive font-medium bg-destructive/5 px-2 py-0.5 rounded border border-destructive/20">
                  Rejected
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <div
              className={`absolute -left-5 mt-0.5 rounded-full p-0.5 flex items-center justify-center border border-background ${
                financeStep.isApproved
                  ? 'bg-emerald-500 text-white'
                  : financeStep.isRejected
                    ? 'bg-destructive text-white'
                    : financeStep.isPending
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-muted text-muted-foreground'
              }`}
            >
              {financeStep.isApproved ? (
                <Check className="h-3 w-3 stroke-3" />
              ) : financeStep.isRejected ? (
                <X className="h-3 w-3 stroke-3" />
              ) : (
                <Shield className="h-3 w-3" />
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1">
              <div>
                <h4
                  className={`text-sm font-semibold ${
                    financeStep.isPending
                      ? 'text-blue-500'
                      : financeStep.isRejected
                        ? 'text-destructive'
                        : 'text-foreground'
                  }`}
                >
                  Step 2: Finance Department Review
                </h4>
                <p className="text-xs text-muted-foreground">
                  {financeStep.isApproved
                    ? 'Financial clearance complete and authorized.'
                    : financeStep.isRejected
                      ? 'Rejected during financial audit.'
                      : financeStep.isPending
                        ? 'Awaiting financial allocation verification.'
                        : 'Waiting for previous step.'}
                </p>
                {request.financeApproval?.note && (
                  <blockquote className="mt-2 text-xs border-l-2 border-muted-foreground/30 bg-muted/60 pl-2 py-1 italic rounded-r text-foreground/80">
                    "{request.financeApproval.note}"
                  </blockquote>
                )}
                {request.purchaseOrderNumber && (
                  <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] font-bold text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded w-fit">
                    PO NUMBER: {request.purchaseOrderNumber}
                  </div>
                )}
              </div>
              {financeStep.isApproved && (
                <div className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Approved
                </div>
              )}
              {financeStep.isRejected && (
                <div className="text-[11px] text-destructive font-medium bg-destructive/5 px-2 py-0.5 rounded border border-destructive/20">
                  Rejected
                </div>
              )}
            </div>
          </div>

          {/* FINAL RESOLUTION */}
          {isFinalized && (
            <div className="relative">
              <div
                className={`absolute -left-5 mt-0.5 rounded-full p-0.5 flex items-center justify-center border border-background ${
                  currentStatus === PurchaseRequestStatus.Approved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-destructive text-white'
                }`}
              >
                {currentStatus === PurchaseRequestStatus.Approved ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
              </div>
              <div>
                <h4
                  className={`text-sm font-bold ${
                    currentStatus === PurchaseRequestStatus.Approved
                      ? 'text-emerald-500'
                      : 'text-destructive'
                  }`}
                >
                  {currentStatus === PurchaseRequestStatus.Approved
                    ? 'Request Approved & Closed'
                    : currentStatus === PurchaseRequestStatus.Cancelled
                      ? 'Request Cancelled'
                      : 'Request Rejected & Closed'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  This transaction is completed and sealed against further
                  modifications.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

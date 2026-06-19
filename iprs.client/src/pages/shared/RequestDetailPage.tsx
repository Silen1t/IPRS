'use client';

import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/shadcn-ui/components/ui/button';
import AccountabilityCard from '@/components/requests/detaill/AccountabilityCard';
import BusinessJustificationCard from '@/components/requests/detaill/BusinessJustificationCard';
import LineItemSummaryCard from '@/components/requests/detaill/LineItemSummaryCard';
import RequestDetailHeader from '@/components/requests/detaill/RequestDetailHeader';
import RequestLoadingState from '@/components/requests/detaill/RequestLoadingState';
import RequestNotFoundState from '@/components/requests/detaill/RequestNotFoundState';
import WorkflowTimeline from '@/components/requests/detaill/WorkflowTimeline';
import { useRequestDetailsWorkflow } from '@/hooks/useRequestDetailsWorkflow';
import { ROUTES } from '@/config/routes';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import { useEffect } from 'react';

export default function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const refreshPurchaseRequests = usePurchaseRequestStore(
    (state) => state.refreshPurchaseRequests
  );
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = async () => {
      await refreshPurchaseRequests();
    };
    refresh();
  }, [refreshPurchaseRequests]);

  const { request, loading, resolvedCategory, resolvedDepartment } =
    useRequestDetailsWorkflow(requestId);

  if (loading && !request) return <RequestLoadingState />;
  if (!request)
    return (
      <RequestNotFoundState
        onReturn={() => navigate(ROUTES.dashboard.home, { replace: true })}
      />
    );

  return (
    <div className="w-full mx-auto p-6 space-y-8 text-foreground min-h-screen">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(ROUTES.dashboard.home, { replace: true })}
        className="gap-2 text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-5 w-5" /> Back to Requests
      </Button>

      <RequestDetailHeader
        id={request.id}
        title={request.title}
        status={request.status}
        totalPrice={request.totalPrice}
        urgency={request.urgencyLevel}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <LineItemSummaryCard
            createdAt={request.createdAt}
            unitPrice={request.unitPrice}
            quantity={request.quantity}
            categoryName={resolvedCategory?.name ?? `ID: ${request.categoryId}`}
          />
        </div>

        <div className="space-y-6">
          <AccountabilityCard
            requestedBy={request.requestedBy}
            departmentName={resolvedDepartment?.name ?? 'Unassigned Department'}
          />
        </div>
      </div>

      <BusinessJustificationCard description={request.description} />

      <WorkflowTimeline request={request} />
    </div>
  );
}

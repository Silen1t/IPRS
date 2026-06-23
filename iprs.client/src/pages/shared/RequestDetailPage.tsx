

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
import useRequestDetailsWorkflow from '@/hooks/useRequestDetailsWorkflow';
import { ROUTES } from '@/config/routes';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import { useEffect } from 'react';
import WorkflowActionPanel from '@/components/requests/detaill/WorkflowActionPanel';
import useHeaderTitle from '@/contexts/HeaderTitleContext';
import { PurchaseRequestStatus, UserRole } from '@/types/enums';
import useAuthStore from '@/stores/useAuthStore';

export default function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const refreshPurchaseRequests = usePurchaseRequestStore(
    (state) => state.refreshPurchaseRequests
  );
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const { setTitle } = useHeaderTitle();

  const {
    request,
    loading,
    error,
    resolvedCategory,
    resolvedDepartment,
    isAuthorizedForAction,
    showWorkflowPanel,
    handleWorkflowExecution,
  } = useRequestDetailsWorkflow(requestId);

  useEffect(() => {
    const refresh = async () => {
      await refreshPurchaseRequests();
    };
    refresh();
  }, [refreshPurchaseRequests]);

  useEffect(() => {
    if (request?.title) {
      setTitle(request.title);
    }
  }, [request?.title, setTitle]);

  if (loading && !request) return <RequestLoadingState />;

  if (!request || error) {
    return (
      <RequestNotFoundState
        onReturn={() => navigate(ROUTES.dashboard.home, { replace: true })}
      />
    );
  }
  const backPage =
    role === UserRole.Employee
      ? ROUTES.requests.myRequests
      : ROUTES.dashboard.home;

  const renderPanel =
    (showWorkflowPanel && request.status !== PurchaseRequestStatus.Rejected) ||
    request.status === PurchaseRequestStatus.Draft;

  return (
    <div className="w-full mx-auto p-6 space-y-8 text-foreground min-h-screen flex flex-col">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(backPage, { replace: true })}
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

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-1">
        {/* Right Sidebar Column */}
        <div className="order-first lg:order-2 col-span-1 flex flex-col gap-6">
          <AccountabilityCard
            requestedBy={request.requestedBy}
            departmentName={resolvedDepartment?.name ?? 'Unassigned Department'}
          />

          {renderPanel ? (
            <div className="hidden lg:block">
              <WorkflowActionPanel
                isAuthorizedForAction={isAuthorizedForAction}
                onActionSubmit={handleWorkflowExecution}
                status={request.status}
              />
            </div>
          ) : (
            /*  Fallback empty flex growth element to safely occupy alignment height when panel is missing on desktop */
            <div className="hidden lg:block flex-1" />
          )}
        </div>

        {/* Left Main Column Stack */}
        <div className="order-2 lg:order-1 col-span-1 lg:col-span-2 flex flex-col gap-6">
          <LineItemSummaryCard
            createdAt={request.createdAt}
            unitPrice={request.unitPrice}
            quantity={request.quantity}
            categoryName={resolvedCategory?.name ?? `ID: ${request.categoryId}`}
          />

          {/* Business Justification Container */}
          <div className="flex-1 flex flex-col min-h-62.5">
            <BusinessJustificationCard
              description={request.description}
              className="flex-1 h-full w-full"
            />
          </div>

          {renderPanel && (
            <div className="block lg:hidden w-full">
              <WorkflowActionPanel
                isAuthorizedForAction={isAuthorizedForAction}
                onActionSubmit={handleWorkflowExecution}
                status={request.status}
              />
            </div>
          )}
        </div>
      </div>

      <WorkflowTimeline request={request} />
    </div>
  );
}

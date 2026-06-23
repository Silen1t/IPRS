import LoadingDataTable from '@/components/requests/table/LoadingDataTable';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import { PurchaseRequestStatus } from '@/types/enums';

export default function PendingApprovals() {
  const requests = usePurchaseRequestStore(
    (state) => state.purchaseRequests
  ).filter((r) => r.status === PurchaseRequestStatus.Pending_Manager);

  return <LoadingDataTable requests={requests} header="Pending Approvals" quickActionVisible={true} />;
}

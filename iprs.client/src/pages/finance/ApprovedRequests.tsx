import LoadingDataTable from '@/components/requests/table/LoadingDataTable';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import { PurchaseRequestStatus } from '@/types/enums';

export default function ApprovedRequests() {
  const requests = usePurchaseRequestStore(
    (state) => state.purchaseRequests
  ).filter(
    (r) =>
      r.status === PurchaseRequestStatus.Approved &&
      r.purchaseOrderNumber != null
  );

  return (
    <LoadingDataTable
      requests={requests}
      header="Approved Requests"
      quickActionVisible={false}
    />
  );
}

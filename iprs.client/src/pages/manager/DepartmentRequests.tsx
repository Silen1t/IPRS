import LoadingDataTable from '@/components/requests/table/LoadingDataTable';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';

export default function DepartmentRequests() {
  const requests = usePurchaseRequestStore(
    (state) => state.purchaseRequests
  );

  return <LoadingDataTable requests={requests} header="Department Requests" quickActionVisible={false}/>;
}

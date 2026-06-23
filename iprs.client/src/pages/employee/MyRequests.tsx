import LoadingDataTable from '@/components/requests/table/LoadingDataTable';
import useHeaderTitle from '@/contexts/HeaderTitleContext';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import { useEffect } from 'react';

export default function MyRequests() {
  const requests = usePurchaseRequestStore((state) => state.purchaseRequests);
  const { setTitle } = useHeaderTitle();
  useEffect(() => {
    setTitle('My Requests');
  }, [setTitle]);
  return (
    <LoadingDataTable
      requests={requests}
      header=""
      quickActionVisible={false}
    />
  );
}

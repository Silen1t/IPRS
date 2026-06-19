import { DataTable } from '@/components/requests/table/DataTable';
import usePurchaseRequestStore  from '@/stores/usePurchaseRequestStore';
import { Loader2 } from 'lucide-react';

export default function MyRequests() {
  const requests = usePurchaseRequestStore((state) => state.purchaseRequests);
  const isLoading = usePurchaseRequestStore((state) => state.isLoading);
  return (
    <>
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Requests
        </h1>
      </div>
      {isLoading && requests.length > 0 ? (
        <div className="flex flex-col items-center justify-center min-h-62.5 border border-dashed rounded-xl bg-card text-muted-foreground gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm font-medium">
            Synchronizing records with backend pipeline...
          </p>
        </div>
      ) : (
        <DataTable data={requests} />
      )}
    </>
  );
}

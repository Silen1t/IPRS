import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import { Loader2 } from 'lucide-react';
import { RequestsTable } from './RequestsTable';
import type { PurchaseRequestResponseDto } from '@/types/purchaseRequest';

interface LoadingDataTableProps {
  className?: string;
  requests: PurchaseRequestResponseDto[];
  header: string;
  quickActionVisible: boolean;
}

export default function LoadingDataTable({
  className,
  requests,
  header,
  quickActionVisible,
}: LoadingDataTableProps) {
  const isLoading = usePurchaseRequestStore((state) => state.isLoading);

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {header}
      </h2>
      {isLoading && requests.length > 0 ? (
        <div className="flex flex-col items-center justify-center min-h-62.5 border border-dashed rounded-xl bg-card text-muted-foreground gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm font-medium">
            Synchronizing records with backend pipeline...
          </p>
        </div>
      ) : (
        <RequestsTable data={requests} quickActionsVisible={quickActionVisible} />
      )}
    </div>
  );
}

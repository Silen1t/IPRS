import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import { Loader2 } from 'lucide-react';
import { DataTable } from './DataTable';
import useAuthStore from '@/stores/useAuthStore';
import { PurchaseRequestStatus, UserRole } from '@/types/enums';
import { Card, CardContent, CardHeader } from '@/shadcn-ui/components/ui/card';

export default function LoadingDataTable({
  className,
}: {
  className?: string;
}) {
  const isLoading = usePurchaseRequestStore((state) => state.isLoading);
  const role = useAuthStore((state) => state.role);
  let requests = usePurchaseRequestStore((state) => state.purchaseRequests);
  if (role == UserRole.Manager) {
    requests = requests.filter(
      (r) => r.status === PurchaseRequestStatus.Pending_Manager
    );
  } else if (role == UserRole.Finance) {
    requests = requests.filter(
      (r) => r.status === PurchaseRequestStatus.Pending_Finance
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {role == UserRole.Employee
            ? 'My Requests'
            : role == UserRole.Manager
              ? 'Department Requests'
              : 'Finance Approvals'}
        </h2>
      </CardHeader>
      <CardContent className="overflow-y-hidden w-full">
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
      </CardContent>
    </Card>
  );
}

import { type ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';
import {
  BanIcon,
  CircleCheckIcon,
  LoaderIcon,
  SaudiRiyal,
  XCircleIcon,
} from 'lucide-react';
import { Badge } from '@/shadcn-ui/components/ui/badge';
import { purchaseRequestResponseSchema } from '@/schemas/purchaseRequest';
import { PurchaseRequestStatus } from '@/types/enums';
import { CategoryCell } from './CategoryCell';
import { formatDate } from '@/utils/date';
import QuickActions from './QuickActions';
import { formatMoney } from '@/utils/money';

export const columns: ColumnDef<
  z.infer<typeof purchaseRequestResponseSchema>
>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <span className="font-medium max-w-37.5 truncate block">
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: 'requestNumber',
    header: 'Request Number',
    cell: ({ row }) => (
      <span className="font-medium max-w-37.5 truncate block">
        {row.original.requestNumber}
      </span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <CategoryCell categoryId={row.original.categoryId} />,
  },
  {
    accessorKey: 'totalPrice',
    header: () => (
      <div className="w-full">
        <span>Total Price</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex gap-1.5 font-mono w-full">
        <SaudiRiyal className="size-5" />
        <span>
          {formatMoney(row.original.totalPrice)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'urgency',
    header: 'Urgency',
    cell: ({ row }) => {
      const urgency = row.original.urgencyLevel?.toLowerCase() || 'medium';

      const urgencyStyles: Record<string, string> = {
        critical:
          'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 font-bold',
        high: 'bg-destructive/10 text-destructive border-destructive/20 font-semibold',
        medium:
          'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
        low: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
      };

      const appliedClasses = urgencyStyles[urgency] || urgencyStyles.medium;

      return (
        <Badge
          variant="outline"
          className={`capitalize shadow-none transition-none ${appliedClasses}`}
        >
          {row.original.urgencyLevel || 'Medium'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'quickActions',
    header: 'Quick Actions',
    cell: ({ row }) => <QuickActions request={row.original} />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;

      // Map out background color variations and matching text styles smoothly
      const statusStyles: Record<string, string> = {
        [PurchaseRequestStatus.Approved]:
          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        [PurchaseRequestStatus.Rejected]:
          'bg-rose-500/10 text-rose-400 border-rose-500/20',
        [PurchaseRequestStatus.Cancelled]:
          'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      };

      const defaultStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      const appliedClasses = statusStyles[status] || defaultStyle;

      return (
        <Badge
          variant="outline"
          className={`flex items-center gap-1.5 w-fit px-2 py-0.5 font-medium ${appliedClasses}`}
        >
          {status === PurchaseRequestStatus.Approved ? (
            <CircleCheckIcon className="size-3.5" />
          ) : status === PurchaseRequestStatus.Rejected ? (
            <XCircleIcon className="size-3.5" />
          ) : status === PurchaseRequestStatus.Cancelled ? (
            <BanIcon className="size-3.5" />
          ) : (
            <LoaderIcon className="size-3.5 animate-spin" />
          )}
          <span className="capitalize">
            {status.replace('_', ' ').toLowerCase()}
          </span>
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const dateVal = row.original.createdAt;
      return (
        <span className="text-muted-foreground font-mono text-xs">
          {dateVal ? formatDate(dateVal) : 'N/A'}
        </span>
      );
    },
  },
];

import { type ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';
import { CircleCheckIcon, LoaderIcon, SaudiRiyal } from 'lucide-react';
import { Badge } from '@/shadcn-ui/components/ui/badge';
import { purchaseRequestResponseSchema } from '@/schemas/purchaseRequest';
import { PurchaseRequestStatus } from '@/types/enums';
import { TableCellViewer } from './TableCellViewer';
import { CategoryCell } from './CategoryCell';
import { FormatDate } from '@/utils/date';

export const columns: ColumnDef<z.infer<typeof purchaseRequestResponseSchema>>[] = [
  {
    accessorKey: 'requestNumber',
    header: 'Request Number',
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    enableHiding: false,
  },
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
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <CategoryCell categoryId={row.original.categoryId} />,
  },
  {
    accessorKey: 'totalPrice',
    header: () => (
      <div className=" w-full">
        <span>Total Price</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex gap-1.5 font-mono w-full">
        <SaudiRiyal className="size-5" />
        <span>
          {Number(row.original.totalPrice).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'urgency',
    header: 'Urgency',
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.original.urgencyLevel || 'Medium'}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="outline" className="flex items-center gap-1 w-fit px-1.5">
        {row.original.status === PurchaseRequestStatus.Approved ? (
          <CircleCheckIcon className="size-3.5 fill-green-500 text-background dark:fill-green-400" />
        ) : (
          <LoaderIcon className="size-3.5 animate-spin text-muted-foreground" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const dateVal = row.original.createdAt;
      return (
        <span className="text-muted-foreground font-mono text-xs">
          {dateVal ? FormatDate(dateVal) : 'N/A'}
        </span>
      );
    },
  },
];
import { z } from 'zod';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';

import { Button } from '@/shadcn-ui/components/ui/button';
import { Label } from '@/shadcn-ui/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn-ui/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shadcn-ui/components/ui/table';
import {
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
} from 'lucide-react';

import { purchaseRequestResponseSchema } from '@/schemas/purchaseRequest';
import { columns } from './Columns';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/config/routes';
import { TableToolbar } from './TableToolbar';
import { useEffect, useId, useState, type ReactNode } from 'react';

interface DataTableProps {
  data: z.infer<typeof purchaseRequestResponseSchema>[];
  quickActionsVisible: boolean;
  customToolbar?: ReactNode;
  children?: ReactNode;
  additionalFilters?: ColumnFiltersState;
}

export function RequestsTable({
  data: initialData,
  quickActionsVisible,
  customToolbar,
  children,
  additionalFilters,
}: DataTableProps) {
  const [data, setData] = useState(() => initialData);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const nav = useNavigate();

  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    const baseFilters = statusFilter
      ? [{ id: 'status', value: statusFilter }]
      : [];

    setColumnFilters([...baseFilters, ...(additionalFilters ?? [])]);
  }, [statusFilter, additionalFilters]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility: {
        quickActions: quickActionsVisible,
      },
      pagination,
      globalFilter,
      columnFilters,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="rounded-md overflow-y-hidden overflow-x-auto w-full flex flex-col gap-4">
      {children}
      <div className="relative flex flex-col gap-4 overflow-y-hidden overflow-x-auto px-4 lg:px-6 focus-visible:outline-none focus-visible:ring-0">
        <div className="flex flex-col gap-2 items-start justify-between px-4 mt-2">
          <TableToolbar
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            setStatusFilter={setStatusFilter}
            statusFilter={statusFilter}
            className="w-full"
          />
          {customToolbar && <div className="w-full mt-2">{customToolbar}</div>}
        </div>
        <div className="overflow-x-auto overflow-y-hidden rounded-lg border w-full">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() => {
                        if (!quickActionsVisible) {
                          nav(ROUTES.requests.detail(row.original.id), {
                            replace: true,
                          });
                        }
                      }}
                      className={`transition-colors hover:bg-muted/50 ${!quickActionsVisible ? 'cursor-pointer' : ''}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-end px-4 mt-2">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <div className="ms-auto flex items-center gap-2 lg:ms-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 "
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 "
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 "
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 "
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

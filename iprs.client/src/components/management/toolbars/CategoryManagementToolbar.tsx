import { useState, useEffect } from 'react';
import { Input } from '@/shadcn-ui/components/ui/input';
import { Button } from '@/shadcn-ui/components/ui/button';
import { SearchIcon, XIcon, SlidersHorizontal, Activity } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn-ui/components/ui/select';
import type { Table } from '@tanstack/react-table';

interface CategoryManagementToolbarProps<TData> {
  table: Table<TData>;
}

export default function CategoryManagementToolbar<TData>({
  table,
}: CategoryManagementToolbarProps<TData>) {
  const [searchValue, setSearchValue] = useState(
    (table.getState().globalFilter as string) ?? ''
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      table.setGlobalFilter(searchValue);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue, table]);

  const currentFilters = table.getState().columnFilters;

  const rawStatusFilter = currentFilters.find((f) => f.id === 'isActive')?.value;
  const statusFilter = rawStatusFilter !== undefined ? rawStatusFilter?.toString() : 'ALL';

  const handleColumnFilterChange = (columnId: string, value: string) => {
    table.setColumnFilters((old) => {
      const filtered = old.filter((f) => f.id !== columnId);
      if (value === 'ALL') return filtered;

      if (columnId === 'isActive') {
        return [...filtered, { id: columnId, value: value === 'true' }];
      }

      return [...filtered, { id: columnId, value }];
    });
  };

  const handleResetFilters = () => {
    setSearchValue('');
    table.setGlobalFilter('');
    table.setColumnFilters([]);
  };

  const hasActiveFilters = searchValue || currentFilters.length > 0;

  return (
    <div className="flex flex-col gap-3 w-full pb-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* LEFT SIDE: TEXT SEARCH (Filters by 'name' or global strings) */}
        <div className="relative flex-1 max-w-sm flex items-center">
          <SearchIcon className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search category name..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 pr-9 h-9 text-xs"
          />
          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearchValue('')}
              className="absolute right-1 size-7 rounded-sm text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>

        {/* RIGHT SIDE: STATUS SELECT DROPDOWN & RESET */}
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => handleColumnFilterChange('isActive', val)}
          >
            <SelectTrigger className="h-9 min-w-36 text-xs font-medium border-dashed ">
              <div className="flex items-center gap-2">
                <Activity className="size-3.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent align="end" className="text-xs font-medium">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Deactivated</SelectItem>
            </SelectContent>
          </Select>

          {/* RESET BUTTON */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="h-9 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1"
            >
              <SlidersHorizontal className="size-3.5" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
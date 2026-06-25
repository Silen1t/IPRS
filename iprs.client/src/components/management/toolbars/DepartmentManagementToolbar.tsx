import { useState, useEffect } from 'react';
import { Input } from '@/shadcn-ui/components/ui/input';
import { Button } from '@/shadcn-ui/components/ui/button';
import { SearchIcon, XIcon, SlidersHorizontal } from 'lucide-react';
import type { Table } from '@tanstack/react-table';

interface DepartmentManagementToolbarProps<TData> {
  table: Table<TData>;
}

export default function DepartmentManagementToolbar<TData>({
  table,
}: DepartmentManagementToolbarProps<TData>) {
  const [searchValue, setSearchValue] = useState(
    (table.getState().globalFilter as string) ?? ''
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      table.setGlobalFilter(searchValue);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue, table]);

  const handleResetFilters = () => {
    setSearchValue('');
    table.setGlobalFilter('');
    table.setColumnFilters([]);
  };

  const hasActiveFilters = searchValue || table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col gap-3 w-full pb-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* ONE COMBINED INPUT FIELD */}
        <div className="relative flex-1 max-w-md flex items-center">
          <SearchIcon className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search department name or manager..."
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

        {/* RESET BUTTON */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-9 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1 self-start sm:self-auto"
          >
            <SlidersHorizontal className="size-3.5" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Input } from '@/shadcn-ui/components/ui/input';
import { SearchIcon, XIcon, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/shadcn-ui/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn-ui/components/ui/select';
import useAuthStore from '@/stores/useAuthStore';
import { UserRole } from '@/types/enums';

interface TableToolbarProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  className?: string;
}

interface StatusOptions {
  label: string;
  value: string;
  roles?: UserRole[];
}

const STATUS_OPTIONS: StatusOptions[] = [
  { label: 'All Statuses', value: 'ALL' }, //  Fixed `=` to `:`
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED', roles: [UserRole.Employee] },
];

export function TableToolbar({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  className,
}: TableToolbarProps) {
  const [value, setValue] = useState(globalFilter);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setGlobalFilter(value);
    }, 300);

    return () => clearTimeout(timeout);
  }, [value, setGlobalFilter]);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 ${className ?? ''}`}
    >
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl w-full">
        {/* SEARCH INPUT */}
        <div className="relative w-full max-w-sm flex items-center">
          <SearchIcon className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search for Request Number PR-XXXX-XXXX..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="pl-9 pr-9 h-9"
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setValue('')}
              className="absolute right-1 size-7 rounded-sm text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 min-w-40">
          <Select
            value={statusFilter || 'ALL'}
            onValueChange={(val) => setStatusFilter(val === 'ALL' ? '' : val)}
          >
            <SelectTrigger className="h-9 text-xs font-medium border-dashed focus:ring-1">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent align="start" className="rounded-lg">
              {STATUS_OPTIONS.map((option) => {
                const isPublic = !option.roles || option.roles.length === 0;

                const isAllowedRole =
                  role != null && option.roles?.includes(role);

                if (!isPublic && !isAllowedRole) {
                  return null;
                }

                return (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-xs font-medium cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {statusFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('')}
              className="h-9 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

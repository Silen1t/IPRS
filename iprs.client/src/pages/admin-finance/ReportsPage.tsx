

import { format } from 'date-fns';
import { Calendar as CalendarIcon, SaudiRiyalIcon } from 'lucide-react';

import { Button } from '@/shadcn-ui/components/ui/button';
import { Calendar } from '@/shadcn-ui/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shadcn-ui/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn-ui/components/ui/select';
import { RequestsTable } from '@/components/requests/table/RequestsTable';
import usePurchaseRequestStore from '@/stores/usePurchaseRequestStore';
import useDepartmentStore from '@/stores/useDepartmentStore';
import { cn } from '@/shadcn-ui/lib/utils';
import { formatMoney } from '@/utils/money';
import { useMemo, useState } from 'react';

export function ReportsPage() {
  const allRequests = usePurchaseRequestStore(
    (state) => state.purchaseRequests
  );
  const departments = useDepartmentStore((state) => state.departments);

  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [department, setDepartment] = useState<string>('-1');

  const preFilteredData = useMemo(() => {
    return allRequests.filter((request) => {
      // Check department matches
      if (
        Number.parseInt(department) !== -1 &&
        request.departmentId !== Number.parseInt(department)
      ) {
        return false;
      }

      // Check date constraints
      const requestDate = new Date(request.createdAt);
      
      if (fromDate && requestDate < fromDate) {
        return false;
      }
      
      if (toDate) {
        const adjustedToDate = new Date(toDate);
        adjustedToDate.setHours(23, 59, 59, 999);
        if (requestDate > adjustedToDate) return false;
      }

      return true;
    });
  }, [allRequests, fromDate, toDate, department]);

  const totalSpend = useMemo(() => {
    return preFilteredData.reduce(
      (sum, item) => sum + (Number(item.totalPrice) || 0),
      0
    );
  }, [preFilteredData]);

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Finance Card Header Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card border rounded-xl p-6 gap-4">
        <div >
          <h1 className="text-2xl font-bold tracking-tight">
            Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor company wide spending balances and requests.
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-left min-w-50">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Filtered Spend
          </span>
          <h2 className="flex items-center gap-3.5 text-2xl font-black text-primary mt-1">
            <SaudiRiyalIcon className="h-8 w-8 shrink-0" />
            {formatMoney(totalSpend)}
          </h2>
        </div>
      </div>

      {/* Embedded Controls Strip inside the page context */}
      <div className="flex flex-wrap gap-4 items-end bg-muted/40 p-4 rounded-xl border">
        {/* Department Filter Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Department
          </label>
          <Select value={department.toString()} onValueChange={setDepartment}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'-1'}>All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* --- SPLIT DATE PICKERS --- */}

        {/* From Date Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            From Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-48 justify-start text-left font-normal bg-background',
                  !fromDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {fromDate ? format(fromDate, 'PPP') : <span>Pick a start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                disabled={(date: Date) => (toDate ? date > toDate : false)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* To Date Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            To Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-48 justify-start text-left font-normal bg-background',
                  !toDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {toDate ? format(toDate, 'PPP') : <span>Pick an end date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                disabled={(date: Date) => (fromDate ? date < fromDate : false)} 
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Reset Filters Shortcut */}
        {(department !== '-1' || fromDate || toDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDepartment('-1');
              setFromDate(undefined);
              setToDate(undefined);
            }}
            className="h-9"
          >
            Clear Filters
          </Button>
        )}
      </div>

      <RequestsTable data={preFilteredData} quickActionsVisible={false} />
    </div>
  );
}
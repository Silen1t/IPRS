import React from 'react';
import { Badge } from '@/shadcn-ui/components/ui/badge';
import {
  SaudiRiyal,
  FileText,
  LoaderIcon,
  CircleCheckIcon,
  XCircleIcon,
  BanIcon,
  AlertCircle,
} from 'lucide-react';
import { PurchaseRequestStatus } from '@/types/enums';

interface RequestDetailHeaderProps {
  id: string;
  title: string;
  status: PurchaseRequestStatus;
  totalPrice: number;
  urgency?: string; 
}

const statusConfig: Record<
  PurchaseRequestStatus,
  {
    label: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  [PurchaseRequestStatus.Draft]: {
    label: 'Draft',
    className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    icon: FileText,
  },
  [PurchaseRequestStatus.Pending_Manager]: {
    label: 'Pending Manager',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: LoaderIcon,
  },
  [PurchaseRequestStatus.Pending_Finance]: {
    label: 'Pending Finance',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: LoaderIcon,
  },
  [PurchaseRequestStatus.Approved]: {
    label: 'Approved',
    className: 'bg-green-400 text-white border-transparent',
    icon: CircleCheckIcon,
  },
  [PurchaseRequestStatus.Rejected]: {
    label: 'Rejected',
    className: 'bg-red-500 text-white border-transparent',
    icon: XCircleIcon,
  },
  [PurchaseRequestStatus.Cancelled]: {
    label: 'Cancelled',
    className: 'bg-red-700 text-white border-transparent',
    icon: BanIcon,
  },
};

const urgencyConfig: Record<string, { label: string; className: string }> = {
  critical: {
    label: 'Critical Priority',
    className: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 font-bold',
  },
  high: {
    label: 'High Priority',
    className: 'bg-destructive/10 text-destructive border-destructive/20 font-semibold',
  },
  medium: {
    label: 'Medium Priority',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  },
  low: {
    label: 'Low Priority',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  },
};

export default function RequestDetailHeader({
  id,
  title,
  status,
  totalPrice,
  urgency,
}: RequestDetailHeaderProps) {
  const activeConfig = statusConfig[status] || statusConfig[PurchaseRequestStatus.Draft];
  const StatusIcon = activeConfig.icon;

  const normalizedUrgency = urgency?.toLowerCase() || '';
  const activeUrgency = urgencyConfig[normalizedUrgency] || {
    label: urgency || 'Normal Priority',
    className: 'bg-muted text-muted-foreground border-border',
  };

  const isAnimatedLoader = StatusIcon === LoaderIcon;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border">
            ID: {String(id).slice(0, 8).toUpperCase()}
          </span>

          {/* Status Badge Layout matching your table design keys */}
          <Badge
            variant="outline"
            className={`flex items-center gap-1 w-fit px-1.5 text-xs font-medium shadow-none transition-none ${activeConfig.className}`}
          >
            <StatusIcon className={`size-3.5 ${isAnimatedLoader ? 'animate-spin text-amber-400' : ''}`} />
            {activeConfig.label}
          </Badge>

          {/* Dynamic Urgency Level Badge Layout */}
          {urgency && (
            <Badge
              variant="outline"
              className={`flex items-center gap-1.5 px-2.5 py-0.5 capitalize shadow-none transition-none ${activeUrgency.className}`}
            >
              <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
              {activeUrgency.label}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight mt-1">{title}</h1>
      </div>

      <div className="bg-card border border-border p-3 rounded-xl text-left min-w-40 shadow-sm">
        <span className="text-xs text-muted-foreground block font-medium">
          Total Cost Commitment
        </span>
        <span className="text-xl font-bold text-foreground inline-flex items-center gap-1 mt-0.5">
          <SaudiRiyal className="h-5 w-5 text-muted-foreground" />
          {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(totalPrice)}
        </span>
      </div>
    </div>
  );
}
import React from 'react';
import { Badge } from '@/shadcn-ui/components/ui/badge';
import {
  SaudiRiyal,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
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
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  [PurchaseRequestStatus.Draft]: {
    label: 'Draft',
    variant: 'outline',
    className: '',
    icon: FileText,
  },
  [PurchaseRequestStatus.Pending_Manager]: {
    label: 'Pending Manager',
    variant: 'secondary',
    className: 'bg-orange-500 text-white',
    icon: Clock,
  },
  [PurchaseRequestStatus.Pending_Finance]: {
    label: 'Pending Finance',
    variant: 'secondary',
    className: 'bg-orange-500 text-white',
    icon: Clock,
  },
  [PurchaseRequestStatus.Approved]: {
    label: 'Approved',
    variant: 'default',
    className: 'bg-emerald-500 text-white',
    icon: CheckCircle2,
  },
  [PurchaseRequestStatus.Rejected]: {
    label: 'Rejected',
    variant: 'destructive',
    className: 'bg-red-500 text-white',
    icon: XCircle,
  },
  [PurchaseRequestStatus.Cancelled]: {
    label: 'Cancelled',
    className: 'bg-muted text-white',
    variant: 'destructive',
    icon: Ban,
  },
};

const urgencyConfig: Record<string, { label: string; className: string }> = {
  critical: {
    label: 'Critical Priority',
    className:
      'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 font-bold',
  },
  high: {
    label: 'High Priority',
    className:
      'bg-destructive/10 text-destructive border-destructive/20 font-semibold',
  },
  medium: {
    label: 'Medium Priority',
    className:
      'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  },
  low: {
    label: 'Low Priority',
    className:
      'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  },
};

export default function RequestDetailHeader({
  id,
  title,
  status,
  totalPrice,
  urgency,
}: RequestDetailHeaderProps) {
  const activeConfig =
    statusConfig[status] || statusConfig[PurchaseRequestStatus.Draft];
  const StatusIcon = activeConfig.icon;

  // Safe fallback resolver for the urgency configurations
  const normalizedUrgency = urgency?.toLowerCase() || '';
  const activeUrgency = urgencyConfig[normalizedUrgency] || {
    label: urgency || 'Normal Priority',
    className: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
            ID: {String(id).slice(0, 8).toUpperCase()}
          </span>

          {/* Status Badge */}
          <Badge
            variant={activeConfig.variant}
            className={`flex items-center gap-1 font-medium px-2.5 py-0.5 ${activeConfig.className} `}
          >
            <StatusIcon className="h-3.5 w-3.5 stroke-[2.5]" />{' '}
            {activeConfig.label}
          </Badge>

          {/* 🌟 Dynamic Urgency Level Badge Layout */}
          {urgency && (
            <Badge
              variant="outline"
              className={`flex items-center gap-1 px-2.5 py-0.5 capitalize shadow-none transition-none ${activeUrgency.className}`}
            >
              <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
              {activeUrgency.label}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight mt-1">{title}</h1>
      </div>

      <div className="bg-card border border-border p-3 rounded-xl text-right min-w-40 shadow-sm">
        <span className="text-xs text-muted-foreground block font-medium">
          Total Cost Commitment
        </span>
        <span className="text-xl font-bold text-foreground inline-flex items-center gap-1">
          <SaudiRiyal className="h-5 w-5 text-muted-foreground" />
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
          })
            .format(totalPrice)
            .replace('SAR', '')
            .trim()}
        </span>
      </div>
    </div>
  );
}

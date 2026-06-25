import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shadcn-ui/components/ui/card';
import { Layers, Calendar, SaudiRiyal } from 'lucide-react';
import { formatDateTime } from '@/utils/date';
import { formatMoney } from '@/utils/money';

interface LineItemSummaryCardProps {
  createdAt: string;
  unitPrice: number;
  quantity: number;
  categoryName: string;
}

export default function LineItemSummaryCard({
  createdAt,
  unitPrice,
  quantity,
  categoryName,
}: LineItemSummaryCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Line Item Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-2.5">
          <Layers className="h-4 w-4 text-muted-foreground mt-0.5 stroke-[1.5]" />
          <div>
            <span className="text-xs text-muted-foreground block">
              Category Classification
            </span>
            <span className="text-sm font-medium">{categoryName}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 stroke-[1.5]" />
          <div>
            <span className="text-xs text-muted-foreground block">
              Submission Timeline
            </span>
            <span className="text-sm font-medium">{formatDateTime(createdAt)}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 border-t border-border/40 pt-3">
          <SaudiRiyal className="h-5 w-5 text-muted-foreground mt-0.5 stroke-[1.5]" />
          <div>
            <span className="text-xs text-muted-foreground block">
              Unit Metric Value
            </span>
            <span className="text-sm font-medium">
              {formatMoney(unitPrice.toFixed(2))}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 border-t border-border/40 pt-3">
          <Layers className="h-4 w-4 text-muted-foreground mt-0.5 stroke-[1.5]" />
          <div>
            <span className="text-xs text-muted-foreground block">
              Volume Metric Quantity
            </span>
            <span className="text-sm font-medium">{quantity} Units</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

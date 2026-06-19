import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shadcn-ui/components/ui/card';
import { User, Building2 } from 'lucide-react';

interface AccountabilityCardProps {
  requestedBy: {
    fullName: string;
    email?: string;
  };
  departmentName: string;
}

export default function AccountabilityCard({
  requestedBy,
  departmentName,
}: AccountabilityCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Accountability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-7 text-sm">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <span className="text-xs text-muted-foreground block">
              Originating Profile
            </span>
            <span className="font-medium text-foreground">
              {requestedBy.fullName}
            </span>
          </div>
        </div>

        <div className="border-t border-border/40 pt-3 flex items-start gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <span className="text-xs text-muted-foreground block">
              Assigned Cost Center
            </span>
            <span className="font-medium text-foreground">
              {departmentName}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

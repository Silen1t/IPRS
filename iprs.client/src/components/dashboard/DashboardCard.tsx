

import { Badge } from '@/shadcn-ui/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shadcn-ui/components/ui/card';
import type { ComponentType } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  badgeText?: string;
  footerText?: string;
  sideIconOnLeft?: boolean;
  sideIcon?: ComponentType<{ className?: string }>;
  icon?: ComponentType<{ className?: string }>;
}

export default function DashboardCard({
  title,
  value,
  description,
  badgeText,
  icon: Icon,
  footerText,
  sideIconOnLeft,
  sideIcon: SideIcon,
}: DashboardCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-3.5">
          {SideIcon &&
            (sideIconOnLeft ? (
              <>
                <SideIcon className="h-8 w-8 shrink-0" />
                {value}
              </>
            ) : (
              <>
                {value}
                <SideIcon className="h-8 w-8 shrink-0" />
              </>
            ))}
          {!SideIcon && value}
        </CardTitle>

        {(badgeText || Icon) && (
          <CardAction>
            <Badge variant="outline" className="flex items-center gap-1">
              {Icon && <Icon className="size-3.5" />}
              {badgeText}
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      {(footerText || description) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {footerText && (
            <div className="line-clamp-1 flex gap-2 font-medium">
              {footerText}
            </div>
          )}
          {description && (
            <div className="text-muted-foreground">{description}</div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

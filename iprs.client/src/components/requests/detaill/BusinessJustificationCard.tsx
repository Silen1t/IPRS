import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shadcn-ui/components/ui/card';

export default function BusinessJustificationCard({
  description,
  className,
}: {
  description?: string | null;
  className?: string | null;
}) {
  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Business Justification
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <p className="text-sm  h-full text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-xl border border-border/40">
          {description || 'No supplemental justification text provided.'}
        </p>
      </CardContent>
    </Card>
  );
}

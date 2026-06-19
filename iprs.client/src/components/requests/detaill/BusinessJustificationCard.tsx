import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shadcn-ui/components/ui/card';

export default function BusinessJustificationCard({
  description,
}: {
  description?: string | null;
}) {
  return (
    <Card className="shadow-sm w-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Business Justification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-xl border border-border/40">
          {description || 'No supplemental justification text provided.'}
        </p>
      </CardContent>
    </Card>
  );
}

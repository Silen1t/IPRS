interface TimelineStepProps {
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  titleColorClass?: string;
  description: string;
  note?: string | null;
  badgeText?: string;
  badgeClass?: string;
  actionBy?: string;
  actionAt?: string;
  extraContent?: React.ReactNode;
}

export default function TimelineStep({
  icon,
  iconBgClass,
  title,
  titleColorClass = 'text-foreground',
  description,
  note,
  badgeText,
  badgeClass,
  actionBy,
  actionAt,
  extraContent,
}: TimelineStepProps) {
  return (
    <div className="relative">
      <div className={`absolute -left-5 mt-0.5 rounded-full p-0.5 flex items-center justify-center border border-background shrink-0 ${iconBgClass}`}>
        {icon}
      </div>

      {/* Row Contents */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1">
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold ${titleColorClass}`}>{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
          
          {note && (
            <blockquote className="mt-2 text-xs border-l-2 border-muted-foreground/30 bg-muted/60 pl-2 py-1 italic rounded-r text-foreground/80 wrap-break-word">
              "{note}"
            </blockquote>
          )}
          
          {extraContent}
        </div>

        {/* Metabar Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
          {badgeText && (
            <div className={`text-[11px] font-medium px-2 py-0.5 rounded border ${badgeClass}`}>
              {badgeText}
            </div>
          )}
          {actionBy && (
            <div className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border/50">
              By {actionBy}
            </div>
          )}
          {actionAt && (
            <div className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border/50">
              {actionAt}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

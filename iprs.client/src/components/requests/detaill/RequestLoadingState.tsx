import { Clock } from 'lucide-react';

export default function RequestLoadingState() {
  return (
    <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col justify-center items-center gap-2">
      <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground font-mono">
        Synchronizing ledger cache...
      </span>
    </div>
  );
}

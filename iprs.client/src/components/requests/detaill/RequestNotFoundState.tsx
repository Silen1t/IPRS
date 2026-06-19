import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shadcn-ui/components/ui/button';

interface RequestNotFoundStateProps {
  onReturn: () => void;
}

export default function RequestNotFoundState({
  onReturn,
}: RequestNotFoundStateProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 text-center space-y-4 h-[50vh] flex flex-col justify-center items-center">
      <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
      <h3 className="text-lg font-bold">Request Not Found</h3>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onReturn();
        }}
      >
        Return to Requests
      </Button>
    </div>
  );
}

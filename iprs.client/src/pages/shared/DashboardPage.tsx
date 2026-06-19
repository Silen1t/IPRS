import { ChartAreaInteractive } from '@/shadcn-ui/components/chart-area-interactive';
import { SectionCards } from '@/shadcn-ui/components/section-cards';

export default function DashboardPage() {

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
      </div>

            
      <SectionCards />

      <div className="w-full">
        <ChartAreaInteractive />
      </div>
    </div>
  );
}

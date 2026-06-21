import LoadingDataTable from '@/components/requests/table/LoadingDataTable';
import { useHeaderTitle } from '@/contexts/HeaderTitleContext';
// import { ChartAreaInteractive } from '@/shadcn-ui/components/chart-area-interactive';
// import { SectionCards } from '@/shadcn-ui/components/section-cards';

export default function DashboardPage() {
  const { setTitle } = useHeaderTitle();
  setTitle('Dashboard');
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
      </div>
      <LoadingDataTable />

      {/* <SectionCards />

      <div className="w-full">
        <ChartAreaInteractive />
      </div> */}
    </div>
  );
}

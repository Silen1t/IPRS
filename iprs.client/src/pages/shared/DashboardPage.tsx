import { SectionCards } from '@/shadcn-ui/components/section-cards';
import { ChartAreaInteractive } from '@/shadcn-ui/components/chart-area-interactive';
import { DataTable } from '@/shadcn-ui/components/data-table';
import jsonData from "@/app/dashboard/data.json";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <SectionCards />
      
      <div className="w-full">
        <ChartAreaInteractive />
      </div>
      
      <DataTable data={jsonData} />
    </div>
  );
}
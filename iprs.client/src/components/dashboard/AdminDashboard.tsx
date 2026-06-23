

import SectionCards from '@/components/dashboard/SectionCards';
import {
  FileText,
  Clock,
  FilesIcon,
  Users2Icon,
  Building2Icon,
} from 'lucide-react';
import DashboardCard from './DashboardCard';
import useDashboardStore from '@/stores/useDashboardStore';

export default function AdminDashboard() {
  const stats = useDashboardStore((state) => state.stats)?.adminStats;

  return (
    <>
      <SectionCards>
        <DashboardCard
          title="Total Departments"
          sideIconOnLeft={true}
          sideIcon={Building2Icon}
          value={stats?.totalDepartments ?? ''}
          icon={FileText}
          description="Saved requests"
        />
        <DashboardCard
          title="Total Requests"
          sideIconOnLeft={true}
          sideIcon={FilesIcon}
          value={stats?.totalRequests ?? 0}
          icon={Clock}
          description="Awaiting action"
        />
        <DashboardCard
          title="Total Users"
          sideIconOnLeft={true}
          sideIcon={Users2Icon}
          value={stats?.totalUsers ?? 0}
          icon={Clock}
          description="Awaiting action"
        />
      </SectionCards>
      <div className="mt-6 px-4 lg:px-6"></div>
    </>
  );
}

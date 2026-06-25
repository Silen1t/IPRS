import SectionCards from '@/components/dashboard/SectionCards';
import {
  FileText,
  Clock,
  Files,
  Building2,
  UserCheck,
  Users2,
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
          sideIcon={Building2}
          value={stats?.totalDepartments ?? 0}
          icon={FileText}
          description="Active organizational groups"
        />

        <DashboardCard
          title="Total Requests"
          sideIconOnLeft={true}
          sideIcon={Files}
          value={stats?.totalRequests ?? 0}
          icon={Clock}
          description="Processed system wide"
        />

        <DashboardCard
          title="Total Users"
          sideIconOnLeft={true}
          sideIcon={Users2}
          value={stats?.totalUsers ?? 0}
          icon={UserCheck}
          description="Registered system accounts"
        />
      </SectionCards>
      <div className="mt-6 px-4 lg:px-6"></div>
    </>
  );
}



import SectionCards from '@/components/dashboard/SectionCards';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import DashboardCard from './DashboardCard';
import useDashboardStore from '@/stores/useDashboardStore';
import MyRequests from '@/pages/employee/MyRequests';

export default function EmployeeDashboard() {
  const stats = useDashboardStore((state) => state.stats)?.employeeStats;

  return (
    <>
      <SectionCards>
        <DashboardCard
          title="Drafts"
          value={stats?.draftCount ?? 0}
          icon={FileText}
          description="Saved requests"
        />
        <DashboardCard
          title="Pending"
          value={stats?.pendingCount ?? 0}
          icon={Clock}
          description="Awaiting action"
        />
        <DashboardCard
          title="Approved"
          value={stats?.approvedCount ?? 0}
          icon={CheckCircle}
          description="PO generated"
        />
        <DashboardCard
          title="Rejected"
          value={stats?.rejectedCount ?? 0}
          icon={XCircle}
          description="Requires adjustments"
        />
      </SectionCards>
      <div className="mt-6 px-4 lg:px-6">
        <MyRequests />
      </div>
    </>
  );
}



import SectionCards from '@/components/dashboard/SectionCards';
import { FileText, Clock, SaudiRiyalIcon } from 'lucide-react';
import DashboardCard from './DashboardCard';
import useDashboardStore from '@/stores/useDashboardStore';
import PendingApprovals from '@/pages/manager/PendingApprovals';
import { formatMoney } from '@/utils/money';

export default function ManagerDashboard() {
  const stats = useDashboardStore((state) => state.stats)?.managerStats;

  return (
    <>
      <SectionCards>
        <DashboardCard
          title="Department Spend This Month"
          sideIconOnLeft={true}
          sideIcon={SaudiRiyalIcon}
          value={formatMoney(stats?.departmentSpendThisMonth ?? 0)}
          icon={FileText}
          description="Saved requests"
        />
        <DashboardCard
          title="Pending Approvals"
          value={stats?.pendingApprovalsCount ?? 0}
          icon={Clock}
          description="Awaiting action"
        />
      </SectionCards>
      <div className="mt-6 px-4 lg:px-6">
        <PendingApprovals />
      </div>
    </>
  );
}

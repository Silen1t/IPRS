

import SectionCards from '@/components/dashboard/SectionCards';
import { FileText, Clock, SaudiRiyalIcon } from 'lucide-react';
import DashboardCard from './DashboardCard';
import useDashboardStore from '@/stores/useDashboardStore';
import { formatMoney } from '@/utils/money';
import PendingFinanceApprovals from '@/pages/finance/PendingFinanceApprovals copy';

export default function FinanceDashboard() {
  const stats = useDashboardStore((state) => state.stats)?.financeStats;

  return (
    <>
      <SectionCards>
        <DashboardCard
          title="Total Approved Spend This Month"
          sideIconOnLeft={true}
          sideIcon={SaudiRiyalIcon}
          value={formatMoney(stats?.totalApprovedSpendThisMonth ?? 0)}
          icon={FileText}
          description="Saved requests"
        />
        <DashboardCard
          title="Pending Approvals"
          value={stats?.pendingFinanceCount ?? 0}
          icon={Clock}
          description="Awaiting action"
        />
      </SectionCards>
      <div className="mt-6 px-4 lg:px-6">
        <PendingFinanceApprovals />
      </div>
    </>
  );
}

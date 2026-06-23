import useHeaderTitle from '@/contexts/HeaderTitleContext';
import RoleGuard from '@/components/auth/RoleGuard';
import { UserRole } from '@/types/enums';

import { useEffect } from 'react';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import FinanceDashboard from '@/components/dashboard/FinanceDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const { setTitle } = useHeaderTitle();
  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <RoleGuard allowedRoles={[UserRole.Employee]}>
        <EmployeeDashboard />
      </RoleGuard>

      <RoleGuard allowedRoles={[UserRole.Manager]}>
        <ManagerDashboard />
      </RoleGuard>

      <RoleGuard allowedRoles={[UserRole.Finance]}>
        <FinanceDashboard />
      </RoleGuard>

      <RoleGuard allowedRoles={[UserRole.Admin]}>
        <AdminDashboard />
      </RoleGuard>

      {/* <SectionCards />

      <div className="w-full">
        <ChartAreaInteractive />
      </div> */}
    </div>
  );
}

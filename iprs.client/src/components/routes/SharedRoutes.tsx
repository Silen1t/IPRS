import { ROUTES } from '@/config/routes';
import DashboardPage from '@/pages/shared/DashboardPage';
import NotificationsPanel from '@/pages/shared/NotificationsPanel';
import RequestDetailPage from '@/pages/shared/RequestDetailPage';
import { UserRole } from '@/types/enums';
import { Route } from 'react-router';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRouteProps';
import { ReportsPage } from '@/pages/admin-finance/ReportsPage';

const SharedRoutes = (
  <>
    <Route path={ROUTES.dashboard.home} element={<DashboardPage />} />
    <Route
      path={`${ROUTES.requests.list}/:requestId`}
      element={<RequestDetailPage />}
    />

    <Route path={ROUTES.notifications} element={<NotificationsPanel />} />

    <Route
      element={
        <RoleProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Finance]} />
      }
    >
      <Route path={ROUTES.dashboard.reports} element={<ReportsPage />} />
    </Route>
  </>
);

export default SharedRoutes;

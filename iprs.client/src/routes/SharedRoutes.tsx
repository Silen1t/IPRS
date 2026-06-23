import { ROUTES } from '@/config/routes';
import DashboardPage from '@/pages/shared/DashboardPage';
import NotificationsPanel from '@/pages/shared/NotificationsPanel';
import RequestDetailPage from '@/pages/shared/RequestDetailPage';
import { Route } from 'react-router';

const SharedRoutes = (
  <>
    <Route path={ROUTES.dashboard.home} element={<DashboardPage />} />
    <Route
      path={`${ROUTES.requests.list}/:requestId`}
      element={<RequestDetailPage />}
    />

    <Route path={ROUTES.notifications} element={<NotificationsPanel />} />
  </>
);

export default SharedRoutes;
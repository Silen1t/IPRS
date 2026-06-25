import { ROUTES } from '@/config/routes';
import ForbiddenPage from '@/pages/errors/ForbiddenPage';
import MaintenancePage from '@/pages/errors/MaintenancePage';
import NetworkErrorPage from '@/pages/errors/NetworkErrorPage';
import NotFoundPage from '@/pages/errors/NotFoundPage';
import SessionExpiredPage from '@/pages/errors/SessionExpiredPage';
import { Route } from 'react-router';

const ErrorsRoutes = (
  <>
    <Route path={ROUTES.errors.forbidden} element={<ForbiddenPage />} />
    <Route path="*" element={<NotFoundPage />} />
    <Route
      path={ROUTES.errors.sessionExpired}
      element={<SessionExpiredPage />}
    />
    <Route path={ROUTES.errors.networkError} element={<NetworkErrorPage />} />
    <Route path={ROUTES.errors.maintenance} element={<MaintenancePage />} />
  </>
);

export default ErrorsRoutes;

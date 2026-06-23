import RoleProtectedRoute from '@/components/auth/RoleProtectedRouteProps';
import { ROUTES } from '@/config/routes';
import ApprovedRequests from '@/pages/finance/ApprovedRequests';
import { UserRole } from '@/types/enums';
import { Route } from 'react-router';

const FinanceRoutes = (
  <Route element={<RoleProtectedRoute allowedRoles={[UserRole.Finance]} />}>
    <Route
      path={ROUTES.requests.approvedRequests}
      element={<ApprovedRequests />}
    />
  </Route>
);

export default FinanceRoutes;

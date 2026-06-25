import RoleProtectedRoute from '@/components/auth/RoleProtectedRouteProps';
import { ROUTES } from '@/config/routes';
import Requests from '@/pages/manager/Requests';
import { UserRole } from '@/types/enums';
import { Route } from 'react-router';

const ManagerRoutes = (
  <Route element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} />}>
    <Route path={ROUTES.requests.list} element={<Requests />} />
  </Route>
);

export default ManagerRoutes;

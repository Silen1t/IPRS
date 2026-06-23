import RoleProtectedRoute from '@/components/auth/RoleProtectedRouteProps';
import { UserRole } from '@/types/enums';
import { Route } from 'react-router';

const AdminRoutes = (
  <Route
    element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} />}
  ></Route>
);

export default AdminRoutes;

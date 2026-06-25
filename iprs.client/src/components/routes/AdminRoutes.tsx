import RoleProtectedRoute from '@/components/auth/RoleProtectedRouteProps';
import { ROUTES } from '@/config/routes';
import CategoryManagement from '@/pages/admin/CategoryManagement';
import DepartmentManagement from '@/pages/admin/DepartmentManagement';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import { UserRole } from '@/types/enums';
import { Route } from 'react-router';

const AdminRoutes = (
  <Route element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} />}>
    <Route
      path={ROUTES.dashboard.categoryManagement}
      element={<CategoryManagement />}
    />
    <Route
      path={ROUTES.dashboard.departmentsManagement}
      element={<DepartmentManagement />}
    />
    <Route
      path={ROUTES.dashboard.usersManagement}
      element={<UserManagementPage />}
    />
  </Route>
);

export default AdminRoutes;

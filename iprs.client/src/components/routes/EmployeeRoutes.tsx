import RoleProtectedRoute from '@/components/auth/RoleProtectedRouteProps';
import { ROUTES } from '@/config/routes';
import EditRequestForm from '@/pages/employee/EditRequestForm';
import MyRequests from '@/pages/employee/MyRequests';
import NewRequestForm from '@/pages/employee/NewRequestForm';
import { UserRole } from '@/types/enums';
import { Route } from 'react-router';

const EmployeeRoutes = (
  <Route element={<RoleProtectedRoute allowedRoles={[UserRole.Employee]} />}>
    <Route path={ROUTES.requests.myRequests} element={<MyRequests />} />

    <Route path={ROUTES.requests.create} element={<NewRequestForm />} />

    <Route
      path={`${ROUTES.requests.list}/:requestId/edit`}
      element={<EditRequestForm />}
    />
  </Route>
);

export default EmployeeRoutes;

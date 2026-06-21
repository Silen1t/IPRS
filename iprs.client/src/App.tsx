import DashboardPage from './pages/shared/DashboardPage';
import { Route, Routes } from 'react-router';
import LoginPage from './pages/shared/LoginPage';
import { Toaster } from './shadcn-ui/components/ui/sonner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import RequestDetailPage from './pages/shared/RequestDetailPage';
import RoleProtectedRoute from './components/auth/RoleProtectedRouteProps';
import { UserRole } from './types/enums';
import NotificationsPanel from './pages/shared/NotificationsPanel';
import { ROUTES } from './config/routes';
import NewRequestForm from './pages/employee/NewRequestForm';
import { useHeaderTitle } from './contexts/HeaderTitleContext';
import EditRequestForm from './pages/employee/EditRequestForm';

export default function App() {
  const { title } = useHeaderTitle();
  
  return (
    <>
      <title>{`IPRS - ${title}`}</title>
      <Routes>
        <Route path={ROUTES.auth.login} element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.dashboard.home} element={<DashboardPage />} />
            <Route
              path={`${ROUTES.requests.list}/:requestId`}
              element={<RequestDetailPage />}
            />

            <Route
              path={`${ROUTES.requests.list}/:requestId/edit`}
              element={<EditRequestForm />}
            />

            <Route
              path={ROUTES.notifications}
              element={<NotificationsPanel />}
            />

            <Route
              element={
                <RoleProtectedRoute allowedRoles={[UserRole.Employee]} />
              }
            >
              <Route
                path={ROUTES.requests.create}
                element={<NewRequestForm />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>

      <Toaster position="top-center" richColors duration={1000} />
    </>
  );
}

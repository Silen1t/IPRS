import { Route, Routes } from 'react-router';
import { Toaster } from '@/shadcn-ui/components/ui/sonner';
import { ROUTES } from '@/config/routes';
import LoginPage from '@/pages/shared/LoginPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import useHeaderTitle from '@/contexts/HeaderTitleContext';
import EmployeeRoutes from '@/components/routes/EmployeeRoutes';
import FinanceRoutes from '@/components/routes/FinanceRoutes';
import ManagerRoutes from '@/components/routes/ManagerRoutes';
import SharedRoutes from '@/components/routes/SharedRoutes';
import AdminRoutes from '@/components/routes/AdminRoutes';
import ErrorsRoutes from '@/components/routes/ErrorsRoutes';

export default function App() {
  const { title } = useHeaderTitle();

  return (
    <>
      <title>{`IPRS - ${title}`}</title>
      <Routes>
        <Route path={ROUTES.auth.login} element={<LoginPage />} />
        {ErrorsRoutes}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {SharedRoutes}
            {EmployeeRoutes}
            {ManagerRoutes}
            {FinanceRoutes}
            {AdminRoutes}
          </Route>
        </Route>
      </Routes>

      <Toaster position="top-center" richColors duration={3000} />
    </>
  );
}

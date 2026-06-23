import { Route, Routes } from 'react-router';
import { Toaster } from './shadcn-ui/components/ui/sonner';
import { ROUTES } from './config/routes';
import LoginPage from './pages/shared/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import useHeaderTitle from './contexts/HeaderTitleContext';
import EmployeeRoutes from './routes/EmployeeRoutes';
import FinanceRoutes from './routes/FinanceRoutes';
import ManagerRoutes from './routes/ManagerRoutes';
import SharedRoutes from './routes/SharedRoutes';
import AdminRoutes from './routes/AdminRoutes';

export default function App() {
  const { title } = useHeaderTitle();

  return (
    <>
      <title>{`IPRS - ${title}`}</title>
      <Routes>
        <Route path={ROUTES.auth.login} element={<LoginPage />} />
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

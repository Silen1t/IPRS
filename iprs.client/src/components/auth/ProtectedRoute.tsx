import { Outlet, Navigate } from 'react-router';
import useAuthStore from '@/stores/useAuthStore';
import { ROUTES } from '@/config/routes';

export default function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to={ROUTES.errors.sessionExpired} replace />;
  }

  return <Outlet />;
}
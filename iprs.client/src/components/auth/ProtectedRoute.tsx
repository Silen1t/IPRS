import { Navigate, Outlet, useLocation } from 'react-router';
import useAuthStore from '@/stores/useAuthStore';

export default function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User has a token? Let them through to the dashboard pages!
  return <Outlet />;
}

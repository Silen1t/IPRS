import { Outlet, Navigate } from 'react-router';
import useAuthStore from '@/stores/useAuthStore';
import type { UserRole } from '@/types/enums';
import { ROUTES } from '@/config/routes';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

export default function RoleProtectedRoute({
  allowedRoles,
}: RoleProtectedRouteProps) {
  const role = useAuthStore((state) => state.role);
  
  const isAuthorized = role && allowedRoles.includes(role);

  if (!isAuthorized) {
    return <Navigate to={ROUTES.errors.forbidden} replace />;
  }

  return <Outlet />;
}
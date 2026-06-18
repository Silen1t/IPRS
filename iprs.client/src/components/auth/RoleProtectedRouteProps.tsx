import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '../../types/enums';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

export default function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const role = useAuthStore((state) => state.role);

  if (!role || !allowedRoles.includes(role)) {
    // Bounce unauthorized users back to the safe main dashboard view
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
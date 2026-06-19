import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UserRole } from '../../types/enums';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode; 
}

export default function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const userRole = useAuthStore((state) => state.role);

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
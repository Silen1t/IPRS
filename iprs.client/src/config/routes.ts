import {
  LayoutDashboard,
  Bell,
  FileChartColumn,
  Files,
  Tags,
  Building2,
  Users2,
} from 'lucide-react';
import { UserRole } from '@/types/enums';
import type { ComponentType } from 'react';

export const ROUTES = {
  auth: {
    login: '/',
  },
  dashboard: {
    home: '/dashboard',
    reports: '/dashboard/reports',
    departmentsManagement: '/dashboard/departments-management',
    usersManagement: '/dashboard/users-management',
    categoryManagement: '/dashboard/category-management',
  },
  requests: {
    list: '/dashboard/requests',
    approvedRequests: '/dashboard/approved-requests',
    myRequests: '/dashboard/my-requests',
    create: '/dashboard/requests/create',
    detail: (id: string | number) => `/dashboard/requests/${id}`,
    edit: (id: string | number) => `/dashboard/requests/${id}/edit`,
  },
  notifications: '/dashboard/notifications',
  errors: {
    forbidden: '/forbidden',
    sessionExpired: '/session-expired',
    networkError: '/network-error',
    maintenance: '/maintenance',
    notFound: '/not-found',
  },
} as const;

export type AppRoutes = typeof ROUTES;

export interface NavItem {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

export const SIDEBAR_CONFIG = {
  navMain: [
    {
      title: 'Dashboard',
      url: ROUTES.dashboard.home,
      icon: LayoutDashboard,
    },
    {
      title: 'Notifications',
      url: ROUTES.notifications,
      icon: Bell,
    },
  ] as NavItem[],

  roles: [
    {
      title: 'Department Requests',
      url: ROUTES.requests.list,
      icon: Files,
      roles: [UserRole.Manager],
    },
    {
      title: 'Reports',
      url: ROUTES.dashboard.reports,
      icon: FileChartColumn,
      roles: [UserRole.Admin, UserRole.Finance],
    },
    {
      title: 'User Management',
      url: ROUTES.dashboard.usersManagement,
      icon: Users2,
      roles: [UserRole.Admin],
    },
    {
      title: 'Department Management',
      url: ROUTES.dashboard.departmentsManagement,
      icon: Building2,
      roles: [UserRole.Admin],
    },
    {
      title: 'Category Management',
      url: ROUTES.dashboard.categoryManagement,
      icon: Tags,
      roles: [UserRole.Admin],
    },
    {
      title: 'My Requests',
      url: ROUTES.requests.myRequests,
      icon: Files,
      roles: [UserRole.Employee],
    },
  ] as NavItem[],
};

export type AppSidebarConfig = typeof SIDEBAR_CONFIG;

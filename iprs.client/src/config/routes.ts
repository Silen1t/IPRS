import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  Files,
  FileChartColumn, // Standard lucide naming convention
} from 'lucide-react';
import { UserRole } from '@/types/enums';

// ==========================================
// 1. Centralized Page Routing Map
// ==========================================
export const ROUTES = {
  auth: {
    login: '/',
  },
  dashboard: {
    home: '/dashboard',
    reports: '/dashboard/reports',
    departments: '/dashboard/departments',
  },
  requests: {
    list: '/dashboard/requests',
    myRequests: '/dashboard/my-requests',
    create: '/dashboard/requests/create',
    detail: (id: string | number) => `/dashboard/requests/${id}`,
  },
  notifications: '/dashboard/notifications',
} as const;

export type AppRoutes = typeof ROUTES;

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
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
      title: 'Department Requests',
      url: ROUTES.requests.list,
      icon: Users,
      roles: [UserRole.Manager],
    },
    {
      title: 'Global Reports',
      url: ROUTES.dashboard.reports,
      icon: FileText,
      roles: [UserRole.Admin, UserRole.Finance],
    },
    {
      title: 'Notifications',
      url: ROUTES.notifications,
      icon: Bell,
    },
  ] as NavItem[],

  roles: [
    {
      title: 'My Requests',
      url: ROUTES.requests.myRequests, 
      icon: Files,
      roles: [UserRole.Employee],
    },
    {
      title: 'Reports',
      url: ROUTES.dashboard.reports, 
      icon: FileChartColumn,
      roles: [UserRole.Admin],
    },
  ] as NavItem[],
};

export type AppSidebarConfig = typeof SIDEBAR_CONFIG;
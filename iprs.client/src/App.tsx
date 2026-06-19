import DashboardPage from './pages/shared/DashboardPage';
import { Route, Routes } from 'react-router';
import LoginPage from './pages/shared/LoginPage';
import { Toaster } from './shadcn-ui/components/ui/sonner';
// import Header from './components/header/Header';
import { useEffect } from 'react';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import RequestDetailPage from './pages/shared/RequestDetailPage';
import RoleProtectedRoute from './components/auth/RoleProtectedRouteProps';
import { UserRole } from './types/enums';
import MyRequests from './pages/employee/MyRequests';
import NotificationsPage from './pages/shared/NotificationsPage';

export default function App() {
  useEffect(() => {}, []);
  return (
    <>
      <title>IPRS</title>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Level 1 Base Auth Guard */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/requests" element={<RequestDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            <Route
              element={
                <RoleProtectedRoute allowedRoles={[UserRole.Employee]} />
              }
            >
              <Route path="/my-requests" element={<MyRequests />} />
              
            </Route>
          </Route>
        </Route>
      </Routes>

      <Toaster position="top-right" richColors />
    </>
  );
}

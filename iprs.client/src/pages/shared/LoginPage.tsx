import { LoginForm } from '@/components/auth/LoginForm';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shadcn-ui/components/ui/tabs';
import useAuthStore  from '@/stores/useAuthStore';
import { LoginMethod } from '@/types/enums';
import { Navigate, useLocation } from 'react-router';

export default function LoginPage() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();
  if (token) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }
  
  return (
    <main className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Tabs defaultValue="employeeid">
          <TabsList variant={'line'} className={'mb-2 w-full'}>
            <TabsTrigger value="employeeid">Employee ID</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>
          <TabsContent value="employeeid">
            <LoginForm method={LoginMethod.EmployeeId} />
          </TabsContent>
          <TabsContent value="email">
            <LoginForm method={LoginMethod.Email} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

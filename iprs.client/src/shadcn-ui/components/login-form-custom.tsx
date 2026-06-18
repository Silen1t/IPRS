import { cn } from '@/shadcn-ui/lib/utils';
import { Button } from '@/shadcn-ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shadcn-ui/components/ui/card';
import {
  Field,
  // FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/shadcn-ui/components/ui/field';
import { Input } from '@/shadcn-ui/components/ui/input';
import { LoginMethod } from '@/types/enums';
import { useForm } from 'react-hook-form';
import {
  loginEmailSchema,
  loginEmployeeIdSchema,
  type LoginEmail,
  type LoginEmployeeId,
} from '@/schemas/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginByEmail, loginByEmployeeId } from '@/services/authService';
import { useNavigate } from 'react-router';
import { EyeIcon } from 'lucide-react';
import { useState } from 'react';

interface LoginFormProps extends React.ComponentProps<'div'> {
  method: LoginMethod;
}

export function LoginForm({ className, method, ...props }: LoginFormProps) {
  return (
    <Card className={cn('flex flex-col gap-6', className)} {...props}>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your {method} below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {method === LoginMethod.Email ? <EmailForm /> : <EmployeeIdForm />}
      </CardContent>
    </Card>
  );
}

function EmailForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginEmailSchema),
  });
  const onSubmit = async (data: LoginEmail) => {
    await toast.promise(loginByEmail(data), {
      loading: 'Authenticating your email...',
      success: () => {
        navigate('/dashboard', { replace: true });
        return 'Welcome back! Redirecting to dashboard...';
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="space-y-4">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register('email')}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
            >
              <EyeIcon />
            </Button>
          </div>
        </Field>

        <Button
          type="submit"
          className="w-full"
          onClick={() => {
            if (errors.email) {
              toast.error(errors.email.message?.toString());
            } else if (errors.password) {
              toast.error(errors.password.message?.toString());
            }
          }}
        >
          Login
        </Button>
      </FieldGroup>
    </form>
  );
}

function EmployeeIdForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginEmployeeIdSchema),
  });

  const onSubmit = async (data: LoginEmployeeId) => {
    await toast.promise(loginByEmployeeId(data), {
      loading: 'Authenticating your employee ID...',
      success: () => {
        navigate('/dashboard', { replace: true });

        return 'Welcome back! Redirecting to dashboard...';
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="space-y-4">
        <Field>
          <FieldLabel htmlFor="employeeId">Employee ID</FieldLabel>
          <Input
            id="employeeId"
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="0000000000"
            {...register('employeeId', {
              onChange: (e) => {
                const clean = e.target.value.replace(/\D/g, '');
                setValue('employeeId', clean);
              },
            })}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
            >
              <EyeIcon />
            </Button>
          </div>
        </Field>

        <Button
          type="submit"
          className="w-full"
          onClick={() => {
            if (errors.employeeId) {
              toast.error(errors.employeeId.message?.toString());
            } else if (errors.password) {
              toast.error(errors.password.message?.toString());
            }
          }}
        >
          Login
        </Button>
      </FieldGroup>
    </form>
  );
}

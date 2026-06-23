

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
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/shadcn-ui/components/ui/field';
import { Input } from '@/shadcn-ui/components/ui/input';
import { LoginMethod } from '@/types/enums';
import { useForm, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginEmailSchema, loginEmployeeIdSchema } from '@/schemas/auth';
import { toast } from 'sonner';
import { loginByEmail, loginByEmployeeId } from '@/services/authService';
import { useNavigate } from 'react-router';
import { EyeClosed, EyeIcon } from 'lucide-react';
import { useState, type ComponentProps } from 'react';
import { ROUTES } from '@/config/routes';
import type { LoginEmail, LoginEmployeeId } from '@/types/auth';

interface LoginFormProps extends ComponentProps<'div'> {
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

  const form = useForm<LoginEmail>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginEmail) => {
    await toast.promise(loginByEmail(data), {
      loading: 'Authenticating your email...',
      success: () => {
        navigate(ROUTES.dashboard.home, { replace: true });
        return 'Welcome back! Redirecting to dashboard...';
      },
    });
  };

  const onInvalidSubmit = (errors: FieldErrors<LoginEmail>) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message.toString());
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}>
      <FieldGroup className="space-y-4">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                placeholder="m@example.com"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <div className="flex gap-2 w-full">
                <Input
                  {...field}
                  id={field.name}
                  type={showPassword ? 'text' : 'password'}
                  aria-invalid={fieldState.invalid}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeIcon className="size-4" />
                  ) : (
                    <EyeClosed className="size-4" />
                  )}
                </Button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" className="w-full">
          Login
        </Button>
      </FieldGroup>
    </form>
  );
}

function EmployeeIdForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginEmployeeId>({
    resolver: zodResolver(loginEmployeeIdSchema),
    defaultValues: {
      employeeId: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginEmployeeId) => {
    await toast.promise(loginByEmployeeId(data), {
      loading: 'Authenticating your employee ID...',
      success: () => {
        navigate(ROUTES.dashboard.home, { replace: true });
        return 'Welcome back! Redirecting to dashboard...';
      },
    });
  };

  const onInvalidSubmit = (errors: FieldErrors<LoginEmployeeId>) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message.toString());
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}>
      <FieldGroup className="space-y-4">
        <Controller
          name="employeeId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Employee ID</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="0000000000"
                aria-invalid={fieldState.invalid}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/\D/g, '');
                  field.onChange(cleanValue);
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <div className="flex gap-2 w-full">
                <Input
                  {...field}
                  id={field.name}
                  type={showPassword ? 'text' : 'password'}
                  aria-invalid={fieldState.invalid}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeIcon className="size-4" />
                  ) : (
                    <EyeClosed className="size-4" />
                  )}
                </Button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" className="w-full">
          Login
        </Button>
      </FieldGroup>
    </form>
  );
}

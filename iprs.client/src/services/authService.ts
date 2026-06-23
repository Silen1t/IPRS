import {
  type LoginEmail,
  type AuthResponse,
  type LoginEmployeeId,
} from '@/types/auth';

import useAuthStore  from '../stores/useAuthStore';
import { api } from './api';
import type { UserProfile } from '@/types/users';

export async function loginByEmployeeId(credentials: LoginEmployeeId) {
  await login<LoginEmployeeId>(credentials, 'employeeid');
}

export async function loginByEmail(credentials: LoginEmail) {
  await login<LoginEmail>(credentials, 'email');
}

export async function getProfileInfo(): Promise<UserProfile> {
  const res = await api.get<UserProfile>('auth/me');
  return res.data;
}

async function login<T>(credentials: T, method: string) {
  const res = await api.post<AuthResponse>(`auth/login/${method}`, credentials);
  const data = res.data;

  useAuthStore.getState().login(data.token, data.employeeId, data.fullName, data.role);
}

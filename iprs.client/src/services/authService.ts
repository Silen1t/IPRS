import {
  type LoginEmail,
  type AuthResponse,
  type LoginEmployeeId,
} from '../schemas/auth';
import { type UserProfile } from '../schemas/user';

import { useAuthStore } from '../store/useAuthStore';
import { api } from './api';

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

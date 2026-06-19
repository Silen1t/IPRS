import { api } from './api';
import {
  type CreateUserDto,
  type UpdateUserDto,
  type UserResponseDto,
} from '../schemas/user'; 
import { UserRole } from '../types/enums';
import type { Guid } from 'guid-typescript';

export async function getAllUsers(
  role: UserRole | null,
  departmentId: number | null,
  isActive: boolean | null
): Promise<UserResponseDto[]> {
  const res = await api.get<UserResponseDto[]>('users', {
    params: {
      role: role ?? undefined,
      departmentId: departmentId ?? undefined,
      isActive: isActive ?? undefined,
    },
  });

  return res.data;
}

export async function createUser(
  dto: CreateUserDto
): Promise<UserResponseDto> {
  const res = await api.post<UserResponseDto>('users', dto);
  return res.data;
}

export async function getUserById(id: Guid): Promise<UserResponseDto> {
  const res = await api.get<UserResponseDto>(`users/${id}`);
  return res.data;
}

export async function updateUser(
  id: Guid,
  dto: UpdateUserDto
): Promise<UserResponseDto> {
  const res = await api.put<UserResponseDto>(`users/${id}`, dto);
  return res.data;
}

export async function activateUser(id: Guid) {
  await api.patch(`users/${id}/activate`);
}

export async function deactivateUser(id: Guid) {
  await api.patch(`users/${id}/deactivate`);
}

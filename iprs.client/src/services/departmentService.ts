
import type { CreateDepartmentDto, DepartmentResponseDto, UpdateDepartmentDto } from '@/types/department';
import { api } from './api';

export async function getDepartments(): Promise<DepartmentResponseDto[]> {
  const res = await api.get<DepartmentResponseDto[]>('departments');
  return res.data;
}

export async function createDepartment(
  dto: CreateDepartmentDto
): Promise<DepartmentResponseDto> {
  const res = await api.post<DepartmentResponseDto>('departments', dto);
  return res.data;
}

export async function updateDepartment(
  id: number,
  dto: UpdateDepartmentDto
): Promise<DepartmentResponseDto> {
  const res = await api.put<DepartmentResponseDto>(`departments/${id}`, dto);
  return res.data;
}

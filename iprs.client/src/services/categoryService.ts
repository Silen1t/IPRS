
import type { CategoryLookupDto, CreateCategoryDto, UpdateCategoryDto } from '@/types/category';
import { api } from './api';

export async function getAllActiveCategories(): Promise<CategoryLookupDto[]> {
  const res = await api.get<CategoryLookupDto[]>('categories');
  return res.data;
}

export async function createCategory(
  dto: CreateCategoryDto
): Promise<CategoryLookupDto> {
  const res = await api.post<CategoryLookupDto>('categories', dto);
  return res.data;
}

export async function updateCategory(
  id: number,
  dto: UpdateCategoryDto
): Promise<CategoryLookupDto> {
  const res = await api.put<CategoryLookupDto>(`categories/${id}`, dto);
  return res.data;
}

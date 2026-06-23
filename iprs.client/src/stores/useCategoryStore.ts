import { create } from 'zustand';

import {
  getAllActiveCategories,
  createCategory,
  updateCategory,
} from '@/services/categoryService';
import type {
  CategoryLookupDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/types/category';

interface CategoryState {
  categories: CategoryLookupDto[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (dto: CreateCategoryDto) => Promise<void>;
  modifyCategory: (id: number, dto: UpdateCategoryDto) => Promise<void>;
}

const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const lookups = await getAllActiveCategories();
      set({ categories: lookups });
    } catch (err) {
      if (import.meta.env.DEV)
        console.error('Failed to fetch lookup categories:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (dto) => {
    try {
      const responseService = await createCategory(dto);
      if (responseService) {
        set((state) => ({
          categories: [...state.categories, responseService],
        }));
      }
    } catch (err) {
      if (import.meta.env.DEV)
        console.error('Category configuration failure:', err);
      throw err;
    }
  },

  modifyCategory: async (id, dto) => {
    try {
      const responseService = await updateCategory(id, dto);
      if (responseService) {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? responseService : c
          ),
        }));
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Category mutation failure:', err);
      throw err;
    }
  },
}));

export default useCategoryStore;

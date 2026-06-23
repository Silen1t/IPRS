import { create } from 'zustand';

import {
  getDepartments,
  createDepartment,
  updateDepartment,
} from '@/services/departmentService';
import type {
  CreateDepartmentDto,
  DepartmentResponseDto,
  UpdateDepartmentDto,
} from '@/types/department';

interface DepartmentState {
  departments: DepartmentResponseDto[];
  isLoading: boolean;
  fetchDepartments: () => Promise<void>;
  addDepartment: (dto: CreateDepartmentDto) => Promise<void>;
  modifyDepartment: (id: number, dto: UpdateDepartmentDto) => Promise<void>;
}

const useDepartmentStore = create<DepartmentState>((set) => ({
  departments: [],
  isLoading: false,

  fetchDepartments: async () => {
    set({ isLoading: true });
    try {
      const data = await getDepartments();
      set({ departments: data });
    } catch (err) {
      if (import.meta.env.DEV)
        console.error('Failed to load departments:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addDepartment: async (dto) => {
    try {
      const newDept = await createDepartment(dto);
      set((state) => ({ departments: [...state.departments, newDept] }));
    } catch (err) {
      if (import.meta.env.DEV)
        console.error('Failed to create department:', err);
      throw err;
    }
  },

  modifyDepartment: async (id, dto) => {
    try {
      const updatedDept = await updateDepartment(id, dto);
      set((state) => ({
        departments: state.departments.map((d) =>
          d.id === id ? updatedDept : d
        ),
      }));
    } catch (err) {
      if (import.meta.env.DEV)
        console.error('Failed to update department:', err);
      throw err;
    }
  },
}));

export default useDepartmentStore;

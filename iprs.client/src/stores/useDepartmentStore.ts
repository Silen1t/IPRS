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
import { HubConnectionBuilder, LogLevel, type HubConnection } from '@microsoft/signalr';

interface DepartmentState {
  departments: DepartmentResponseDto[];
  isLoading: boolean;
  connection: HubConnection | null;
  initSignalR: (token: string) => Promise<void>;
  disconnectSignalR: () => void;
  refreshDepartments: () => Promise<void>;
  fetchDepartments: () => Promise<void>;
  createDepartment: (dto: CreateDepartmentDto) => Promise<void>;
  modifyDepartment: (id: number, dto: UpdateDepartmentDto) => Promise<void>;
}

const useDepartmentStore = create<DepartmentState>((set, get) => ({
  departments: [],
  isLoading: false,
  connection: null,

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

  createDepartment: async (dto) => {
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

  refreshDepartments: async () => {
    await get().fetchDepartments()
  },

  initSignalR: async (token: string) => {
    const existingConnection = get().connection;

    if (existingConnection && existingConnection.state !== 'Disconnected') {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7209/api/hubs/departments', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('UpdateDepartments', async () => {
      await get().refreshDepartments();
    });

    try {
      await connection.start();
      set({ connection });
      if (import.meta.env.DEV) {
        console.log('SignalR Connected securely via Zustand store.');
      }
    } catch (err) {
      set({ connection: null });
      if (import.meta.env.DEV) {
        console.error('SignalR Hub initialization failed:', err);
      }
    }
  },

  disconnectSignalR: () => {
    const { connection } = get();
    if (connection) {
      connection.stop();
      set({ connection: null });
    }
  },
}));

export default useDepartmentStore;

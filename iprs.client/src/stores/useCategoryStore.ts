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
import {
  HubConnectionBuilder,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr';

interface CategoryState {
  categories: CategoryLookupDto[];
  isLoading: boolean;
  connection: HubConnection | null;
  initSignalR: (token: string) => Promise<void>;
  disconnectSignalR: () => void;
  refreshCategories: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createCategory: (dto: CreateCategoryDto) => Promise<void>;
  modifyCategory: (id: number, dto: UpdateCategoryDto) => Promise<void>;
}

const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  connection: null,
  
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

  createCategory: async (dto) => {
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

  refreshCategories: async () => {
    await get().fetchCategories();
  },

  initSignalR: async (token: string) => {
    const existingConnection = get().connection;

    if (existingConnection && existingConnection.state !== 'Disconnected') {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7209/api/hubs/categories', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('UpdateCategories', async () => {
      await get().refreshCategories();
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

export default useCategoryStore;

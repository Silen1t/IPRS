import { create } from 'zustand';
import type { Guid } from 'guid-typescript';

import {
  getAllUsers,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
} from '@/services/userService';
import { getProfileInfo } from '@/services/authService';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserProfile,
  UserResponseDto,
} from '@/types/users';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';

interface UserState {
  users: UserResponseDto[];
  profile: UserProfile | null;
  isLoading: boolean;
  connection: HubConnection | null;
  initSignalR: (token: string) => Promise<void>;
  disconnectSignalR: () => void;
  refreshUsers: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  createUser: (dto: CreateUserDto) => Promise<void>;
  modifyUser: (id: Guid, dto: UpdateUserDto) => Promise<void>;
  activateUser: (id: Guid) => Promise<void>;
  deactivateUser: (id: Guid) => Promise<void>;
  clearProfile: () => void;
}

const useUserStore = create<UserState>((set, get) => ({
  users: [],
  profile: null,
  isLoading: false,
  connection: null,

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const data = await getAllUsers(null, null, null);
      set({ users: data });
    } catch (err) {
      if (import.meta.env.DEV)
        console.error('Failed to fetch user directory:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    try {
      const profileData = await getProfileInfo();
      set({ profile: profileData });
    } catch (err) {
      if (import.meta.env.DEV)
        console.error('Failed to fetch security profile:', err);
    }
  },

  createUser: async (dto) => {
    try {
      const responseService = await createUser(dto);
      if (responseService) {
        set((state) => ({ users: [...state.users, responseService] }));
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('User registration failure:', err);
      throw err;
    }
  },

  modifyUser: async (id, dto) => {
    try {
      const responseService = await updateUser(id, dto);
      if (responseService) {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id.toString() ? responseService : u
          ),
        }));
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('User modification failure:', err);
      throw err;
    }
  },
  activateUser: async (id: Guid) => {
    await activateUser(id);
  },

  deactivateUser: async (id: Guid) => {
    await deactivateUser(id);
  },
  refreshUsers: async () => {
    await get().fetchUsers();
    await get().fetchProfile();
  },

  clearProfile: () => set({ profile: null }),

  initSignalR: async (token: string) => {
    const existingConnection = get().connection;

    if (existingConnection && existingConnection.state !== 'Disconnected') {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7209/api/hubs/users', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('UpdateUsers', async () => {
      await get().refreshUsers();
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

export default useUserStore;

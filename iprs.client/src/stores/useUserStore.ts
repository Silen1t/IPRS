import { create } from 'zustand';
import type { Guid } from 'guid-typescript';

import { getAllUsers, createUser, updateUser } from '@/services/userService';
import { getProfileInfo } from '@/services/authService';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserProfile,
  UserResponseDto,
} from '@/types/users';

interface UserState {
  users: UserResponseDto[];
  profile: UserProfile | null;
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  addUser: (dto: CreateUserDto) => Promise<void>;
  modifyUser: (id: Guid, dto: UpdateUserDto) => Promise<void>;
  clearProfile: () => void;
}

const useUserStore = create<UserState>((set) => ({
  users: [],
  profile: null,
  isLoading: false,

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

  addUser: async (dto) => {
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

  clearProfile: () => set({ profile: null }),
}));

export default useUserStore;

import { create } from 'zustand';
import type { UserRole } from '../types/enums';
import { toast } from 'sonner';

interface AuthState {
  token: string | null;
  employeeId: string | null;
  fullName: string | null;
  role: UserRole | null;
  login: (token: string, employeeId: string, fullName: string, role: UserRole) => void; 
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('iprs_token'),
  employeeId: localStorage.getItem('iprs_emp_id'),
  fullName: localStorage.getItem('iprs_full_name'),
  role: localStorage.getItem('iprs_role') as UserRole | null,

  login: (token, employeeId, fullName, role) => {
    localStorage.setItem('iprs_token', token);
    localStorage.setItem('iprs_emp_id', employeeId);
    localStorage.setItem('iprs_full_name', fullName);
    localStorage.setItem('iprs_role', role);
    set({ token, employeeId, fullName, role });
  },

  logout: () => {
    localStorage.removeItem('iprs_token');
    localStorage.removeItem('iprs_emp_id');
    localStorage.removeItem('iprs_full_name');
    localStorage.removeItem('iprs_role');
    
    toast.success('You logged out successfully....');
    
    set({ token: null, employeeId: null, fullName: null, role: null });
  },

  isLoggedIn: () => get().token !== null,
}));
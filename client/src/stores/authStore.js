import { create } from 'zustand';
import { users } from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (userData) => {
    const updatedUser = { ...useAuthStore.getState().user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const response = await users.getMe();
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  },
}));

export default useAuthStore;

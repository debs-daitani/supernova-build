import { create } from 'zustand';
import { authAPI } from '../lib/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  signup: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.signup(data);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Signup failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  updateUser: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = { ...useAuthStore.getState().user, ...response.data.user };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Update failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  fetchUser: async () => {
    try {
      const response = await authAPI.getMe();
      const user = response.data.user;

      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  },
}));

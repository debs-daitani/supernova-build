/**
 * Authentication Store (Zustand)
 * Global state management for authentication
 */

import { create } from 'zustand';
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  storeAuthData,
  clearAuthData,
  getStoredUser,
  isAuthenticated as checkIsAuthenticated,
} from '@/lib/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Login user
   */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const { token, user } = await apiLogin(credentials);

      // Store auth data
      storeAuthData(token, user);

      // Update state
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  /**
   * Register new user
   */
  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const { token, user } = await apiRegister(credentials);

      // Store auth data
      storeAuthData(token, user);

      // Update state
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Registration failed. Please try again.';

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    set({ isLoading: true });

    try {
      await apiLogout();
    } catch (error) {
      // Ignore errors, still clear local state
    } finally {
      // Clear auth data
      clearAuthData();

      // Update state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },

  /**
   * Check authentication status (on app load)
   */
  checkAuth: async () => {
    // Check if we have a stored token
    const isAuth = checkIsAuthenticated();

    if (!isAuth) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true });

    try {
      // Try to get current user from API
      const user = await getCurrentUser();

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Token is invalid, clear auth
      clearAuthData();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Update user data
   */
  updateUser: (user: User) => {
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(user));

    // Update state
    set({ user });
  },
}));

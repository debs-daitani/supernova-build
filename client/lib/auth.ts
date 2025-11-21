/**
 * Authentication Helper Functions
 */

import apiClient from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  preferredName?: string;
  pronouns?: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  tokensUsed: number;
  tokensLimit: number;
  requestsUsed: number;
  requestsLimit: number;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  preferredName?: string;
  pronouns?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

/**
 * Register new user
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/register', credentials);
  return response.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Ignore errors on logout
  } finally {
    // Always clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get('/auth/profile');
  return response.data;
}

/**
 * Refresh auth token
 */
export async function refreshToken(): Promise<string> {
  const response = await apiClient.post('/auth/refresh');
  return response.data.token;
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('auth_token');
  return !!token;
}

/**
 * Get stored token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Get stored user
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Store auth data
 */
export function storeAuthData(token: string, user: User): void {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear auth data
 */
export function clearAuthData(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { useAuthStore } from '@/store/useAuthStore';
import { LoginCredentials } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      // Redirect to dashboard (handled by effect above)
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by the store
      console.error('Login failed:', err);
    }
  };

  return <AuthForm mode="login" onSubmit={handleLogin} error={error} isLoading={isLoading} />;
}

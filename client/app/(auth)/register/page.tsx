'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { useAuthStore } from '@/store/useAuthStore';
import { RegisterCredentials } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading, error } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleRegister = async (credentials: RegisterCredentials) => {
    try {
      await register(credentials);
      // Redirect to dashboard (handled by effect above)
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by the store
      console.error('Registration failed:', err);
    }
  };

  return <AuthForm mode="register" onSubmit={handleRegister} error={error} isLoading={isLoading} />;
}

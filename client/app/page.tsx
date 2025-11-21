'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Check authentication status
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Redirect based on auth status
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">dAItaniverse</h1>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
      </div>
    </div>
  );
}

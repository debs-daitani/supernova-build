'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const loadingMessages = [
  "VENUED is getting the stage ready...",
  "Setting up your productivity backstage...",
  "Tuning up your task management...",
  "Loading your creative workspace...",
];

interface UserData {
  id: string;
  email: string;
  name: string | null;
}

export default function VenuedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage] = useState(
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          // Store the intended destination for redirect after login
          const currentPath = window.location.pathname;
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          router.push('/login');
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF008E] to-[#00F0E9] mb-4">
            VENUED
          </h1>
          <div className="w-16 h-16 border-4 border-[#FF008E] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-400 text-lg">
            {loadingMessage}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}

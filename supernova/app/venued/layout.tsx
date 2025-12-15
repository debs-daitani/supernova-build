'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const loadingMessages = [
  "VENUED is getting the stage ready...",
  "Setting up your productivity backstage...",
  "Tuning up your task management...",
  "Loading your creative workspace...",
];

// Subscription tiers that can access VENUED
const VENUED_ACCESS_TIERS = ['VENUED', 'DAITANIVERSE', 'BETA_TESTER'];

interface UserData {
  id: string;
  email: string;
  name: string | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  isBetaTester: boolean;
}

export default function VenuedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
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

        // Check if user has access to VENUED
        const hasAccess = data.user.isBetaTester ||
          VENUED_ACCESS_TIERS.includes(data.user.subscriptionTier);

        if (!hasAccess) {
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }

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

  // Access denied - show upgrade prompt
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF008E] to-[#00F0E9] mb-4">
            VENUED
          </h1>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FF008E] to-[#00F0E9] flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Unlock VENUED
          </h2>
          <p className="text-gray-400 mb-8">
            Get access to VENUED - your ADHD-friendly project management system with task gamification, energy tracking, and brain dumps.
          </p>

          <div className="bg-gray-900 border border-[#FF008E]/30 rounded-xl p-6 mb-6">
            <div className="text-3xl font-bold text-white mb-2">
              £2.60<span className="text-lg text-gray-400">/month</span>
            </div>
            <ul className="text-left text-gray-300 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-[#00F0E9]">✓</span> Full VENUED access
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00F0E9]">✓</span> Project & task management
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00F0E9]">✓</span> Energy tracking tools
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00F0E9]">✓</span> Dopamine rewards system
              </li>
            </ul>
            <button
              onClick={() => router.push('/pricing')}
              className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-[#FF008E] to-[#00F0E9] hover:scale-105 transition-transform"
            >
              Subscribe Now
            </button>
          </div>

          <p className="text-gray-500 text-sm mb-4">
            Or upgrade to dAItaniverse (£26/month) for full platform access
          </p>

          <button
            onClick={() => router.push('/home')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
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

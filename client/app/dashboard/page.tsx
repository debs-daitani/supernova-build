'use client';

import { useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardPage() {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Calculate usage percentages
  const tokensUsagePercent = user ? Math.round((user.tokensUsed / user.tokensLimit) * 100) : 0;
  const requestsUsagePercent = user ? Math.round((user.requestsUsed / user.requestsLimit) * 100) : 0;

  // Determine tier benefits
  const tierBenefits = {
    FREE: ['1,000 tokens/month', '100 requests/month', 'Basic SUPERNova access', 'i•DEA Marketplace access'],
    PRO: ['100,000 tokens/month', '10,000 requests/month', 'Full SUPERNova access', 'Priority support', 'Advanced analytics'],
    ENTERPRISE: ['Unlimited tokens', 'Unlimited requests', 'Custom AI training', 'Dedicated support', 'White-label options'],
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        <div className="flex">
          <Sidebar />

          <main className="flex-1 p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.preferredName || user?.fullName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here's your dAItaniverse overview
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Subscription Tier Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-2 border-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-border">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      Subscription Tier
                    </h3>
                    <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold rounded-full">
                      {user?.tier}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {tierBenefits[user?.tier || 'FREE'].map((benefit, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Token Usage Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Token Usage
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Used</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user?.tokensUsed.toLocaleString()} / {user?.tokensLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${Math.min(tokensUsagePercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {tokensUsagePercent}% used
                  </p>
                </div>
              </div>

              {/* Request Usage Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Request Usage
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Used</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user?.requestsUsed.toLocaleString()} / {user?.requestsLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${Math.min(requestsUsagePercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {requestsUsagePercent}% used
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors text-left group">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">SUPERNova Chat</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start a conversation</p>
                </button>

                <button className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors text-left group">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Browse i•DEAs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Explore the marketplace</p>
                </button>

                <button className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors text-left group">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create i•DEA</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Submit your idea</p>
                </button>

                <button className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors text-left group">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track your performance</p>
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.email}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Full Name:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.fullName}</span>
                </div>
                {user?.preferredName && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Preferred Name:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.preferredName}</span>
                  </div>
                )}
                {user?.pronouns && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Pronouns:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.pronouns}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

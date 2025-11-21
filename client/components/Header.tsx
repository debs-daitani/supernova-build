'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function Header() {
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              dAItaniverse
            </h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-3 focus:outline-none"
            >
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {user?.preferredName?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase() || 'U'}
              </div>

              {/* User Info */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {user?.preferredName || user?.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.tier}</p>
              </div>

              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                {/* User Info in Mobile */}
                <div className="md:hidden px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {user?.preferredName || user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>

                {/* Pronouns */}
                {user?.pronouns && (
                  <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {user.pronouns}
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
}

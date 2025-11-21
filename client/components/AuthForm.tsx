'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: any) => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
}

export default function AuthForm({ mode, onSubmit, error, isLoading }: AuthFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    preferredName: '',
    pronouns: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (mode === 'login') {
      await onSubmit({
        email: formData.email,
        password: formData.password,
      });
    } else {
      await onSubmit({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        preferredName: formData.preferredName || undefined,
        pronouns: formData.pronouns || undefined,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            dAItaniverse
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Register Only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Jane Doe"
              />
            </div>
          )}

          {/* Preferred Name (Register Only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="preferredName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preferred Name
              </label>
              <input
                type="text"
                id="preferredName"
                name="preferredName"
                value={formData.preferredName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Jane (optional)"
              />
            </div>
          )}

          {/* Pronouns (Register Only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pronouns
              </label>
              <input
                type="text"
                id="pronouns"
                name="pronouns"
                value={formData.pronouns}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="she/her, he/him, they/them (optional)"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="jane@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Link */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <Link href="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

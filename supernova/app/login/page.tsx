'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to login')
        setIsLoading(false)
        return
      }

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-neon-pink to-electric-purple shadow-[0_0_30px_rgba(255,27,141,0.6)] mb-4">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-electric-purple to-neon-pink mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400 font-semibold">
            Log in to access SUPERNova AI
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900 border border-neon-pink/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(255,27,141,0.3)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-500 text-sm font-semibold">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black border border-gray-800 rounded-lg pl-11 pr-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black border border-gray-800 rounded-lg pl-11 pr-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-black text-white tracking-wide transition-all ${
                isLoading
                  ? 'bg-gray-800 cursor-not-allowed'
                  : 'bg-gradient-to-r from-neon-pink to-electric-purple hover:scale-105 shadow-[0_0_20px_rgba(255,27,141,0.6)]'
              }`}
            >
              {isLoading ? 'LOGGING IN...' : 'LOG IN'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 font-medium">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-neon-pink font-bold hover:text-electric-purple transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-8 font-semibold">
          Part of The dAItaniverse • Powered by Claude AI
        </p>
      </div>
    </div>
  )
}

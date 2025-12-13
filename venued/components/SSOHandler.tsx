/**
 * VENUED SSO Handler Component
 *
 * Displays authentication status and handles SSO flow
 * Shows loading, success, and error states
 */

'use client'

import { useSSO } from '@/lib/useSSO'
import { Loader2, CheckCircle, AlertCircle, Rocket, LogIn } from 'lucide-react'

interface SSOHandlerProps {
  children: React.ReactNode
  requireAuth?: boolean
  showStatus?: boolean
}

export default function SSOHandler({
  children,
  requireAuth = false,
  showStatus = true,
}: SSOHandlerProps) {
  const { isLoading, isAuthenticated, user, error } = useSSO()

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-8 rounded-2xl bg-gradient-to-br from-neon-pink/20 to-electric-purple/20 border border-neon-pink/30 backdrop-blur-sm mb-6 animate-pulse">
            <Loader2 className="w-12 h-12 text-neon-pink animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Authenticating...</h2>
          <p className="text-gray-400 font-semibold">
            Verifying your SUPERNova session
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex p-8 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-700/20 border border-red-500/30 backdrop-blur-sm mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Authentication Failed</h2>
          <p className="text-gray-400 font-semibold mb-6">{error}</p>
          <a
            href="http://localhost:3001"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-pink to-electric-purple rounded-full text-white font-bold hover:scale-105 transition-all"
          >
            <Rocket className="w-5 h-5" />
            Return to SUPERNova
          </a>
        </div>
      </div>
    )
  }

  // Require auth but not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex p-8 rounded-2xl bg-gradient-to-br from-neon-pink/20 to-electric-purple/20 border border-neon-pink/30 backdrop-blur-sm mb-6">
            <LogIn className="w-12 h-12 text-neon-pink" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Sign In Required</h2>
          <p className="text-gray-400 font-semibold mb-6">
            Please sign in through SUPERNova to access VENUED
          </p>
          <a
            href="http://localhost:3001"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-pink to-electric-purple rounded-full text-white font-bold hover:scale-105 transition-all"
          >
            <Rocket className="w-5 h-5" />
            Launch SUPERNova
          </a>
        </div>
      </div>
    )
  }

  // Success - show status badge if enabled
  if (showStatus && isAuthenticated && user) {
    return (
      <div>
        {/* SSO Success Banner */}
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-br from-neon-pink/20 to-electric-purple/20 border border-neon-pink/30 backdrop-blur-md rounded-xl px-4 py-3 shadow-[0_0_30px_rgba(255,0,142,0.3)]">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-neon-green" />
              <div>
                <p className="text-sm font-bold text-white">Connected to SUPERNova</p>
                <p className="text-xs text-gray-300">{user.name || user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Render children */}
        {children}
      </div>
    )
  }

  // Not authenticated but not required - just show children
  return <>{children}</>
}

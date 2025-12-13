'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          // User is authenticated, redirect to home dashboard
          router.push('/home')
        } else {
          // User is not authenticated, redirect to login
          router.push('/login')
        }
      } catch (error) {
        // Error checking auth, redirect to login
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  // Loading state while checking auth
  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-neon-pink to-electric-purple shadow-[0_0_30px_rgba(255,27,141,0.6)] mb-4 animate-pulse">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-gray-400 font-semibold">Loading SUPERNova AI...</p>
      </div>
    </div>
  )
}

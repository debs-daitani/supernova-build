'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../home/components/Sidebar'
import Header from '../home/components/Header'

const loadingMessages = [
  "The dAItaniverse is soundchecking...",
  "The dAItaniverse is getting ready to rock...",
  "The dAItaniverse is getting its shit together...",
  "The dAItaniverse is preparing your stage...",
]

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  subscriptionTier: string
  subscriptionStatus: string
  isBetaTester: boolean
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loadingMessage] = useState(
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
  )

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login')
          return
        }
        const data = await response.json()

        // Check if user is admin
        if (data.user.role !== 'ADMIN') {
          router.push('/home')
          return
        }

        setUser(data.user)
      } catch (error) {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <img
          src="/images/logo-full-400.png"
          alt="The dAItaniverse"
          className="max-w-[400px] w-full mb-8 animate-pulse"
        />
        <p className="text-[#888888] text-lg font-josefin">
          {loadingMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/dAitaniverse%20Stage.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Header */}
      <Header user={user} onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen relative z-10">
        {children}
      </main>
    </div>
  )
}

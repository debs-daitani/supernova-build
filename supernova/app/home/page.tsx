'use client'

import { useEffect, useState } from 'react'

// Widgets
import EnergyWidget from './components/widgets/EnergyWidget'
import ContactsWidget from './components/widgets/ContactsWidget'
import RevenueWidget from './components/widgets/RevenueWidget'
import ActivityWidget from './components/widgets/ActivityWidget'
import QuickChatWidget from './components/widgets/QuickChatWidget'
import NextHitWidget from './components/widgets/NextHitWidget'
import EmailStatsWidget from './components/widgets/EmailStatsWidget'
import QuizStatsWidget from './components/widgets/QuizStatsWidget'
import QuickActionsWidget from './components/widgets/QuickActionsWidget'

interface UserData {
  id: string
  email: string
  name: string | null
}

export default function HomePage() {
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }

    fetchUser()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getFirstName = () => {
    if (user?.name) {
      return user.name.split(' ')[0]
    }
    return 'rockstar'
  }

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
    return new Date().toLocaleDateString('en-GB', options)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col items-center mb-8">
        <img
          src="/images/logo-full-400.png"
          alt="The dAItaniverse - Authentic Impactful AI"
          className="max-w-[400px] w-full mb-6"
        />
        <h1 className="font-arp-display text-3xl md:text-4xl font-bold text-white mb-2">
          {getGreeting()}, {getFirstName()}! 🤘
        </h1>
        <p className="text-[#888888] font-josefin text-lg">
          {formatDate()} • Ready to rock?
        </p>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Row 1: Quick Stats */}
        <EnergyWidget />
        <ContactsWidget />
        <RevenueWidget />

        {/* Row 2: Activity + Quick Chat */}
        <ActivityWidget />
        <QuickChatWidget userId={user?.id} />

        {/* Row 3: Next Hit + Email Stats */}
        <NextHitWidget />
        <EmailStatsWidget />

        {/* Row 4: Quiz Stats + Quick Actions */}
        <QuizStatsWidget />
        <QuickActionsWidget userId={user?.id} />
      </div>
    </div>
  )
}

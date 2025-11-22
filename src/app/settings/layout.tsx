'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Lock, Bell, Palette, CreditCard, Settings as SettingsIcon, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const settingsNavigation = [
  { name: 'Profile', href: '/settings/profile', icon: User },
  { name: 'Account', href: '/settings/account', icon: SettingsIcon },
  { name: 'Password', href: '/settings/password', icon: Lock },
  { name: 'Notifications', href: '/settings/notifications', icon: Bell },
  { name: 'Appearance', href: '/settings/appearance', icon: Palette },
  { name: 'Billing', href: '/settings/billing', icon: CreditCard, badge: 'Pro' },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-pink-purple flex items-center justify-center">
              <span className="text-white font-bold">dA</span>
            </div>
            <span className="text-lg font-bold">dAItaniverse</span>
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <aside className="space-y-1">
            <nav className="space-y-1">
              {settingsNavigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-gradient-pink-purple text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className={cn(
                        'ml-auto px-2 py-0.5 text-xs rounded-full',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-pink-100 text-pink-700'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}

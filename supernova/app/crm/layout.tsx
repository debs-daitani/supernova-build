'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, PoundSterling, CheckSquare, BarChart3, Upload } from 'lucide-react'

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/crm/contacts', label: 'Contacts', icon: Users },
    { href: '/crm/deals', label: 'Deals', icon: PoundSterling },
    { href: '/crm/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/crm/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/crm/contacts/import', label: 'Import', icon: Upload },
  ]

  return (
    <div
      className="min-h-screen bg-black"
      style={{
        backgroundImage: 'url("/images/dAitaniverse Stage.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <div className="backdrop-blur-xl bg-black/50 border-b border-light-teal/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime">
                CRM
              </h1>
              <p className="text-sm text-gray-400 font-josefin">Customer Relationship Management</p>
            </div>
            <Link
              href="/home"
              className="px-4 py-2 rounded-lg bg-light-teal/10 hover:bg-light-teal/20 text-light-teal font-josefin transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="backdrop-blur-xl bg-white/5 border-b border-light-teal/10">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 font-josefin transition-all border-b-2 ${
                    isActive
                      ? 'border-light-teal text-light-teal bg-light-teal/10'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  )
}

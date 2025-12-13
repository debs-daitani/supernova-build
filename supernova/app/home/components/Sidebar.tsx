'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  MessageSquare,
  Users,
  Mail,
  BarChart3,
  Guitar,
  CreditCard,
  DollarSign,
  BookOpen,
  GraduationCap,
  FileText,
  Globe,
  Calendar,
  UsersRound,
  Inbox,
  TrendingUp,
  Zap,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  external?: boolean
  comingSoon?: boolean
  working?: boolean
}

interface NavSection {
  label?: string
  items: NavItem[]
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleComingSoon = (label: string) => {
    setToastMessage(`${label} is coming soon! SUPERNova is working on it. 🤘`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const navSections: NavSection[] = [
    {
      items: [
        { icon: <Home size={20} />, label: 'Home', href: '/home', working: true },
        { icon: <MessageSquare size={20} />, label: 'SUPERNova Chat', href: '/dashboard', working: true },
      ],
    },
    {
      label: 'GROW',
      items: [
        { icon: <Users size={20} />, label: 'CRM', href: '/crm', working: true },
        { icon: <Mail size={20} />, label: 'Email Marketing', href: '/email', working: true },
        { icon: <BarChart3 size={20} />, label: 'Quiz Builder', href: '/admin/quiz/create', working: true },
        { icon: <Guitar size={20} />, label: 'VENUED', href: 'https://venued.wtf', external: true, working: true },
      ],
    },
    {
      label: 'MONEY',
      items: [
        { icon: <CreditCard size={20} />, label: 'Billing', href: '/billing', working: true },
        { icon: <DollarSign size={20} />, label: 'Payments Admin', href: '/admin/billing/revenue', working: true },
      ],
    },
    {
      label: 'LEARN',
      items: [
        { icon: <BookOpen size={20} />, label: 'Content Library', href: '/learn', comingSoon: true },
        { icon: <GraduationCap size={20} />, label: 'Programs', href: '/programs', comingSoon: true },
      ],
    },
    {
      label: 'CREATE',
      items: [
        { icon: <FileText size={20} />, label: 'Blog', href: '/blog', comingSoon: true },
        { icon: <Globe size={20} />, label: 'Website Builder', href: '/sites', comingSoon: true },
        { icon: <Calendar size={20} />, label: 'Calendar', href: '/calendar', comingSoon: true },
      ],
    },
    {
      label: 'COMMUNITY',
      items: [
        { icon: <UsersRound size={20} />, label: 'Groups', href: '/community', comingSoon: true },
        { icon: <Inbox size={20} />, label: 'Inbox', href: '/inbox', comingSoon: true },
      ],
    },
    {
      label: 'ANALYSE',
      items: [
        { icon: <TrendingUp size={20} />, label: 'Analytics', href: '/crm/analytics', working: true },
        { icon: <Zap size={20} />, label: 'Automations', href: '/automations', comingSoon: true },
      ],
    },
  ]

  const bottomItems: NavItem[] = [
    { icon: <Settings size={20} />, label: 'Settings', href: '/account', working: true },
    { icon: <HelpCircle size={20} />, label: 'Help', href: '/help', comingSoon: true },
  ]

  const isActive = (href: string) => pathname === href

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href)

    if (item.comingSoon) {
      return (
        <button
          onClick={() => handleComingSoon(item.label)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-[#666666] opacity-60 hover:opacity-80 transition-all font-josefin text-sm"
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <span className="text-[10px] bg-[#3d3d3d] text-[#888888] px-1.5 py-0.5 rounded">
            SOON
          </span>
        </button>
      )
    }

    if (item.external) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-[#3d3d3d] transition-all font-josefin text-sm"
        >
          {item.icon}
          <span>{item.label}</span>
        </a>
      )
    }

    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-josefin text-sm ${
          active
            ? 'bg-gradient-to-r from-[#FF008E] to-[#C9005C] text-white font-semibold'
            : 'text-white hover:bg-[#3d3d3d]'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-[#1a1a1a] border-r border-[#3d3d3d] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-[#3d3d3d] flex justify-center">
          <Link href="/home" className="block">
            <img
              src="/images/logo-icon-40.png"
              alt="dAItaniverse"
              className="w-10 h-10"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section, idx) => (
            <div key={idx} className={section.label ? 'mt-6' : ''}>
              {section.label && (
                <p className="px-4 mb-2 text-xs font-semibold text-[#888888] uppercase tracking-wide">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItemComponent key={item.label} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-[#3d3d3d] p-3">
          <div className="space-y-1">
            {bottomItems.map((item) => (
              <NavItemComponent key={item.label} item={item} />
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-[#3d3d3d] transition-all font-josefin text-sm"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-[#666666] mt-4 pb-2">
            Built on dAItaniverse 🤘
          </p>
        </div>
      </aside>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#1a1a1a] border border-[#00F0E9] text-white px-6 py-4 rounded-lg shadow-lg animate-fade-in font-josefin">
          {toastMessage}
        </div>
      )}
    </>
  )
}

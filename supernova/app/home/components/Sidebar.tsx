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
  FolderOpen,
  Cloud,
  UserPlus,
  Video,
  Workflow,
  Wand2,
  Image,
  Film,
  ImagePlus,
  Scissors,
  FileEdit,
  Table2,
  Presentation,
  Palette,
  Layout,
  Sparkles,
  PieChart,
  LineChart,
  Activity,
  MousePointer,
  MessageCircle,
  Award,
  CalendarClock,
  Gift,
  Crown,
  Ticket,
  ArrowRightLeft,
  CalendarCheck,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  PenSquare,
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string | null
  subscriptionTier: string
  subscriptionStatus: string
  isBetaTester: boolean
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  user: UserData | null
}

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  external?: boolean
  comingSoon?: boolean
  working?: boolean
  requiresFullAccess?: boolean // Requires DAITANIVERSE or BETA_TESTER tier
}

interface NavSection {
  label?: string
  items: NavItem[]
  collapsible?: boolean
  requiresFullAccess?: boolean // Entire section requires DAITANIVERSE or BETA_TESTER tier
}

// Full access tiers that can see all features
const FULL_ACCESS_TIERS = ['DAITANIVERSE', 'BETA_TESTER'];

export default function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'CREATIVE STUDIO': true,
    'COMMUNITY': true,
    'ADDITIONAL': true,
  })

  // Check if user has full platform access
  const hasFullAccess = user?.isBetaTester || FULL_ACCESS_TIERS.includes(user?.subscriptionTier || '')

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const toggleSection = (label: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const navSections: NavSection[] = [
    {
      items: [
        { icon: <Home size={20} />, label: 'Home', href: '/home', working: true },
        { icon: <MessageSquare size={20} />, label: 'SUPERNova Chat', href: '/supernova', working: true, requiresFullAccess: true },
        { icon: <PenSquare size={20} />, label: 'Blog', href: '/blog', working: true },
        { icon: <Guitar size={20} />, label: 'VENUED', href: '/venued', working: true },
      ],
    },
    {
      label: 'BUSINESS HUB',
      requiresFullAccess: true,
      items: [
        { icon: <Users size={20} />, label: 'CRM', href: '/crm', working: true },
        { icon: <Mail size={20} />, label: 'Email Marketing', href: '/email', working: true },
        { icon: <Calendar size={20} />, label: 'Calendar', href: '/coming-soon/calendar', comingSoon: true },
        { icon: <FolderOpen size={20} />, label: 'Documents', href: '/coming-soon/documents', comingSoon: true },
        { icon: <Cloud size={20} />, label: 'Cloud Storage', href: '/coming-soon/cloud-storage', comingSoon: true },
        { icon: <UserPlus size={20} />, label: 'Team Collaboration', href: '/coming-soon/team-collaboration', comingSoon: true },
        { icon: <Video size={20} />, label: 'Video Platform', href: '/coming-soon/video-platform', comingSoon: true },
        { icon: <Workflow size={20} />, label: 'Workflows', href: '/coming-soon/workflows', comingSoon: true },
      ],
    },
    {
      label: 'CREATIVE STUDIO',
      collapsible: true,
      requiresFullAccess: true,
      items: [
        { icon: <Wand2 size={20} />, label: 'AI Content', href: '/coming-soon/ai-content', comingSoon: true },
        { icon: <Image size={20} />, label: 'Image Generation', href: '/coming-soon/image-generation', comingSoon: true },
        { icon: <Film size={20} />, label: 'Video Generation', href: '/coming-soon/video-generation', comingSoon: true },
        { icon: <ImagePlus size={20} />, label: 'Image Editor', href: '/coming-soon/image-editor', comingSoon: true },
        { icon: <Scissors size={20} />, label: 'Video Editor', href: '/coming-soon/video-editor', comingSoon: true },
        { icon: <FileEdit size={20} />, label: 'PDF Editor', href: '/coming-soon/pdf-editor', comingSoon: true },
        { icon: <FileText size={20} />, label: 'Document Editor', href: '/coming-soon/document-editor', comingSoon: true },
        { icon: <Table2 size={20} />, label: 'Spreadsheets', href: '/coming-soon/spreadsheets', comingSoon: true },
        { icon: <Presentation size={20} />, label: 'Presentations', href: '/coming-soon/presentations', comingSoon: true },
        { icon: <Palette size={20} />, label: 'Brand Kit', href: '/coming-soon/brand-kit', comingSoon: true },
        { icon: <Globe size={20} />, label: 'Website Builder', href: '/coming-soon/website-builder', comingSoon: true },
        { icon: <Layout size={20} />, label: 'Templates', href: '/coming-soon/templates', comingSoon: true },
        { icon: <Sparkles size={20} />, label: 'Logo Creator', href: '/coming-soon/logo-creator', comingSoon: true },
      ],
    },
    {
      label: 'LEARN',
      requiresFullAccess: true,
      items: [
        { icon: <BookOpen size={20} />, label: 'Guides', href: '/guides', working: true },
        { icon: <BarChart3 size={20} />, label: 'Quiz Builder', href: '/admin/quiz/create', working: true },
        { icon: <GraduationCap size={20} />, label: 'Programme Library', href: '/coming-soon/programmes', comingSoon: true },
        { icon: <FileText size={20} />, label: 'Content Creation', href: '/coming-soon/content-creation-programme', comingSoon: true },
        { icon: <UsersRound size={20} />, label: 'Social Media Strategy', href: '/coming-soon/social-media-programme', comingSoon: true },
        { icon: <Award size={20} />, label: 'Personal Branding', href: '/coming-soon/personal-branding-programme', comingSoon: true },
        { icon: <Zap size={20} />, label: 'AI Leverage', href: '/coming-soon/ai-leverage-programme', comingSoon: true },
      ],
    },
    {
      label: 'ANALYTICS',
      requiresFullAccess: true,
      items: [
        { icon: <PieChart size={20} />, label: 'Dashboard', href: '/coming-soon/analytics-dashboard', comingSoon: true },
        { icon: <TrendingUp size={20} />, label: 'CRM Analytics', href: '/crm/analytics', working: true },
        { icon: <LineChart size={20} />, label: 'Revenue Analytics', href: '/coming-soon/revenue-analytics', comingSoon: true },
        { icon: <Activity size={20} />, label: 'Content Performance', href: '/coming-soon/content-performance', comingSoon: true },
        { icon: <MousePointer size={20} />, label: 'User Behaviour', href: '/coming-soon/user-behaviour', comingSoon: true },
      ],
    },
    {
      label: 'COMMUNITY',
      collapsible: true,
      requiresFullAccess: true,
      items: [
        { icon: <MessageCircle size={20} />, label: 'Forum', href: '/coming-soon/community-forum', comingSoon: true },
        { icon: <Users size={20} />, label: 'Member Profiles', href: '/coming-soon/member-profiles', comingSoon: true },
        { icon: <UsersRound size={20} />, label: 'Groups', href: '/coming-soon/groups', comingSoon: true },
        { icon: <CalendarClock size={20} />, label: 'Events', href: '/coming-soon/events', comingSoon: true },
        { icon: <Inbox size={20} />, label: 'Direct Messages', href: '/coming-soon/direct-messages', comingSoon: true },
        { icon: <Award size={20} />, label: 'Leaderboard', href: '/coming-soon/leaderboard', comingSoon: true },
      ],
    },
    {
      label: 'MONEY',
      requiresFullAccess: true,
      items: [
        { icon: <CreditCard size={20} />, label: 'Billing', href: '/billing', working: true },
        { icon: <DollarSign size={20} />, label: 'Payments Admin', href: '/admin/billing/revenue', working: true },
        { icon: <PenSquare size={20} />, label: 'Blog Manager', href: '/admin/blog', working: true },
        { icon: <ShoppingBag size={20} />, label: 'Ecommerce', href: '/coming-soon/ecommerce', comingSoon: true },
        { icon: <CalendarCheck size={20} />, label: 'Booking System', href: '/coming-soon/booking-system', comingSoon: true },
      ],
    },
    {
      label: 'ADDITIONAL',
      collapsible: true,
      requiresFullAccess: true,
      items: [
        { icon: <Gift size={20} />, label: 'Affiliate Program', href: '/coming-soon/affiliate-program', comingSoon: true },
        { icon: <Crown size={20} />, label: 'Membership Tiers', href: '/coming-soon/membership-tiers', comingSoon: true },
        { icon: <Ticket size={20} />, label: 'Support Tickets', href: '/coming-soon/support-tickets', comingSoon: true },
        { icon: <ArrowRightLeft size={20} />, label: 'Migration Tools', href: '/coming-soon/migration-tools', comingSoon: true },
      ],
    },
  ]

  const bottomItems: NavItem[] = [
    { icon: <Settings size={20} />, label: 'Settings', href: '/account', working: true },
    { icon: <HelpCircle size={20} />, label: 'Help', href: '/coming-soon/help', comingSoon: true },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href)

    if (item.comingSoon) {
      return (
        <Link
          href={item.href}
          onClick={onClose}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[#666666] hover:text-[#888888] hover:bg-[#1a1a1a]/50 transition-all font-josefin text-sm"
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <span className="text-[9px] bg-gradient-to-r from-[#FF008E]/20 to-[#00F0E9]/20 text-[#FF008E] px-1.5 py-0.5 rounded font-semibold">
            SOON
          </span>
        </Link>
      )
    }

    if (item.external) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white hover:bg-[#3d3d3d] transition-all font-josefin text-sm"
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
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-josefin text-sm ${
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#0a0a0a] border-r border-[#3d3d3d] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
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
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-[#3d3d3d] scrollbar-track-transparent">
          {navSections.map((section, idx) => {
            // Skip entire sections that require full access if user doesn't have it
            if (section.requiresFullAccess && !hasFullAccess) {
              return null
            }

            const isCollapsed = section.label ? collapsedSections[section.label] : false
            const isCollapsible = section.collapsible

            // Filter items that require full access
            const visibleItems = section.items.filter(item =>
              !item.requiresFullAccess || hasFullAccess
            )

            // Skip if no items are visible
            if (visibleItems.length === 0) {
              return null
            }

            return (
              <div key={idx} className={section.label ? 'mt-4' : ''}>
                {section.label && (
                  <button
                    onClick={() => isCollapsible && toggleSection(section.label!)}
                    className={`w-full flex items-center justify-between px-4 mb-1 text-xs font-semibold text-[#888888] uppercase tracking-wide ${
                      isCollapsible ? 'cursor-pointer hover:text-white' : 'cursor-default'
                    }`}
                  >
                    <span>{section.label}</span>
                    {isCollapsible && (
                      isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                )}
                {(!isCollapsible || !isCollapsed) && (
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => (
                      <NavItemComponent key={item.label} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Upgrade prompt for VENUED-only users */}
          {!hasFullAccess && (
            <div className="mt-6 mx-2 p-4 rounded-xl bg-gradient-to-br from-[#FF008E]/10 to-[#00F0E9]/10 border border-[#FF008E]/30">
              <p className="text-sm text-gray-300 mb-3 font-medium">
                Unlock the full dAItaniverse
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-[#FF008E] to-[#00F0E9] text-white text-sm font-bold hover:scale-105 transition-transform"
              >
                Upgrade to £26/mo
              </button>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-[#3d3d3d] p-3">
          <div className="space-y-0.5">
            {bottomItems.map((item) => (
              <NavItemComponent key={item.label} item={item} />
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white hover:bg-[#3d3d3d] transition-all font-josefin text-sm"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-[#666666] mt-4 pb-2">
            Built on dAItaniverse
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

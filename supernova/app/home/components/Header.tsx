'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react'

interface HeaderProps {
  user: {
    name?: string | null
    email: string
  } | null
  onMenuClick: () => void
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  const notificationCount = 3 // Placeholder

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-[#3d3d3d] z-50 flex items-center justify-between px-4 lg:pl-64">
      {/* Left: Hamburger (mobile) + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#3d3d3d] transition-colors"
        >
          <Menu size={24} />
        </button>

        <Link href="/home" className="lg:hidden">
          <span className="font-supernova text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF008E] to-[#00F0E9]">
            SN
          </span>
        </Link>
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#3d3d3d] transition-colors"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#FF008E] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg shadow-xl overflow-hidden">
              <div className="p-4 border-b border-[#3d3d3d]">
                <h3 className="font-semibold text-white">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-4 hover:bg-[#3d3d3d] cursor-pointer border-b border-[#3d3d3d]">
                  <p className="text-white text-sm">New contact added: Jane Smith</p>
                  <p className="text-[#888888] text-xs mt-1">2 hours ago</p>
                </div>
                <div className="p-4 hover:bg-[#3d3d3d] cursor-pointer border-b border-[#3d3d3d]">
                  <p className="text-white text-sm">Quiz completed by 3 new leads</p>
                  <p className="text-[#888888] text-xs mt-1">Yesterday</p>
                </div>
                <div className="p-4 hover:bg-[#3d3d3d] cursor-pointer">
                  <p className="text-white text-sm">Payment received: £97</p>
                  <p className="text-[#888888] text-xs mt-1">2 days ago</p>
                </div>
              </div>
              <div className="p-3 border-t border-[#3d3d3d]">
                <button className="w-full text-center text-[#00F0E9] text-sm hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#3d3d3d] transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF008E] to-[#00F0E9] flex items-center justify-center text-white font-bold text-sm">
              {getInitials()}
            </div>
            <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg shadow-xl overflow-hidden">
              <div className="p-4 border-b border-[#3d3d3d]">
                <p className="text-white font-semibold truncate">
                  {user?.name || 'Rockstar'}
                </p>
                <p className="text-[#888888] text-sm truncate">{user?.email}</p>
              </div>
              <div className="py-2">
                <Link
                  href="/account"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#3d3d3d] transition-colors"
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/account/billing"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#3d3d3d] transition-colors"
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#3d3d3d] transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isMarkketingPage = ['/', '/home', '/about', '/sales', '/pricing'].some(page =>
    pathname === page || pathname.startsWith(page + '/')
  )

  if (!isMarkketingPage && pathname !== '/' && pathname !== '/home') {
    return null // Hide navigation on app pages
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-charcoal/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center space-x-2">
          <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-hot-pink to-light-teal">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-supernova text-xl font-bold text-white hidden sm:inline">dAItaniverse</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/home"
            className="font-josefin text-gray-300 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="font-josefin text-gray-300 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link
            href="/sales"
            className="font-josefin text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="font-josefin text-gray-300 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/checkout"
            className="px-6 py-2 bg-hot-pink hover:bg-[#ff1b7f] text-white font-bold rounded-full transition-all duration-300"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-charcoal/50 px-6 py-4 space-y-4">
          <Link
            href="/home"
            className="block font-josefin text-gray-300 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/about"
            className="block font-josefin text-gray-300 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/sales"
            className="block font-josefin text-gray-300 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="block font-josefin text-gray-300 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/checkout"
            className="block px-6 py-2 bg-hot-pink hover:bg-[#ff1b7f] text-white font-bold rounded-full transition-all duration-300 text-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            Start Free Trial
          </Link>
        </div>
      )}
    </nav>
  )
}

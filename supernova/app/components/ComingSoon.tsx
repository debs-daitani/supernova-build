'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Sparkles } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description: string
  icon?: React.ReactNode
  category?: string
}

export default function ComingSoon({ title, description, icon, category }: ComingSoonProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement email capture
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#FF008E]/10 via-transparent to-[#00F0E9]/10 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 py-12">
        {/* Back button */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-[#888888] hover:text-white transition-colors mb-12 font-josefin"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Main content */}
        <div className="text-center">
          {/* Category badge */}
          {category && (
            <span className="inline-block px-4 py-1 bg-[#1a1a1a] border border-[#3d3d3d] rounded-full text-xs font-semibold text-[#888888] uppercase tracking-wider mb-6">
              {category}
            </span>
          )}

          {/* Icon */}
          {icon && (
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FF008E]/20 to-[#00F0E9]/20 rounded-2xl flex items-center justify-center border border-[#3d3d3d]">
              <div className="text-[#FF008E]">
                {icon}
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-josefin bg-gradient-to-r from-[#FF008E] to-[#00F0E9] bg-clip-text text-transparent">
            {title}
          </h1>

          {/* Coming Soon badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF008E] to-[#C9005C] rounded-full text-white text-sm font-semibold mb-8">
            <Sparkles size={16} />
            <span>Coming Soon</span>
          </div>

          {/* Description */}
          <p className="text-lg text-[#888888] leading-relaxed mb-10 max-w-lg mx-auto font-josefin">
            {description}
          </p>

          {/* Email capture */}
          <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-2xl p-8 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Bell size={20} className="text-[#00F0E9]" />
              <h3 className="font-semibold font-josefin">Get Notified</h3>
            </div>
            <p className="text-sm text-[#666666] mb-6 font-josefin">
              Be the first to know when this feature launches.
            </p>

            {submitted ? (
              <div className="text-[#00F0E9] font-semibold py-3 font-josefin">
                You're on the list! We'll let you know.
              </div>
            ) : (
              <form onSubmit={handleNotify} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#FF008E] font-josefin text-sm"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#FF008E] to-[#C9005C] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity font-josefin text-sm whitespace-nowrap"
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>

          {/* Footer text */}
          <p className="mt-12 text-sm text-[#666666] font-josefin">
            Part of the complete dAItaniverse ecosystem for neurodivergent entrepreneurs
          </p>
        </div>
      </div>
    </div>
  )
}

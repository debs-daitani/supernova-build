'use client'

import { Rocket } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description?: string
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-hot-pink/20 to-light-teal/20 flex items-center justify-center mb-6">
        <Rocket size={40} className="text-hot-pink" />
      </div>
      <h2 className="text-3xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime mb-4">
        {title}
      </h2>
      <p className="text-gray-400 font-josefin max-w-md mb-8">
        {description || "We're working on something awesome. This feature will be available soon!"}
      </p>
      <div className="flex items-center gap-2 text-sm text-light-teal font-josefin">
        <span className="w-2 h-2 rounded-full bg-light-teal animate-pulse" />
        Coming Soon
      </div>
    </div>
  )
}

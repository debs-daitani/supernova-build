'use client'

import Link from 'next/link'

interface HeroProps {
  title: string
  subtitle: string
  ctaText?: string
  ctaHref?: string
  bgImage?: string
}

export default function Hero({
  title,
  subtitle,
  ctaText = 'Start Free Trial',
  ctaHref = '/checkout',
  bgImage
}: HeroProps) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-supernova text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
          {title}
        </h1>
        <p className="font-josefin text-lg md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        <Link
          href={ctaHref}
          className="inline-block px-8 py-4 bg-hot-pink hover:bg-[#ff1b7f] text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_30px_rgba(255,0,142,0.5)]"
        >
          {ctaText}
        </Link>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-light-teal rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-hot-pink rounded-full blur-3xl opacity-20 animate-pulse"></div>
    </div>
  )
}

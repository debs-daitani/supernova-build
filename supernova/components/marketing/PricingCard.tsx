'use client'

import Link from 'next/link'

interface PricingCardProps {
  title: string
  price: string
  period?: string
  description: string
  features: string[]
  ctaText?: string
  ctaHref?: string
  highlighted?: boolean
  trial?: string
}

export default function PricingCard({
  title,
  price,
  period = 'month',
  description,
  features,
  ctaText = 'Start Free Trial',
  ctaHref = '/checkout',
  highlighted = false,
  trial = '7-day free trial'
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-3xl p-8 md:p-12 transition-all duration-300 ${
        highlighted
          ? 'bg-gradient-to-br from-hot-pink/20 to-light-teal/20 border-2 border-hot-pink shadow-[0_0_40px_rgba(255,0,142,0.3)] transform scale-105'
          : 'bg-charcoal/50 border-2 border-charcoal/50 hover:border-hot-pink/50'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-hot-pink rounded-full">
          <span className="font-bold text-white text-sm">MOST POPULAR</span>
        </div>
      )}

      <h3 className="font-supernova text-3xl font-bold text-white mb-2">{title}</h3>
      <p className="font-josefin text-gray-400 text-sm mb-6">{description}</p>

      <div className="mb-6">
        <span className="font-supernova text-5xl font-bold text-white">{price}</span>
        <span className="text-gray-400 ml-2">/{period}</span>
        <p className="font-josefin text-light-teal text-sm mt-2">{trial}</p>
      </div>

      <Link
        href={ctaHref}
        className="block w-full px-6 py-3 bg-hot-pink hover:bg-[#ff1b7f] text-white font-bold text-center rounded-full transition-all duration-300 mb-8 shadow-lg hover:shadow-[0_0_30px_rgba(255,0,142,0.5)]"
      >
        {ctaText}
      </Link>

      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <svg className="w-5 h-5 text-light-teal mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-josefin text-gray-300 text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

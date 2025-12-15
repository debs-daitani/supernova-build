'use client'

import { useRouter } from 'next/navigation'
import { Check, Sparkles, Zap, Brain, Heart, TrendingUp, Guitar, Crown } from 'lucide-react'

export default function PricingPage() {
  const router = useRouter()

  const venuedFeatures = [
    'VENUED Project Management',
    'Task gamification & rewards',
    'Energy tracking',
    'Brain dumps',
    'Dopamine rewards system',
    'Mobile-friendly interface',
  ]

  const daitaniverseFeatures = [
    'Everything in VENUED',
    'SUPERNova AI Coaching',
    'CRM System',
    'Email Marketing',
    'Quiz Builder',
    'Knowledge Library',
    'Business Hub tools',
    'Analytics dashboard',
    'Creative Studio (coming soon)',
  ]

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/dAitaniverse Stage.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Header */}
      <header className="backdrop-blur-xl bg-black/50 border-b border-[#00F0E9]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF008E] via-[#00F0E9] to-[#D3FF2C]">
            dAItaniverse
          </h1>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 rounded-xl bg-black/60 text-white font-semibold hover:bg-black/80 transition-all border border-[#00F0E9]/20"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
              Choose Your Journey
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Pick the plan that fits your needs. Upgrade anytime.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* VENUED Plan */}
            <div className="backdrop-blur-xl bg-black/80 rounded-3xl border-2 border-[#FF008E]/30 p-8">
              <div className="text-center mb-6">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-[#FF008E] to-[#00F0E9] mb-4">
                  <Guitar className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">VENUED</h2>
                <p className="text-gray-400">ADHD-friendly project management</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF008E] to-[#00F0E9]">
                    £2.60
                  </span>
                  <span className="text-xl text-gray-300">/month</span>
                </div>
                <p className="text-sm text-gray-500">Billed monthly</p>
              </div>

              <ul className="space-y-3 mb-8">
                {venuedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-[#00F0E9] flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push('/checkout?plan=venued')}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-[#FF008E] to-[#00F0E9] text-white font-bold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,0,142,0.3)]"
              >
                Get VENUED
              </button>
            </div>

            {/* dAItaniverse Plan */}
            <div className="backdrop-blur-xl bg-black/80 rounded-3xl border-2 border-[#00F0E9]/50 p-8 relative">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF008E] to-[#00F0E9] text-white font-bold text-sm shadow-[0_0_20px_rgba(0,240,233,0.5)]">
                  BEST VALUE
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-[#00F0E9] to-[#D3FF2C] mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">dAItaniverse</h2>
                <p className="text-gray-400">Full platform access</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00F0E9] to-[#D3FF2C]">
                    £26
                  </span>
                  <span className="text-xl text-gray-300">/month</span>
                </div>
                <p className="text-sm text-gray-500">7-day free trial included</p>
              </div>

              <ul className="space-y-3 mb-8">
                {daitaniverseFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-[#D3FF2C] flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push('/checkout?plan=daitaniverse')}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-[#00F0E9] to-[#D3FF2C] text-black font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(0,240,233,0.5)]"
              >
                Start Free Trial
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00F0E9]" />
                <span>Secure payment with Stripe</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00F0E9]" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00F0E9]" />
                <span>Upgrade or downgrade freely</span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 text-center">
            <p className="text-gray-300 mb-2">
              Questions? Email us at{' '}
              <a
                href="mailto:hello@daitaniverse.com"
                className="text-[#00F0E9] hover:text-[#FF008E] transition-colors"
              >
                hello@daitaniverse.com
              </a>
            </p>
            <p className="text-sm text-gray-500">
              Built for rebels who refuse to fit the mold
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/home')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

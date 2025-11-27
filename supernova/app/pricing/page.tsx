'use client'

import { useRouter } from 'next/navigation'
import { Check, Sparkles, Zap, Brain, Heart, TrendingUp } from 'lucide-react'

export default function PricingPage() {
  const router = useRouter()

  const features = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      text: 'SUPERNova AI Coaching',
      description: 'Your ADHD-friendly AI coach'
    },
    {
      icon: <Brain className="w-5 h-5" />,
      text: 'Quiz Builder',
      description: 'Create quizzes that convert'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      text: 'Knowledge Library',
      description: 'Full access to dAItaniverse content'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: 'ADHD Support Tools',
      description: 'Dopamine menu, pattern interrupts & more'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      text: 'VENUED Project Management',
      description: 'Keep your rebel projects on track'
    },
    {
      icon: <Check className="w-5 h-5" />,
      text: 'Email Marketing',
      description: 'Coming soon - Build your list'
    },
    {
      icon: <Check className="w-5 h-5" />,
      text: 'CRM System',
      description: 'Coming soon - Manage your contacts'
    },
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
      <header className="backdrop-blur-xl bg-charcoal/50 border-b border-light-teal/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime">
            dAItaniverse
          </h1>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 rounded-xl bg-charcoal/60 text-white font-josefin font-semibold hover:bg-charcoal/80 transition-all border border-light-teal/20"
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
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-hot-pink via-mid-teal to-light-teal mb-6 shadow-[0_0_60px_rgba(0,240,233,0.4)] animate-pulse-glow">
              <span className="text-5xl font-supernova text-white">SN</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-arp-display font-bold mb-4 text-white">
              Join the dAItaniverse
            </h1>
            <p className="text-xl text-gray-200 font-josefin max-w-2xl mx-auto">
              The all-in-one platform for ADHD entrepreneurs who refuse to play by the rules
            </p>
          </div>

          {/* Pricing Card */}
          <div className="backdrop-blur-xl bg-charcoal/80 rounded-3xl border-2 border-light-teal/30 shadow-[0_0_60px_rgba(0,240,233,0.3)] p-8 md:p-12">
            {/* Price Header */}
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-hot-pink to-light-teal text-white font-josefin font-bold text-sm mb-4">
                7-DAY FREE TRIAL
              </div>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-6xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink to-light-teal">
                  £26
                </span>
                <span className="text-2xl text-gray-300 font-josefin">/month</span>
              </div>
              <p className="text-gray-400 font-josefin">
                Cancel anytime. No long-term commitments.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-charcoal/60 border border-light-teal/20"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-hot-pink to-light-teal flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-josefin font-bold text-white mb-1">
                      {feature.text}
                    </h3>
                    <p className="text-sm text-gray-400 font-josefin">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-br from-hot-pink via-mid-teal to-light-teal text-white font-josefin font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,0,142,0.5)] hover:shadow-[0_0_60px_rgba(255,0,142,0.7)]"
              >
                Start Your Free Trial
              </button>
              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-4 px-8 rounded-2xl bg-charcoal/60 border-2 border-light-teal/40 text-white font-josefin font-bold text-lg hover:bg-charcoal/80 transition-all"
              >
                Choose This Plan
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 pt-8 border-t border-light-teal/20">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 font-josefin">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-light-teal" />
                  <span>Secure payment with Stripe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-light-teal" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-light-teal" />
                  <span>7-day free trial</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 text-center">
            <p className="text-gray-300 font-josefin mb-2">
              Questions? Email us at{' '}
              <a
                href="mailto:hello@daitaniverse.com"
                className="text-light-teal hover:text-hot-pink transition-colors"
              >
                hello@daitaniverse.com
              </a>
            </p>
            <p className="text-sm text-gray-500 font-josefin">
              Built for rebels who refuse to fit the mold
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function UpgradePage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (type: 'upgrade' | 'monthly' | 'annual') => {
    setLoading(type)

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-daitani-pink mb-4">
            Unlock Your Full Potential
          </h1>
          <p className="text-xl text-gray-600">
            Anti-establishment pricing. No gatekeeping. Just £26.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* One-Time Upgrade */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold mb-2">Upgrade</h3>
            <div className="text-4xl font-bold text-daitani-pink mb-4">
              £26
              <span className="text-lg text-gray-500 font-normal"> one-time</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-daitani-pink mr-2">✓</span>
                <span>Basic SUPERNova AI access</span>
              </li>
              <li className="flex items-start">
                <span className="text-daitani-pink mr-2">✓</span>
                <span>Community access (The Venue)</span>
              </li>
              <li className="flex items-start">
                <span className="text-daitani-pink mr-2">✓</span>
                <span>78 Prompts guide</span>
              </li>
              <li className="flex items-start">
                <span className="text-daitani-pink mr-2">✓</span>
                <span>AI Amplified guide</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">✗</span>
                <span className="text-gray-400">Content library</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">✗</span>
                <span className="text-gray-400">Full AI memory</span>
              </li>
            </ul>

            <button
              onClick={() => handleCheckout('upgrade')}
              disabled={loading !== null}
              className="w-full bg-daitani-pink text-white py-3 rounded-lg font-bold hover:bg-daitani-pink/90 disabled:opacity-50 transition-colors"
            >
              {loading === 'upgrade' ? 'Processing...' : 'Get Started - £26'}
            </button>
          </div>

          {/* Monthly Subscription - HIGHLIGHTED */}
          <div className="bg-gradient-to-br from-daitani-pink to-daitani-cyan rounded-lg shadow-2xl p-8 border-4 border-daitani-pink transform scale-105">
            <div className="bg-white/10 text-white text-center py-1 px-3 rounded-full text-sm font-bold mb-4 inline-block">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Monthly Member</h3>
            <div className="text-4xl font-bold text-white mb-4">
              £26
              <span className="text-lg font-normal">/month</span>
            </div>

            <ul className="space-y-3 mb-8 text-white">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Full SUPERNova AI access</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Unlimited AI coaching</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Cross-chat memory system</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Full content library access</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>AI-curated learning paths</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Community access</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>i•DEA marketplace access</span>
              </li>
            </ul>

            <button
              onClick={() => handleCheckout('monthly')}
              disabled={loading !== null}
              className="w-full bg-white text-daitani-pink py-3 rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              {loading === 'monthly' ? 'Processing...' : 'Start Membership - £26/mo'}
            </button>
          </div>

          {/* Annual Subscription */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-daitani-cyan">
            <div className="bg-daitani-cyan text-white text-center py-1 px-3 rounded-full text-sm font-bold mb-4 inline-block">
              SAVE £52/YEAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Annual Member</h3>
            <div className="text-4xl font-bold text-daitani-cyan mb-4">
              £260
              <span className="text-lg text-gray-500 font-normal">/year</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-daitani-cyan mr-2">✓</span>
                <span>Everything in Monthly</span>
              </li>
              <li className="flex items-start">
                <span className="text-daitani-cyan mr-2">✓</span>
                <span>Save £52 per year</span>
              </li>
              <li className="flex items-start">
                <span className="text-daitani-cyan mr-2">✓</span>
                <span>10 months price for 12 months access</span>
              </li>
              <li className="flex items-start">
                <span className="text-daitani-cyan mr-2">✓</span>
                <span>Lock in current pricing</span>
              </li>
            </ul>

            <button
              onClick={() => handleCheckout('annual')}
              disabled={loading !== null}
              className="w-full bg-daitani-cyan text-white py-3 rounded-lg font-bold hover:bg-daitani-cyan/90 disabled:opacity-50 transition-colors"
            >
              {loading === 'annual' ? 'Processing...' : 'Go Annual - £260/year'}
            </button>
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Why The dAItaniverse?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="font-bold text-xl mb-2">Anti-Establishment Pricing</h3>
              <p className="text-gray-600">
                While others charge £99+ and gatekeep entrepreneurship, we're democratising it. £26/month. That's it.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="font-bold text-xl mb-2">ADHD-Friendly by Design</h3>
              <p className="text-gray-600">
                Built FOR neurodivergent entrepreneurs, not adapted as an afterthought. Clear, chunked, actionable.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-4">💪</div>
              <h3 className="font-bold text-xl mb-2">Three Pillars Approach</h3>
              <p className="text-gray-600">
                Confident Body. Confident Brain. Confident Business. We address the WHOLE entrepreneur, not just tactics.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-daitani-pink to-daitani-cyan text-white rounded-lg p-12 text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
            Ready to build your empire?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of midlife female entrepreneurs who've said "fuck it, let's go!"
          </p>
          <button
            onClick={() => handleCheckout('monthly')}
            disabled={loading !== null}
            className="bg-white text-daitani-pink px-12 py-4 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors inline-block"
          >
            Let's Fucking GO! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '../../components/CheckoutForm'
import { ArrowLeft, Check } from 'lucide-react'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

export default function CheckoutPage() {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/login?redirect=/checkout')
        return
      }
      const data = await response.json()
      setUser(data.user)
      createCheckoutSession(data.user.id)
    } catch (error) {
      router.push('/login?redirect=/checkout')
    }
  }

  const createCheckoutSession = async (userId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-hot-pink to-light-teal shadow-[0_0_40px_rgba(255,0,142,0.6)] mb-4 animate-pulse">
            <span className="text-4xl font-supernova text-white">SN</span>
          </div>
          <p className="text-gray-400 font-josefin font-semibold">
            Preparing checkout...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 font-josefin mb-4">{error}</p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-6 py-3 rounded-xl bg-hot-pink text-white font-josefin font-bold hover:scale-105 transition-all"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    )
  }

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
            onClick={() => router.push('/pricing')}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-charcoal/60 text-white font-josefin font-semibold hover:bg-charcoal/80 transition-all border border-light-teal/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="backdrop-blur-xl bg-charcoal/80 rounded-3xl border-2 border-light-teal/30 shadow-[0_0_40px_rgba(0,240,233,0.2)] p-8">
              <h2 className="text-2xl font-supernova text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-josefin">
                    dAItaniverse Membership
                  </span>
                  <span className="text-white font-josefin font-bold">
                    £26.00
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-josefin">
                    Billing period
                  </span>
                  <span className="text-white font-josefin">Monthly</span>
                </div>
                <div className="pt-4 border-t border-light-teal/20">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-josefin font-bold text-lg">
                      Total due today
                    </span>
                    <span className="text-2xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink to-light-teal">
                      £0.00
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-josefin mt-2">
                    7-day free trial • First charge on{' '}
                    {new Date(
                      Date.now() + 7 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-josefin font-bold text-white mb-3">
                  What's included:
                </h3>
                {[
                  'SUPERNova AI Coaching',
                  'Quiz Builder',
                  'Knowledge Library Access',
                  'ADHD Support Tools',
                  'VENUED Project Management',
                  'Cancel anytime',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-light-teal flex-shrink-0" />
                    <span className="text-gray-300 font-josefin text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Form */}
            <div className="backdrop-blur-xl bg-charcoal/80 rounded-3xl border-2 border-light-teal/30 shadow-[0_0_40px_rgba(0,240,233,0.2)] p-8">
              <h2 className="text-2xl font-supernova text-white mb-6">
                Payment Details
              </h2>

              {clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#00F0E9',
                        colorBackground: '#1a1a1a',
                        colorText: '#ffffff',
                        colorDanger: '#FF008E',
                        fontFamily: 'Josefin Sans, sans-serif',
                        borderRadius: '12px',
                      },
                    },
                  }}
                >
                  <CheckoutForm />
                </Elements>
              )}
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 font-josefin">
              Secure payment powered by Stripe • 256-bit SSL encryption
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

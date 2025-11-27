'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Download, ArrowRight } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{
        backgroundImage: "url('/images/dAitaniverse Stage.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-2xl w-full">
        <div className="backdrop-blur-xl bg-charcoal/80 rounded-3xl border-2 border-light-teal/30 shadow-[0_0_60px_rgba(0,240,233,0.3)] p-12 text-center">
          <div className="inline-flex p-8 rounded-3xl bg-gradient-to-br from-green-500 to-light-teal mb-6 shadow-[0_0_60px_rgba(0,240,233,0.4)] animate-pulse-glow">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-arp-display font-bold mb-4 text-white">
            Payment Successful!
          </h1>

          <p className="text-xl text-gray-200 font-josefin mb-8">
            Welcome to dAItaniverse! Your 7-day free trial has started.
          </p>

          <div className="backdrop-blur-xl bg-charcoal/60 rounded-2xl border border-light-teal/20 p-6 mb-8 text-left">
            <h2 className="text-lg font-josefin font-bold text-white mb-4">
              What happens next:
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-light-teal flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 font-josefin">
                  Your trial starts today and lasts for 7 days
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-light-teal flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 font-josefin">
                  You'll be charged £26 on{' '}
                  {new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-light-teal flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 font-josefin">
                  Cancel anytime in your billing settings
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-light-teal flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 font-josefin">
                  A receipt has been sent to your email
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/welcome')}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-br from-hot-pink via-mid-teal to-light-teal text-white font-josefin font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,0,142,0.5)] hover:shadow-[0_0_60px_rgba(255,0,142,0.7)] flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push('/account/billing')}
              className="w-full py-4 px-8 rounded-2xl bg-charcoal/60 border-2 border-light-teal/40 text-white font-josefin font-bold text-lg hover:bg-charcoal/80 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              View Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, XCircle, CheckCircle2 } from 'lucide-react'

export default function CancelSubscriptionPage() {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const reasons = [
    'Too expensive',
    'Not using it enough',
    'Missing features I need',
    'Found a better alternative',
    'Technical issues',
    'Other',
  ]

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, feedback }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      alert('Subscription cancelled successfully. You will continue to have access until the end of your billing period.')
      router.push('/account/billing')
    } catch (error) {
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleReactivate = async () => {
    setIsCancelling(true)
    try {
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription')
      }

      alert('Subscription reactivated successfully!')
      router.push('/account/billing')
    } catch (error) {
      alert('Failed to reactivate subscription. Please try again.')
    } finally {
      setIsCancelling(false)
    }
  }

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
        <div className="backdrop-blur-xl bg-charcoal/80 rounded-3xl border-2 border-orange-500/30 shadow-[0_0_60px_rgba(255,140,0,0.3)] p-12">
          <div className="text-center mb-8">
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 mb-6 shadow-[0_0_40px_rgba(255,140,0,0.4)]">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-arp-display font-bold mb-4 text-white">
              Cancel Subscription?
            </h1>
            <p className="text-lg text-gray-300 font-josefin">
              We're sorry to see you go! Before you leave, let us know how we can improve.
            </p>
          </div>

          {/* Feedback Form */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-white font-josefin font-bold mb-3">
                Why are you cancelling?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {reasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`p-4 rounded-xl font-josefin font-semibold text-sm transition-all ${
                      reason === r
                        ? 'bg-light-teal text-charcoal border-2 border-light-teal'
                        : 'bg-charcoal/60 text-gray-300 border-2 border-light-teal/20 hover:border-light-teal/40'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-josefin font-bold mb-3">
                Any additional feedback? (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more..."
                className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border-2 border-light-teal/20 text-white font-josefin placeholder-gray-500 focus:border-light-teal focus:outline-none resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Special Offer */}
          <div className="backdrop-blur-xl bg-hot-pink/20 border-2 border-hot-pink/40 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-josefin font-bold text-white mb-2">
              Wait! Special Offer
            </h3>
            <p className="text-gray-300 font-josefin mb-4">
              How about pausing your subscription instead? We'll keep your data safe and you can come back anytime.
            </p>
            <button
              onClick={() => alert('Pause subscription feature coming soon!')}
              className="w-full px-6 py-3 rounded-xl bg-hot-pink text-white font-josefin font-bold hover:scale-105 transition-all"
            >
              Pause Subscription Instead
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCancel}
              disabled={!reason || isCancelling}
              className="w-full py-4 px-8 rounded-2xl bg-red-500/20 border-2 border-red-500/50 text-red-400 font-josefin font-bold text-lg hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>

            <button
              onClick={() => router.push('/account/billing')}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-br from-hot-pink via-mid-teal to-light-teal text-white font-josefin font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,0,142,0.5)] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Keep My Subscription
            </button>
          </div>

          <p className="text-sm text-gray-400 font-josefin text-center mt-6">
            If you cancel, you'll continue to have access until the end of your current billing period.
          </p>
        </div>
      </div>
    </div>
  )
}

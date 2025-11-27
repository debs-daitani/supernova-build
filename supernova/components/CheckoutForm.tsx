'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Loader2 } from 'lucide-react'

export default function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/account/billing/success`,
        },
      })

      if (error) {
        setErrorMessage(error.message || 'An error occurred')
        setIsProcessing(false)
      }
      // If successful, Stripe will redirect to the return_url
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50">
          <p className="text-red-400 font-josefin text-sm">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-4 px-8 rounded-2xl font-josefin font-bold text-lg transition-all ${
          !stripe || isProcessing
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-br from-hot-pink via-mid-teal to-light-teal text-white hover:scale-105 shadow-[0_0_40px_rgba(255,0,142,0.5)] hover:shadow-[0_0_60px_rgba(255,0,142,0.7)]'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </span>
        ) : (
          'Start Free Trial'
        )}
      </button>

      <p className="text-xs text-gray-400 font-josefin text-center">
        By clicking "Start Free Trial", you agree to be charged £26/month after
        your 7-day trial ends. Cancel anytime.
      </p>
    </form>
  )
}

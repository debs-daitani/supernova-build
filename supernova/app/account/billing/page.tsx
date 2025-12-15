'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from 'lucide-react'
import { formatAmount, getSubscriptionStatusDisplay } from '../../../lib/stripe'

interface Subscription {
  id: string
  status: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd: string | null
}

interface Invoice {
  id: string
  stripeInvoiceId: string
  amountPaid: number
  currency: string
  status: string
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
  paidAt: string | null
  createdAt: string
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  description: string | null
  createdAt: string
}

export default function BillingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Check auth
      const authResponse = await fetch('/api/auth/me')
      if (!authResponse.ok) {
        router.push('/login')
        return
      }
      const authData = await authResponse.json()
      setUser(authData.user)

      // Load subscription
      const subResponse = await fetch('/api/subscription')
      if (subResponse.ok) {
        const subData = await subResponse.json()
        setSubscription(subData.subscription)
      }

      // Load invoices
      const invoicesResponse = await fetch('/api/billing/invoices')
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData.invoices)
      }

      // Load payment history
      const paymentsResponse = await fetch('/api/billing/payment-history')
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        setPayments(paymentsData.payments)
      }
    } catch (error) {
      console.error('Error loading billing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel? You will continue to have access until the end of your billing period.'
      )
    ) {
      return
    }

    setIsCancelling(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      alert('Subscription cancelled successfully')
      loadData()
    } catch (error) {
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setIsCancelling(false)
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
            Loading billing info...
          </p>
        </div>
      </div>
    )
  }

  const statusDisplay = subscription
    ? getSubscriptionStatusDisplay(subscription.status)
    : null

  return (
    <div
      className="min-h-screen"
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
            Billing Settings
          </h1>
          <button
            onClick={() => router.push('/home')}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-charcoal/60 text-white font-josefin font-semibold hover:bg-charcoal/80 transition-all border border-light-teal/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Subscription Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Plan */}
            <div className="backdrop-blur-xl bg-charcoal/80 rounded-3xl border-2 border-light-teal/30 shadow-[0_0_40px_rgba(0,240,233,0.2)] p-8">
              <h2 className="text-2xl font-supernova text-white mb-6">
                Current Plan
              </h2>

              {subscription ? (
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-bold text-white font-josefin mb-2">
                        dAItaniverse Membership
                      </h3>
                      <p className="text-gray-400 font-josefin">
                        £26.00 per month
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full font-josefin font-bold text-sm ${
                        statusDisplay?.color === 'green'
                          ? 'bg-green-500/20 text-green-400'
                          : statusDisplay?.color === 'blue'
                          ? 'bg-blue-500/20 text-blue-400'
                          : statusDisplay?.color === 'orange'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {statusDisplay?.label}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-charcoal/60 border border-light-teal/20">
                      <Calendar className="w-5 h-5 text-light-teal" />
                      <div>
                        <p className="text-sm text-gray-400 font-josefin">
                          Next billing date
                        </p>
                        <p className="text-white font-josefin font-bold">
                          {new Date(
                            subscription.currentPeriodEnd
                          ).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {subscription.trialEnd && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/20 border border-blue-500/50">
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-sm text-blue-300 font-josefin">
                            Trial ends
                          </p>
                          <p className="text-white font-josefin font-bold">
                            {new Date(subscription.trialEnd).toLocaleDateString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!subscription.cancelAtPeriodEnd ? (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-josefin font-semibold hover:bg-red-500/30 transition-all disabled:opacity-50"
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-orange-500/20 border border-orange-500/50">
                      <p className="text-orange-300 font-josefin">
                        Your subscription is set to cancel on{' '}
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                          'en-GB'
                        )}
                        .{' '}
                        <button
                          onClick={() => router.push('/account/billing/cancel')}
                          className="underline hover:text-white transition-colors"
                        >
                          Reactivate
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 font-josefin mb-4">
                    No active subscription
                  </p>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-br from-hot-pink to-light-teal text-white font-josefin font-bold hover:scale-105 transition-all"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>

            {/* Billing History */}
            <div className="backdrop-blur-xl bg-charcoal/80 rounded-3xl border-2 border-light-teal/30 shadow-[0_0_40px_rgba(0,240,233,0.2)] p-8">
              <h2 className="text-2xl font-supernova text-white mb-6">
                Billing History
              </h2>

              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-charcoal/60 border border-light-teal/20"
                    >
                      <div className="flex items-center gap-4">
                        {invoice.status === 'paid' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <p className="text-white font-josefin font-bold">
                            {formatAmount(invoice.amountPaid, invoice.currency)}
                          </p>
                          <p className="text-sm text-gray-400 font-josefin">
                            {invoice.paidAt
                              ? new Date(invoice.paidAt).toLocaleDateString(
                                  'en-GB'
                                )
                              : new Date(invoice.createdAt).toLocaleDateString(
                                  'en-GB'
                                )}
                          </p>
                        </div>
                      </div>
                      {invoice.invoicePdf && (
                        <a
                          href={invoice.invoicePdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-light-teal/20 text-light-teal hover:bg-light-teal/30 font-josefin font-semibold text-sm transition-all"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-josefin text-center py-8">
                  No billing history yet
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Payment Method */}
          <div className="space-y-8">
            <div className="backdrop-blur-xl bg-charcoal/80 rounded-3xl border-2 border-light-teal/30 shadow-[0_0_40px_rgba(0,240,233,0.2)] p-8">
              <h2 className="text-xl font-supernova text-white mb-6">
                Payment Method
              </h2>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-charcoal/60 border border-light-teal/20 mb-4">
                <CreditCard className="w-5 h-5 text-light-teal" />
                <div className="flex-1">
                  <p className="text-white font-josefin font-bold">
                    •••• •••• •••• ••••
                  </p>
                  <p className="text-sm text-gray-400 font-josefin">
                    Managed by Stripe
                  </p>
                </div>
              </div>

              <button
                onClick={() => alert('Update payment method feature coming soon')}
                className="w-full px-6 py-3 rounded-xl bg-light-teal/20 border border-light-teal/40 text-light-teal font-josefin font-semibold hover:bg-light-teal/30 transition-all"
              >
                Update Payment Method
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

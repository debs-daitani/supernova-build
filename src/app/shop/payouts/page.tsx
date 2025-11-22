'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  CreditCard,
  Building,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency, calculateSellerPayout, areFundsCleared } from '@/lib/shop-utils'
import { PAYOUT_SETTINGS } from '@/lib/shop-config'

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [requestingPayout, setRequestingPayout] = useState(false)
  const [userTier, setUserTier] = useState<'BOLD' | 'BADASS'>('BOLD')

  // Payout form
  const [payoutMethod, setPayoutMethod] = useState<'STRIPE' | 'PAYPAL' | 'BANK'>('STRIPE')
  const [payoutEmail, setPayoutEmail] = useState('')
  const [bankDetails, setBankDetails] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const userId = 'user_placeholder' // TODO: Get from auth

      // Fetch payout history
      const payoutsRes = await fetch(`/api/shop/payouts?userId=${userId}`)
      const payoutsData = await payoutsRes.json()
      setPayouts(payoutsData.payouts || [])

      // Fetch orders for balance calculation
      const ordersRes = await fetch(`/api/shop/orders?sellerId=${userId}`)
      const ordersData = await ordersRes.json()
      setOrders(ordersData.orders || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async () => {
    if (availableBalance < PAYOUT_SETTINGS.MIN_PAYOUT_AMOUNT) {
      alert(`Minimum payout amount is ${formatCurrency(PAYOUT_SETTINGS.MIN_PAYOUT_AMOUNT, 'GBP')}`)
      return
    }

    if (!payoutEmail && payoutMethod !== 'BANK') {
      alert('Please enter your payout email')
      return
    }

    if (payoutMethod === 'BANK' && !bankDetails) {
      alert('Please enter your bank details')
      return
    }

    setRequestingPayout(true)

    try {
      const res = await fetch('/api/shop/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: availableBalance,
          method: payoutMethod,
          details: payoutMethod === 'BANK' ? bankDetails : payoutEmail,
        }),
      })

      if (res.ok) {
        alert('Payout request submitted successfully!')
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to request payout')
      }
    } catch (error) {
      console.error('Error requesting payout:', error)
      alert('Failed to request payout')
    } finally {
      setRequestingPayout(false)
    }
  }

  // Calculate balances
  const completedOrders = orders.filter(
    (o) => o.status === 'PAID' || o.status === 'COMPLETED'
  )

  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalEarnings = calculateSellerPayout(totalRevenue, userTier)

  // Calculate cleared vs pending funds
  const clearedSales = completedOrders
    .filter((order) => areFundsCleared(new Date(order.paidAt || order.createdAt)))
    .reduce((sum, order) => sum + order.totalAmount, 0)

  const pendingSales = completedOrders
    .filter((order) => !areFundsCleared(new Date(order.paidAt || order.createdAt)))
    .reduce((sum, order) => sum + order.totalAmount, 0)

  const availableBalance = calculateSellerPayout(clearedSales, userTier)
  const pendingBalance = calculateSellerPayout(pendingSales, userTier)

  const totalPaidOut = payouts
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Payouts
          </h1>
          <p className="text-gray-600">Manage your earnings and request payouts</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Available Balance</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(availableBalance, 'GBP')}
            </div>
            <div className="text-sm text-gray-500 mt-1">Ready to withdraw</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Pending Balance</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {formatCurrency(pendingBalance, 'GBP')}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Clearing in {PAYOUT_SETTINGS.CLEARANCE_DAYS} days
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(totalEarnings, 'GBP')}
            </div>
            <div className="text-sm text-gray-500 mt-1">All time</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Paid Out</span>
              <Download className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(totalPaidOut, 'GBP')}
            </div>
            <div className="text-sm text-gray-500 mt-1">Total withdrawn</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Request Payout */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Request Payout</h2>

            {availableBalance < PAYOUT_SETTINGS.MIN_PAYOUT_AMOUNT ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">Minimum payout not met</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      You need at least {formatCurrency(PAYOUT_SETTINGS.MIN_PAYOUT_AMOUNT, 'GBP')}{' '}
                      in available balance to request a payout. Current balance:{' '}
                      {formatCurrency(availableBalance, 'GBP')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Ready to withdraw</div>
                    <div className="text-sm text-green-700 mt-1">
                      You have {formatCurrency(availableBalance, 'GBP')} available for payout
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payout Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPayoutMethod('STRIPE')}
                    className={`p-4 border rounded-lg text-center transition-all ${
                      payoutMethod === 'STRIPE'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Stripe</div>
                  </button>
                  <button
                    onClick={() => setPayoutMethod('PAYPAL')}
                    className={`p-4 border rounded-lg text-center transition-all ${
                      payoutMethod === 'PAYPAL'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <DollarSign className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">PayPal</div>
                  </button>
                  <button
                    onClick={() => setPayoutMethod('BANK')}
                    className={`p-4 border rounded-lg text-center transition-all ${
                      payoutMethod === 'BANK'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <Building className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Bank</div>
                  </button>
                </div>
              </div>

              {payoutMethod === 'BANK' ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Bank Details</label>
                  <textarea
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    placeholder="Enter your bank account details (Account name, Number, Sort code)"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {payoutMethod === 'STRIPE' ? 'Stripe Email' : 'PayPal Email'}
                  </label>
                  <Input
                    type="email"
                    value={payoutEmail}
                    onChange={(e) => setPayoutEmail(e.target.value)}
                    placeholder={`Enter your ${payoutMethod.toLowerCase()} email`}
                  />
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Payout Amount</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(availableBalance, 'GBP')}
                  </span>
                </div>
                <Button
                  onClick={handleRequestPayout}
                  disabled={
                    availableBalance < PAYOUT_SETTINGS.MIN_PAYOUT_AMOUNT || requestingPayout
                  }
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-lg py-6"
                >
                  {requestingPayout ? 'Processing...' : 'Request Payout'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Info */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Payout Information</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <div className="font-medium text-gray-900 mb-1">Clearance Period</div>
                <p>Funds are available for withdrawal {PAYOUT_SETTINGS.CLEARANCE_DAYS} days after a sale is completed.</p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Minimum Payout</div>
                <p>Minimum payout amount is {formatCurrency(PAYOUT_SETTINGS.MIN_PAYOUT_AMOUNT, 'GBP')}.</p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Processing Time</div>
                <p>Payouts are typically processed within {PAYOUT_SETTINGS.PROCESSING_DAYS} business days.</p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Platform Fee</div>
                <p>
                  {userTier === 'BOLD' ? '5%' : '3%'} platform fee is deducted from your earnings
                  before payout.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Payout History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Payout History</h2>

          {payouts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Download className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No payouts yet</h3>
              <p>Your payout requests will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Method</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-right py-3 px-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div>{new Date(payout.requestedAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(payout.requestedAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {payout.method === 'STRIPE' && <CreditCard className="w-4 h-4" />}
                          {payout.method === 'PAYPAL' && <DollarSign className="w-4 h-4" />}
                          {payout.method === 'BANK' && <Building className="w-4 h-4" />}
                          <span>{payout.method}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            payout.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : payout.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-purple-600">
                        {formatCurrency(payout.amount, 'GBP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Settings, CreditCard } from 'lucide-react'

export default async function AffiliatePayoutsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/affiliate"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Payouts</h1>
              <p className="text-gray-600">Request withdrawals and manage payout settings</p>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="text-sm opacity-90 mb-2">Available for Payout</div>
          <div className="text-5xl font-bold mb-4">£0.00</div>
          <p className="text-sm opacity-90 mb-6">
            Minimum payout: £25 (BRAVE/BOLD) | No minimum for BADASS
          </p>

          <button
            className="px-8 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            disabled
          >
            Request Payout
          </button>

          <p className="text-xs opacity-75 mt-4">
            Payouts are processed within 5-7 business days
          </p>
        </div>

        {/* Payout Settings */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Payout Settings</h2>
            </div>
            <button
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              disabled
            >
              Edit
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Method
              </label>
              <select
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                disabled
              >
                <option value="STRIPE">Stripe (Recommended)</option>
                <option value="PAYPAL">PayPal</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Email
              </label>
              <input
                type="email"
                placeholder="your-email@example.com"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                This email will be used for Stripe or PayPal payments
              </p>
            </div>

            <div className="pt-4">
              <button
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
                disabled
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No payout history yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout Info */}
        <div className="mt-8 bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payout Information
          </h3>
          <div className="space-y-2 text-sm text-purple-800">
            <p>
              <strong>Minimum Payout:</strong> £25 for BRAVE and BOLD members. No minimum for BADASS members.
            </p>
            <p>
              <strong>Processing Time:</strong> Payouts are processed within 5-7 business days of approval.
            </p>
            <p>
              <strong>Approved Commissions:</strong> Only commissions that have passed the 30-day refund window are available for payout.
            </p>
            <p>
              <strong>Payment Methods:</strong> We support Stripe (instant), PayPal (1-2 days), and Bank Transfer (3-5 days).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Download, Filter } from 'lucide-react'

export default async function AffiliateEarningsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/affiliate"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Earnings History</h1>
                <p className="text-gray-600">Track all your commissions and payouts</p>
              </div>
            </div>

            <button
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-300 text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              disabled
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border-2 border-green-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Earnings</div>
            <div className="text-3xl font-bold text-gray-900">£0.00</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-yellow-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Pending Earnings</div>
            <div className="text-3xl font-bold text-gray-900">£0.00</div>
            <div className="text-xs text-gray-500 mt-1">Pending 30-day approval</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Paid Out</div>
            <div className="text-3xl font-bold text-gray-900">£0.00</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                disabled
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                disabled
              >
                <option value="">All Types</option>
                <option value="RECURRING_MONTHLY">Monthly Recurring</option>
                <option value="SIGNUP_BONUS">Signup Bonus</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                disabled
              >
                <option value="">All Time</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Commission History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No earnings yet. Start referring members to earn commissions!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Commission Lifecycle Info */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">How Commissions Work</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>1. PENDING:</strong> New commission created when referral makes first payment. Held for 30 days to account for refunds.
            </p>
            <p>
              <strong>2. APPROVED:</strong> After 30 days, commission is automatically approved and added to your available balance.
            </p>
            <p>
              <strong>3. PAID:</strong> Commission included in a payout once you request withdrawal (minimum £25 for BRAVE/BOLD members).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

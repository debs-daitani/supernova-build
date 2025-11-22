import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Users, DollarSign, Target } from 'lucide-react'

export default async function AdminAffiliateAnalyticsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/affiliates"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Affiliates
          </Link>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Affiliate Analytics</h1>
              <p className="text-gray-600">Track performance and growth metrics</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Total Affiliates</div>
            <div className="text-xs text-green-600 mt-1">+0 this month</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Active Referrals</div>
            <div className="text-xs text-green-600 mt-1">+0 this month</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-green-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">£0</div>
            <div className="text-sm text-gray-600">Total Commissions Paid</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-yellow-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">0%</div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
            <div className="text-xs text-gray-500 mt-1">Clicks to signups</div>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Commission Trends</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-400">Chart will be displayed here</p>
            </div>
          </div>

          {/* Referral Growth Chart */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Referral Growth</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-400">Chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Top Performing Affiliates */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Top Performing Affiliates</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affiliate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    This Month
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No affiliate data yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown by Tier */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Referrals by Subscription Tier</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-purple-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-bold text-purple-600 mb-2">BRAVE (£6/mo)</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">0</div>
              <div className="text-sm text-gray-600">Referrals</div>
              <div className="text-xs text-gray-500 mt-2">20% commission rate</div>
            </div>

            <div className="border-2 border-pink-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-bold text-pink-600 mb-2">BOLD (£26/mo)</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">0</div>
              <div className="text-sm text-gray-600">Referrals</div>
              <div className="text-xs text-gray-500 mt-2">30% commission rate</div>
            </div>

            <div className="border-2 border-blue-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-bold text-blue-600 mb-2">BADASS (£260/yr)</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">0</div>
              <div className="text-sm text-gray-600">Referrals</div>
              <div className="text-xs text-gray-500 mt-2">40% commission rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

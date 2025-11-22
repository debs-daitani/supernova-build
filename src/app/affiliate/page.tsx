import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'
import { Users, TrendingUp, DollarSign, Gift, ExternalLink, Copy } from 'lucide-react'

export default async function AffiliateDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Affiliate Dashboard</h1>
              <p className="text-gray-600">Earn recurring income by referring members</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Active Referrals</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-pink-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Total Clicks</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-green-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">£0.00</div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">£0.00</div>
            <div className="text-sm text-gray-600">Pending Earnings</div>
          </div>
        </div>

        {/* Affiliate Link */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Affiliate Link</h2>
          <p className="text-gray-600 mb-4">
            Share this link to start earning commissions. You'll earn recurring income for every paying member you refer.
          </p>

          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-50 border-2 border-gray-300 rounded-lg p-4 font-mono text-sm">
              Loading your affiliate link...
            </div>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
              disabled
            >
              <Copy className="w-5 h-5" />
              Copy
            </button>
          </div>
        </div>

        {/* Commission Structure */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Commission Structure</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-purple-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-purple-600 mb-2">BRAVE (£6/mo)</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">20%</div>
              <p className="text-sm text-gray-600">Earn £1.20/month per referral</p>
            </div>

            <div className="border-2 border-pink-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-pink-600 mb-2">BOLD (£26/mo)</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">30%</div>
              <p className="text-sm text-gray-600">Earn £7.80/month per referral</p>
            </div>

            <div className="border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-600 mb-2">BADASS (£260/yr)</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">40%</div>
              <p className="text-sm text-gray-600">Earn £8.67/month per referral</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/affiliate/links"
            className="bg-white rounded-xl shadow-md border-2 border-purple-200 p-6 hover:border-purple-400 transition-colors"
          >
            <ExternalLink className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Generate Links</h3>
            <p className="text-sm text-gray-600">Create custom tracking links</p>
          </Link>

          <Link
            href="/affiliate/earnings"
            className="bg-white rounded-xl shadow-md border-2 border-pink-200 p-6 hover:border-pink-400 transition-colors"
          >
            <DollarSign className="w-8 h-8 text-pink-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">View Earnings</h3>
            <p className="text-sm text-gray-600">Track your commission history</p>
          </Link>

          <Link
            href="/affiliate/payouts"
            className="bg-white rounded-xl shadow-md border-2 border-green-200 p-6 hover:border-green-400 transition-colors"
          >
            <DollarSign className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Payouts</h3>
            <p className="text-sm text-gray-600">Request and manage payouts</p>
          </Link>

          <Link
            href="/affiliate/resources"
            className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-6 hover:border-blue-400 transition-colors"
          >
            <Gift className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Resources</h3>
            <p className="text-sm text-gray-600">Marketing materials & guides</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

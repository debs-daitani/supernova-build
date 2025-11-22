import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Copy, QrCode, Share2 } from 'lucide-react'

export default async function AffiliateLinksPage() {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Generate Affiliate Links</h1>
              <p className="text-gray-600">Create custom tracking links for different campaigns</p>
            </div>
          </div>
        </div>

        {/* Default Affiliate Link */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Default Affiliate Link</h2>
          <p className="text-gray-600 mb-6">
            Share this link anywhere to start earning commissions. It automatically tracks clicks and signups.
          </p>

          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-4">
            <div className="font-mono text-sm text-gray-700">
              Loading your affiliate link...
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
              disabled
            >
              <Copy className="w-5 h-5" />
              Copy Link
            </button>

            <button
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-300 text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              disabled
            >
              <QrCode className="w-5 h-5" />
              Generate QR Code
            </button>

            <button
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-pink-300 text-pink-700 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
              disabled
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>

        {/* UTM Campaign Builder */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Link Builder</h2>
          <p className="text-gray-600 mb-6">
            Add UTM parameters to track which campaigns perform best.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                placeholder="summer-promo"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <input
                type="text"
                placeholder="facebook"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medium
              </label>
              <input
                type="text"
                placeholder="social"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                disabled
              />
            </div>

            <div className="pt-4">
              <button
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
                disabled
              >
                Generate Campaign Link
              </button>
            </div>
          </div>
        </div>

        {/* Social Share Templates */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Social Share Templates</h2>
          <p className="text-gray-600 mb-6">
            Pre-written posts optimized for different social platforms.
          </p>

          <div className="space-y-4">
            <div className="border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-blue-600">Facebook</h3>
                <button
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  disabled
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-700">
                🚀 I've been using The dAItaniverse and it's transformed my business! Join me and get access to amazing AI tools. [Your Link]
              </p>
            </div>

            <div className="border-2 border-pink-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-pink-600">Instagram</h3>
                <button
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                  disabled
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-700">
                ✨ Building my business with AI just got easier! Check out The dAItaniverse 💫 Link in bio!
              </p>
            </div>

            <div className="border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-purple-600">LinkedIn</h3>
                <button
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  disabled
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-700">
                Excited to share a resource that's helping me scale my business: The dAItaniverse platform. It combines AI tools with strategic guidance for entrepreneurs. [Your Link]
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

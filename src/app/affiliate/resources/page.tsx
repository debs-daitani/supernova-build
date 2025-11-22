import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'
import { ArrowLeft, Download, Image, FileText, Video, Share2 } from 'lucide-react'

export default async function AffiliateResourcesPage() {
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

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
              <Download className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Marketing Resources</h1>
              <p className="text-gray-600">Download banners, graphics, and copy to promote The dAItaniverse</p>
            </div>
          </div>
        </div>

        {/* Social Media Graphics */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Image className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Social Media Graphics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg h-32 mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Instagram Post (1080x1080)</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Instagram Square</h3>
              <button
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                disabled
              >
                Download
              </button>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg h-32 mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Instagram Story (1080x1920)</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Instagram Story</h3>
              <button
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                disabled
              >
                Download
              </button>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="bg-gradient-to-br from-pink-100 to-blue-100 rounded-lg h-32 mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Facebook Post (1200x630)</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Facebook Post</h3>
              <button
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                disabled
              >
                Download
              </button>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg h-32 mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-sm">LinkedIn Post (1200x627)</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">LinkedIn Post</h3>
              <button
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                disabled
              >
                Download
              </button>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg h-32 mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Twitter Post (1200x675)</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Twitter Post</h3>
              <button
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                disabled
              >
                Download
              </button>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="bg-gradient-to-br from-blue-100 to-pink-100 rounded-lg h-32 mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Pinterest Pin (1000x1500)</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Pinterest Pin</h3>
              <button
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                disabled
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-pink-600" />
            <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-pink-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">Personal Introduction</h3>
              <p className="text-sm text-gray-600 mb-4">
                Perfect for sending to friends, family, and personal contacts
              </p>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4 text-sm">
                <p className="text-gray-700">
                  Hey [Name],<br /><br />
                  I wanted to share something that's been transforming my business. I've been using The dAItaniverse platform and it's incredible – combines AI tools with strategic guidance for entrepreneurs...<br /><br />
                  Check it out: [Your Affiliate Link]
                </p>
              </div>
              <button
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                disabled
              >
                Copy Template
              </button>
            </div>

            <div className="border-2 border-purple-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">Professional Recommendation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Great for business contacts and professional networks
              </p>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4 text-sm">
                <p className="text-gray-700">
                  Hi [Name],<br /><br />
                  I know you're always looking for ways to scale your business more effectively. I recently discovered The dAItaniverse, a comprehensive platform that combines AI-powered tools with strategic frameworks...<br /><br />
                  Learn more: [Your Affiliate Link]
                </p>
              </div>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                disabled
              >
                Copy Template
              </button>
            </div>
          </div>
        </div>

        {/* Promotional Banners */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Share2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Website Banners</h2>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-blue-200 rounded-lg p-4">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg h-20 mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Leaderboard (728x90)</span>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Leaderboard Banner</h3>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  disabled
                >
                  Download
                </button>
              </div>
            </div>

            <div className="border-2 border-purple-200 rounded-lg p-4">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg h-32 mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Medium Rectangle (300x250)</span>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Medium Rectangle</h3>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  disabled
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Resources */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Video className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Video Resources</h2>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-purple-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">Platform Overview Video</h3>
              <p className="text-sm text-gray-600 mb-4">
                2-minute overview of The dAItaniverse platform (perfect for social sharing)
              </p>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                disabled
              >
                Download MP4
              </button>
            </div>

            <div className="border-2 border-pink-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">Success Stories</h3>
              <p className="text-sm text-gray-600 mb-4">
                Testimonial videos from successful members
              </p>
              <button
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                disabled
              >
                Download MP4
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

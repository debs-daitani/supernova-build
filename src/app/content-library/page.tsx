import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { BookOpen, ArrowLeft, FileText, Video, Headphones, Download } from 'lucide-react'
import Link from 'next/link'

export default async function ContentLibraryPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const features = [
    {
      icon: FileText,
      title: 'Guides & Workbooks',
      description: 'Downloadable PDFs and interactive workbooks for your personal development journey',
    },
    {
      icon: Video,
      title: 'Video Content',
      description: 'Exclusive video tutorials, masterclasses, and recorded sessions',
    },
    {
      icon: Headphones,
      title: 'Audio Resources',
      description: 'Meditation guides, affirmations, and podcast episodes',
    },
    {
      icon: Download,
      title: 'Templates & Tools',
      description: 'Ready-to-use templates, planners, and productivity tools',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Content Library</h1>
          <div className="inline-block bg-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">
            COMING SOON
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your exclusive collection of resources, guides, and transformative content is being
            carefully curated for you
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white border-2 border-pink-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <Icon className="w-10 h-10 text-pink-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* Coming Soon Message */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-8 text-center text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-2">📚 Stay Tuned!</h2>
          <p className="text-lg">
            We're building something amazing for you. The Content Library will be launching soon
            with incredible resources to support your transformation journey.
          </p>
        </div>
      </div>
    </div>
  )
}

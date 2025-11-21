import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { GraduationCap, ArrowLeft, Sparkles, Target, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export default async function ProgramsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const programs = [
    {
      icon: Sparkles,
      title: 'Transformation Programme',
      description: 'A comprehensive 12-week journey to unlock your full potential and create lasting change',
    },
    {
      icon: Target,
      title: 'Goal Mastery Course',
      description: 'Learn proven strategies to set, achieve, and exceed your most ambitious goals',
    },
    {
      icon: TrendingUp,
      title: 'Growth Accelerator',
      description: 'Fast-track your personal and professional development with expert guidance',
    },
    {
      icon: Users,
      title: 'Community Programmes',
      description: 'Join group programmes and connect with like-minded individuals on similar journeys',
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
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Programmes</h1>
          <div className="inline-block bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">
            COMING SOON
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transformative programmes designed to accelerate your growth and help you achieve
            extraordinary results
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {programs.map((program, index) => {
            const Icon = program.icon
            return (
              <div
                key={index}
                className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <Icon className="w-10 h-10 text-purple-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                <p className="text-gray-600">{program.description}</p>
              </div>
            )
          })}
        </div>

        {/* Coming Soon Message */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-8 text-center text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-2">🎓 Exciting Things Ahead!</h2>
          <p className="text-lg mb-4">
            We're crafting transformative programmes that will take you from where you are to where
            you want to be. Each programme is designed with care to ensure maximum impact.
          </p>
          <p className="text-sm opacity-90">
            Be the first to know when our programmes launch. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  )
}

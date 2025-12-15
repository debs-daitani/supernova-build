'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      router.push('/login')
    }
  }

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'SUPERNova AI',
      description: 'Your personal ADHD-friendly AI coach, ready 24/7',
      action: 'Start chatting',
      link: '/supernova',
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Quiz Builder',
      description: 'Create lead-generating quizzes in minutes',
      action: 'Build your first quiz',
      link: '/admin/quiz/create',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'ADHD Tools',
      description: 'Dopamine menu, pattern interrupts, and more',
      action: 'Explore tools',
      link: '/supernova',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'VENUED Projects',
      description: 'Keep your rebel projects on track',
      action: 'Create a project',
      link: '/supernova',
    },
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{
        backgroundImage: "url('/images/dAitaniverse Stage.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-4xl w-full">
        {/* Welcome Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex p-8 rounded-3xl bg-gradient-to-br from-hot-pink via-mid-teal to-light-teal mb-6 shadow-[0_0_60px_rgba(0,240,233,0.4)] animate-pulse-glow">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-arp-display font-bold mb-4 text-white">
            Welcome to dAItaniverse!
          </h1>
          <p className="text-xl text-gray-200 font-josefin mb-2">
            {user?.name ? `Hey ${user.name}, ` : 'Hey rebel, '}you're all set!
          </p>
          <p className="text-lg text-gray-300 font-josefin">
            Your 7-day free trial has started. Let's build something epic.
          </p>
        </div>

        {/* Features Grid */}
        <div className="backdrop-blur-xl bg-charcoal/80 rounded-3xl border-2 border-light-teal/30 shadow-[0_0_60px_rgba(0,240,233,0.3)] p-8 md:p-12 mb-8">
          <h2 className="text-2xl font-supernova text-white mb-8 text-center">
            Quick Tour: What You Can Do
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-charcoal/60 border border-light-teal/20 hover:border-light-teal/40 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-hot-pink to-light-teal flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-josefin font-bold text-white mb-2 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 font-josefin text-sm mb-4">
                      {feature.description}
                    </p>
                    <button
                      onClick={() => router.push(feature.link)}
                      className="flex items-center gap-2 text-light-teal hover:text-hot-pink font-josefin font-semibold text-sm transition-colors"
                    >
                      {feature.action}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/supernova')}
            className="py-4 px-8 rounded-2xl bg-gradient-to-br from-hot-pink via-mid-teal to-light-teal text-white font-josefin font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,0,142,0.5)] hover:shadow-[0_0_60px_rgba(255,0,142,0.7)]"
          >
            Start with SUPERNova
          </button>
          <button
            onClick={() => router.push('/admin/quiz/create')}
            className="py-4 px-8 rounded-2xl bg-charcoal/60 border-2 border-light-teal/40 text-white font-josefin font-bold text-lg hover:bg-charcoal/80 transition-all"
          >
            Create Your First Quiz
          </button>
        </div>

        {/* Trial Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 font-josefin text-sm">
            Your free trial ends on{' '}
            <span className="text-white font-bold">
              {new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <br />
            Manage your subscription anytime in{' '}
            <button
              onClick={() => router.push('/account/billing')}
              className="text-light-teal hover:text-hot-pink transition-colors underline"
            >
              Billing Settings
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

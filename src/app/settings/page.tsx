import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  ArrowLeft,
  Settings as SettingsIcon,
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  Palette,
  Lock,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { enGB } from 'date-fns/locale'

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch user data with profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  })

  if (!user) {
    redirect('/login')
  }

  const joinDate = format(user.createdAt, 'dd MMMM yyyy', { locale: enGB })
  const fullName = user.profile?.firstName && user.profile?.lastName
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.profile?.firstName || 'Not set'

  const comingSoonFeatures = [
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage your email and push notification preferences',
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customise your dashboard theme and display settings',
    },
    {
      icon: Lock,
      title: 'Privacy & Security',
      description: 'Update your password and manage security settings',
    },
    {
      icon: CreditCard,
      title: 'Billing & Subscription',
      description: 'Manage your subscription plan and payment methods',
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
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Current Account Information */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
            {/* Name */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <User className="w-6 h-6 text-purple-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{fullName}</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-purple-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                  <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Account Type */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-purple-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Account Type</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-gray-900">{user.role}</p>
                    {user.role === 'FREE' && <span>🎯</span>}
                    {user.role === 'UPGRADE' && <span>⭐</span>}
                    {user.role === 'MEMBER' && <span>👑</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Join Date */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-purple-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Member Since</p>
                  <p className="text-lg font-semibold text-gray-900">{joinDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comingSoonFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md relative opacity-60"
                >
                  <div className="absolute top-4 right-4">
                    <span className="bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                      COMING SOON
                    </span>
                  </div>
                  <Icon className="w-10 h-10 text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info Message */}
        <div className="mt-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 text-center text-white shadow-xl">
          <p className="text-lg">
            ⚙️ More settings and customisation options will be available soon!
          </p>
        </div>
      </div>
    </div>
  )
}

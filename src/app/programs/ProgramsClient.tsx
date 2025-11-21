'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  ArrowLeft,
  Lock,
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
} from 'lucide-react'
import { UserRole } from '@prisma/client'

interface Program {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  instructor: string | null
  durationMinutes: number | null
  requiredRole: UserRole
  isPremium: boolean
  hasAccess: boolean
  isEnrolled: boolean
  totalLessons: number
  totalModules: number
  enrollment: {
    progress: number
    enrolledAt: Date
    completedAt: Date | null
  } | null
  _count: {
    enrollments: number
  }
}

export function ProgramsClient({ userId }: { userId: string }) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/programs')
      const data = await response.json()
      setPrograms(data)
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const badges = {
      FREE: { text: 'Free', color: 'bg-gray-100 text-gray-700', icon: '🎯' },
      UPGRADE: { text: 'Upgrade', color: 'bg-purple-100 text-purple-700', icon: '⭐' },
      MEMBER: { text: 'Member', color: 'bg-pink-100 text-pink-700', icon: '👑' },
    }
    return badges[role]
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Self-paced'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading programmes...</p>
        </div>
      </div>
    )
  }

  const enrolledPrograms = programs.filter((p) => p.isEnrolled)
  const availablePrograms = programs.filter((p) => !p.isEnrolled)

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
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Programmes</h1>
              <p className="text-gray-600">
                Structured learning paths to accelerate your growth
              </p>
            </div>
          </div>
        </div>

        {/* Enrolled Programs */}
        {enrolledPrograms.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Programmes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} formatDuration={formatDuration} getRoleBadge={getRoleBadge} />
              ))}
            </div>
          </div>
        )}

        {/* Available Programs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {enrolledPrograms.length > 0 ? 'Available Programmes' : 'All Programmes'}
          </h2>
          {availablePrograms.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No programmes available</h3>
              <p className="text-gray-600">Check back soon for new learning opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePrograms.map((program) => (
                <ProgramCard key={program.id} program={program} formatDuration={formatDuration} getRoleBadge={getRoleBadge} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgramCard({ program, formatDuration, getRoleBadge }: any) {
  const badge = getRoleBadge(program.requiredRole)

  return (
    <Link href={`/programs/${program.id}`}>
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
          {program.thumbnail ? (
            <img src={program.thumbnail} alt={program.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <GraduationCap className="w-16 h-16 text-purple-300" />
            </div>
          )}
          {!program.hasAccess && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Lock className="w-12 h-12 text-white" />
            </div>
          )}
          {program.isEnrolled && program.enrollment && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
              <Play className="w-3 h-3" />
              {program.enrollment.progress}%
            </div>
          )}
          {program.enrollment?.completedAt && (
            <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-2">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.color}`}>
              {badge.icon} {badge.text}
            </span>
            {program.instructor && (
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {program.instructor}
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
            {program.title}
          </h3>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
            {program.description}
          </p>

          {/* Progress Bar for Enrolled */}
          {program.isEnrolled && program.enrollment && !program.enrollment.completedAt && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${program.enrollment.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {program.totalModules} modules • {program.totalLessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(program.durationMinutes)}
            </span>
          </div>

          {/* Enrollment Status */}
          <div className="mt-4">
            {program.isEnrolled ? (
              <div className="bg-purple-50 text-purple-700 text-center py-2 px-4 rounded-lg font-semibold text-sm">
                {program.enrollment?.completedAt ? 'Completed' : 'Continue Learning'}
              </div>
            ) : program.hasAccess ? (
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center py-2 px-4 rounded-lg font-semibold text-sm">
                Enrol Now
              </div>
            ) : (
              <div className="bg-gray-100 text-gray-600 text-center py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Upgrade Required
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

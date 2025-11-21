'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  ArrowLeft,
  Play,
  Award,
  CheckCircle,
  BookOpen,
  Clock,
} from 'lucide-react'

export function MyLearningClient({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyLearning()
  }, [])

  const fetchMyLearning = async () => {
    try {
      const response = await fetch('/api/my-learning')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching my learning:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const { inProgress = [], completed = [] } = data || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Learning</h1>
              <p className="text-gray-600">Track your progress and achievements</p>
            </div>
          </div>
        </div>

        {/* In Progress */}
        {inProgress.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">In Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgress.map((enrollment: any) => (
                <ProgramCard key={enrollment.id} enrollment={enrollment} type="in-progress" />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Completed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map((enrollment: any) => (
                <ProgramCard key={enrollment.id} enrollment={enrollment} type="completed" />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {inProgress.length === 0 && completed.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Programmes Yet</h3>
            <p className="text-gray-600 mb-6">
              Start your learning journey by enrolling in a programme
            </p>
            <Link
              href="/programs"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Browse Programmes
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function ProgramCard({ enrollment, type }: { enrollment: any; type: 'in-progress' | 'completed' }) {
  const { program } = enrollment

  return (
    <Link href={`/programs/${program.id}`}>
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
          {program.thumbnail ? (
            <img src={program.thumbnail} alt={program.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <GraduationCap className="w-16 h-16 text-purple-300" />
            </div>
          )}
          {type === 'completed' ? (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
              <CheckCircle className="w-5 h-5" />
            </div>
          ) : (
            <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full px-3 py-1 text-xs font-bold">
              {enrollment.progressPercentage}%
            </div>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
            {program.description}
          </p>

          {type === 'in-progress' && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                  style={{ width: `${enrollment.progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {enrollment.completedLessons} / {enrollment.totalLessons} lessons completed
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(enrollment.lastAccessedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {enrollment.totalLessons} lessons
            </span>
          </div>

          <div className="mt-4">
            {type === 'completed' ? (
              <div className="flex gap-2">
                <div className="flex-1 bg-green-50 text-green-700 text-center py-2 px-4 rounded-lg font-semibold text-sm">
                  Completed
                </div>
                {enrollment.certificate && (
                  <button className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors">
                    <Award className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : enrollment.nextLesson ? (
              <Link
                href={`/programs/${program.id}/lessons/${enrollment.nextLesson.lessonId}`}
                className="block bg-purple-50 text-purple-700 text-center py-2 px-4 rounded-lg font-semibold text-sm hover:bg-purple-100 transition-colors"
              >
                <Play className="w-4 h-4 inline mr-1" />
                Continue: {enrollment.nextLesson.lessonTitle}
              </Link>
            ) : (
              <div className="bg-purple-50 text-purple-700 text-center py-2 px-4 rounded-lg font-semibold text-sm">
                Continue Learning
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

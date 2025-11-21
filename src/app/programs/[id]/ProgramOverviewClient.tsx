'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  GraduationCap,
  Lock,
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Download,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export function ProgramOverviewClient({ programId, userId }: { programId: string; userId: string }) {
  const router = useRouter()
  const [program, setProgram] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchProgram()
  }, [programId])

  const fetchProgram = async () => {
    try {
      const response = await fetch(`/api/programs/${programId}`)
      const data = await response.json()
      setProgram(data)
      // Expand first module by default
      if (data.modules?.length > 0) {
        setExpandedModules(new Set([data.modules[0].id]))
      }
    } catch (error) {
      console.error('Error fetching program:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      const response = await fetch(`/api/programs/${programId}/enroll`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchProgram() // Refresh to show enrolled state
      }
    } catch (error) {
      console.error('Error enrolling:', error)
    } finally {
      setEnrolling(false)
    }
  }

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!program) {
    return <div>Program not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/programs"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Programmes
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden mb-8">
          <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100">
            {program.thumbnail && <img src={program.thumbnail} alt={program.title} className="w-full h-full object-cover" />}
            {!program.hasAccess && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xl font-bold">Upgrade required to access</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{program.title}</h1>
            <p className="text-lg text-gray-700 mb-6">{program.description}</p>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
              {program.instructor && (
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {program.instructor}
                </span>
              )}
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {program.totalLessons} lessons
              </span>
              {program.durationMinutes && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {Math.round(program.durationMinutes / 60)} hours
                </span>
              )}
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {program.modules?.length} modules
              </span>
            </div>

            {program.isEnrolled && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Your Progress</span>
                  <span className="text-purple-600 font-bold">{program.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full"
                    style={{ width: `${program.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {program.isEnrolled ? (
                <>
                  {program.nextLesson ? (
                    <Link
                      href={`/programs/${programId}/lessons/${program.nextLesson.lessonId}`}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Continue Learning
                    </Link>
                  ) : (
                    <div className="bg-green-50 text-green-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Completed!
                    </div>
                  )}
                  {program.certificate && (
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Download Certificate
                    </button>
                  )}
                </>
              ) : program.hasAccess ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enrol Now'}
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Upgrade to Access
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Curriculum */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Curriculum</h2>
          <div className="space-y-4">
            {program.modules?.map((module: any, index: number) => (
              <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full text-purple-600 font-bold">
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-600">{module.lessons.length} lessons</p>
                    </div>
                  </div>
                  {expandedModules.has(module.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {expandedModules.has(module.id) && (
                  <div className="border-t border-gray-200">
                    {module.lessons.map((lesson: any) => {
                      const isCompleted = lesson.progress[0]?.completed
                      const canAccess = program.isEnrolled && program.hasAccess

                      return (
                        <div
                          key={lesson.id}
                          className={`p-4 flex items-center justify-between hover:bg-gray-50 ${
                            !canAccess && 'opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : canAccess ? (
                              <Play className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{lesson.title}</p>
                              {lesson.duration && (
                                <p className="text-sm text-gray-600">{lesson.duration} min</p>
                              )}
                            </div>
                          </div>
                          {canAccess && (
                            <Link
                              href={`/programs/${programId}/lessons/${lesson.id}`}
                              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                            >
                              {isCompleted ? 'Review' : 'Start'}
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Download,
  FileText,
  Play,
  BookOpen,
} from 'lucide-react'

export function LessonPlayerClient({
  programId,
  lessonId,
  userId,
}: {
  programId: string
  lessonId: string
  userId: string
}) {
  const router = useRouter()
  const [program, setProgram] = useState<any>(null)
  const [currentLesson, setCurrentLesson] = useState<any>(null)
  const [marking, setMarking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    fetchProgramAndLesson()
  }, [lessonId])

  const fetchProgramAndLesson = async () => {
    try {
      const response = await fetch(`/api/programs/${programId}`)
      const data = await response.json()
      setProgram(data)

      // Find current lesson
      for (const module of data.modules) {
        const lesson = module.lessons.find((l: any) => l.id === lessonId)
        if (lesson) {
          setCurrentLesson({ ...lesson, moduleId: module.id, moduleName: module.title })
          break
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error)
    }
  }

  const handleMarkComplete = async () => {
    setMarking(true)
    try {
      await fetch(`/api/programs/${programId}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })
      fetchProgramAndLesson()
    } catch (error) {
      console.error('Error marking complete:', error)
    } finally {
      setMarking(false)
    }
  }

  const getNextLesson = () => {
    if (!program || !currentLesson) return null
    let found = false
    for (const module of program.modules) {
      for (const lesson of module.lessons) {
        if (found) return { lesson, moduleId: module.id }
        if (lesson.id === lessonId) found = true
      }
    }
    return null
  }

  const getPreviousLesson = () => {
    if (!program || !currentLesson) return null
    let prevLesson = null
    for (const module of program.modules) {
      for (const lesson of module.lessons) {
        if (lesson.id === lessonId) return prevLesson
        prevLesson = { lesson, moduleId: module.id }
      }
    }
    return null
  }

  if (!program || !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  const isCompleted = currentLesson.progress[0]?.completed
  const nextLesson = getNextLesson()
  const prevLesson = getPreviousLesson()

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/programs/${programId}`}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Programme
              </Link>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-300 hover:text-white"
              >
                <BookOpen className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Video/Content Area */}
          <div className="flex-1 overflow-y-auto">
            {currentLesson.videoUrl ? (
              <div className="aspect-video bg-black">
                <iframe
                  src={currentLesson.videoUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video bg-gray-800 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <p>Text-based lesson</p>
                </div>
              </div>
            )}

            <div className="p-8 bg-gray-900">
              <h1 className="text-3xl font-bold mb-4">{currentLesson.title}</h1>
              <p className="text-gray-300 mb-6">{currentLesson.description}</p>

              {currentLesson.content && (
                <div className="prose prose-invert max-w-none mb-8">
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                </div>
              )}

              {currentLesson.fileUrl && (
                <a
                  href={currentLesson.fileUrl}
                  download
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mb-8"
                >
                  <Download className="w-5 h-5" />
                  Download Resources
                </a>
              )}

              {/* Navigation & Mark Complete */}
              <div className="flex items-center justify-between border-t border-gray-700 pt-6">
                <div>
                  {prevLesson && (
                    <Link
                      href={`/programs/${programId}/lessons/${prevLesson.lesson.id}`}
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Previous Lesson
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {!isCompleted && (
                    <button
                      onClick={handleMarkComplete}
                      disabled={marking}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {marking ? 'Marking...' : 'Mark as Complete'}
                    </button>
                  )}
                  {nextLesson && (
                    <Link
                      href={`/programs/${programId}/lessons/${nextLesson.lesson.id}`}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      Next Lesson
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Curriculum */}
        {sidebarOpen && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-bold text-lg">{program.title}</h3>
              <p className="text-sm text-gray-400">
                {program.completedLessons} / {program.totalLessons} lessons completed
              </p>
            </div>
            <div className="p-4 space-y-4">
              {program.modules?.map((module: any) => (
                <div key={module.id}>
                  <h4 className="font-semibold text-sm text-gray-300 mb-2">{module.title}</h4>
                  <div className="space-y-1">
                    {module.lessons.map((lesson: any) => (
                      <Link
                        key={lesson.id}
                        href={`/programs/${programId}/lessons/${lesson.id}`}
                        className={`block p-2 rounded text-sm transition-colors ${
                          lesson.id === lessonId
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {lesson.progress[0]?.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
                          )}
                          <span className="flex-1">{lesson.title}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

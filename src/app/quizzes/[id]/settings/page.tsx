'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function QuizSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    requireEmail: false,
    showProgressBar: true,
    allowBack: true,
    shuffleQuestions: false,
    collectLeads: false,
    thankYouMessage: '',
    redirectUrl: '',
    metaTitle: '',
    metaDescription: '',
    customCss: '',
  })

  useEffect(() => {
    if (quizId) {
      fetchQuiz()
    }
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`)
      const data = await res.json()
      setQuiz(data)
      setSettings({
        requireEmail: data.requireEmail || false,
        showProgressBar: data.showProgressBar !== undefined ? data.showProgressBar : true,
        allowBack: data.allowBack !== undefined ? data.allowBack : true,
        shuffleQuestions: data.shuffleQuestions || false,
        collectLeads: data.collectLeads || false,
        thankYouMessage: data.thankYouMessage || '',
        redirectUrl: data.redirectUrl || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        customCss: data.customCss || '',
      })
    } catch (error) {
      console.error('Error fetching quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await fetch(`/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      alert('Settings saved successfully!')
      fetchQuiz()
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: !quiz.isPublished }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.isPublished ? 'Quiz published!' : 'Quiz unpublished')
        fetchQuiz()
      } else {
        alert(data.error || 'Failed to update publish status')
        if (data.errors) {
          console.error('Validation errors:', data.errors)
        }
      }
    } catch (error) {
      console.error('Error toggling publish:', error)
      alert('Failed to update publish status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
          <Link href="/quizzes">
            <Button>Back to Quizzes</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/quizzes/${quizId}/builder`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Builder
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Quiz Settings
          </h1>
          <p className="text-gray-600">{quiz.title}</p>
        </div>

        <div className="space-y-6">
          {/* Publish Status */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Publishing</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {quiz.isPublished ? (
                    <Globe className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="font-semibold">
                    {quiz.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {quiz.isPublished
                    ? 'This quiz is live and accepting responses'
                    : 'This quiz is not visible to the public'}
                </p>
              </div>
              <Button onClick={togglePublish} className="bg-gradient-to-r from-pink-500 to-purple-500">
                {quiz.isPublished ? 'Unpublish' : 'Publish Quiz'}
              </Button>
            </div>
          </Card>

          {/* Quiz Behavior */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quiz Behavior</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Require Email</label>
                  <p className="text-sm text-gray-600">
                    Require respondents to enter their email address
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireEmail}
                  onChange={(e) => setSettings({ ...settings, requireEmail: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Show Progress Bar</label>
                  <p className="text-sm text-gray-600">
                    Display progress indicator at the top of the quiz
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showProgressBar}
                  onChange={(e) =>
                    setSettings({ ...settings, showProgressBar: e.target.checked })
                  }
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Allow Going Back</label>
                  <p className="text-sm text-gray-600">
                    Let respondents go back to previous questions
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowBack}
                  onChange={(e) => setSettings({ ...settings, allowBack: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Shuffle Questions</label>
                  <p className="text-sm text-gray-600">
                    Randomize the order of questions for each respondent
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.shuffleQuestions}
                  onChange={(e) =>
                    setSettings({ ...settings, shuffleQuestions: e.target.checked })
                  }
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Collect Leads</label>
                  <p className="text-sm text-gray-600">
                    Save respondent information for lead generation
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.collectLeads}
                  onChange={(e) => setSettings({ ...settings, collectLeads: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
            </div>
          </Card>

          {/* After Completion */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">After Completion</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Thank You Message</label>
                <textarea
                  value={settings.thankYouMessage}
                  onChange={(e) =>
                    setSettings({ ...settings, thankYouMessage: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Thank you for completing this quiz!"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Redirect URL (optional)
                </label>
                <input
                  type="url"
                  value={settings.redirectUrl}
                  onChange={(e) => setSettings({ ...settings, redirectUrl: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/thank-you"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Redirect respondents to a URL after completion
                </p>
              </div>
            </div>
          </Card>

          {/* SEO */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">SEO & Meta Tags</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Meta Title</label>
                <input
                  type="text"
                  value={settings.metaTitle}
                  onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={quiz.title}
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Meta Description</label>
                <textarea
                  value={settings.metaDescription}
                  onChange={(e) =>
                    setSettings({ ...settings, metaDescription: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder={quiz.description}
                />
              </div>
            </div>
          </Card>

          {/* Custom CSS */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Custom Styling</h2>
            <div>
              <label className="block font-medium mb-2">Custom CSS</label>
              <textarea
                value={settings.customCss}
                onChange={(e) => setSettings({ ...settings, customCss: e.target.value })}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                rows={10}
                placeholder=".quiz-container {&#10;  /* Your custom CSS */&#10;}"
              />
              <p className="text-sm text-gray-600 mt-1">
                Add custom CSS to style your quiz
              </p>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-pink-500 to-purple-500"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Link href={`/quizzes/${quizId}/builder`}>
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

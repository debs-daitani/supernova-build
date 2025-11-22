'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Copy, BarChart3, Users, FileText, Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TEMPLATE_CATEGORIES, TEMPLATE_CATEGORY_NAMES } from '@/lib/quiz-config'

export default function QuizTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  useEffect(() => {
    fetchTemplates()
  }, [categoryFilter])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('public', 'true')
      if (categoryFilter) params.set('category', categoryFilter)

      const res = await fetch(`/api/quiz-templates?${params}`)
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const useTemplate = async (templateId: string) => {
    try {
      const res = await fetch('/api/quiz-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      })

      if (res.ok) {
        const quiz = await res.json()
        router.push(`/quizzes/${quiz.id}/builder`)
      } else {
        alert('Failed to create quiz from template')
      }
    } catch (error) {
      console.error('Error using template:', error)
      alert('Failed to create quiz from template')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case TEMPLATE_CATEGORIES.BUSINESS:
        return <BarChart3 className="w-6 h-6" />
      case TEMPLATE_CATEGORIES.PERSONALITY:
        return <Users className="w-6 h-6" />
      case TEMPLATE_CATEGORIES.LEAD_GENERATION:
        return <FileText className="w-6 h-6" />
      case TEMPLATE_CATEGORIES.EVENT:
        return <Calendar className="w-6 h-6" />
      default:
        return <Copy className="w-6 h-6" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
                Quiz Templates
              </h1>
              <p className="text-gray-600">
                Start with a professionally designed template and customize it to your needs
              </p>
            </div>
            <Link href="/quizzes">
              <Button variant="outline">Back to Quizzes</Button>
            </Link>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={categoryFilter === '' ? 'default' : 'outline'}
              onClick={() => setCategoryFilter('')}
              className={
                categoryFilter === '' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''
              }
            >
              All Templates
            </Button>
            {Object.entries(TEMPLATE_CATEGORY_NAMES).map(([key, name]) => (
              <Button
                key={key}
                variant={categoryFilter === key ? 'default' : 'outline'}
                onClick={() => setCategoryFilter(key)}
                className={
                  categoryFilter === key ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''
                }
              >
                {name}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : templates.length === 0 ? (
          <Card className="p-12 text-center">
            <Copy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No templates available</h3>
            <p className="text-gray-600 mb-6">Check back later for new templates</p>
            <Link href="/quizzes">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                <Plus className="w-4 h-4 mr-2" />
                Create From Scratch
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                      {getCategoryIcon(template.category)}
                    </div>
                    <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {TEMPLATE_CATEGORY_NAMES[template.category as keyof typeof TEMPLATE_CATEGORY_NAMES]}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{template.usageCount || 0} uses</span>
                    {template.questionCount && (
                      <span>{template.questionCount} questions</span>
                    )}
                  </div>

                  <Button
                    onClick={() => useTemplate(template.id)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/link'
import { Film, Play, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TEMPLATE_CATEGORIES, TEMPLATE_CATEGORY_NAMES } from '@/lib/ai-video-config'

export default function TemplatesPage() {
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

      const res = await fetch(`/api/ai-videos/templates?${params}`)
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const useTemplate = async (template: any) => {
    // In a real implementation, this would navigate to the generate page
    // with the template pre-filled
    router.push(`/ai-videos/generate?template=${template.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Video Templates
          </h1>
          <p className="text-gray-600">
            Start with pre-built templates to create professional videos faster
          </p>
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
              All Categories
            </Button>
            {Object.entries(TEMPLATE_CATEGORIES).map(([key, value]) => (
              <Button
                key={key}
                variant={categoryFilter === value ? 'default' : 'outline'}
                onClick={() => setCategoryFilter(value)}
                className={
                  categoryFilter === value
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                    : ''
                }
              >
                {TEMPLATE_CATEGORY_NAMES[value]}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : templates.length === 0 ? (
          <Card className="p-12 text-center">
            <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No templates available</h3>
            <p className="text-gray-600">Check back later for new templates</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden group">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  {template.previewUrl ? (
                    <video
                      src={template.previewUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  ) : template.thumbnailUrl ? (
                    <img
                      src={template.thumbnailUrl}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Film className="w-16 h-16 text-gray-400" />
                  )}

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                    {TEMPLATE_CATEGORY_NAMES[template.category as keyof typeof TEMPLATE_CATEGORY_NAMES]}
                  </div>

                  {/* Usage Count */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                    {template.usageCount || 0} uses
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span className="capitalize">{template.style.toLowerCase()}</span>
                    <span>•</span>
                    <span>{template.duration}s</span>
                    <span>•</span>
                    <span>{template.aspectRatio}</span>
                  </div>

                  <Button
                    onClick={() => useTemplate(template)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
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

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Layout, Search, Filter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Template {
  id: string
  name: string
  category: string
  width: number
  height: number
  thumbnailUrl: string | null
  tags: string[]
  usageCount: number
}

export default function TemplatesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedTemplateId = searchParams.get('template')

  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'social-media', name: 'Social Media' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'business', name: 'Business' },
    { id: 'other', name: 'Other' },
  ]

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, selectedCategory, searchQuery])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/design-templates')
      const data = await res.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = templates

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    setFilteredTemplates(filtered)
  }

  const createDesignFromTemplate = async (templateId: string) => {
    try {
      const template = templates.find((t) => t.id === templateId)
      if (!template) return

      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} Copy`,
          templateId: template.id,
          width: template.width,
          height: template.height,
          jsonData: {}, // Will be populated from template in backend
        }),
      })

      const design = await res.json()
      router.push(`/design/editor/${design.id}`)
    } catch (error) {
      console.error('Error creating design:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Design Templates
          </h1>
          <p className="text-gray-600">Choose from 20+ professional templates</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : ''
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`overflow-hidden hover:shadow-xl transition-all cursor-pointer ${
                  selectedTemplateId === template.id ? 'ring-2 ring-pink-500' : ''
                }`}
                onClick={() => createDesignFromTemplate(template.id)}
              >
                <div
                  className="w-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center"
                  style={{ aspectRatio: `${template.width}/${template.height}` }}
                >
                  {template.thumbnailUrl ? (
                    <img
                      src={template.thumbnailUrl}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Layout className="w-12 h-12 text-purple-400" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600">
                        {template.width} × {template.height}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        createDesignFromTemplate(template.id)
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {template.usageCount > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Used {template.usageCount} times
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            Showing {filteredTemplates.length} of {templates.length} templates
          </div>
        )}
      </div>
    </div>
  )
}

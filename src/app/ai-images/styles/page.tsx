'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Palette, Sparkles, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { STYLE_CATEGORIES } from '@/lib/ai-image-styles'

interface StylePreset {
  id: string
  name: string
  description: string
  category: string
  thumbnailUrl?: string
  promptModifier: string
  negativePrompt?: string
  model: string
  isPremium: boolean
}

export default function StylesLibraryPage() {
  const router = useRouter()
  const [styles, setStyles] = useState<StylePreset[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStyles()
  }, [])

  const fetchStyles = async () => {
    try {
      const res = await fetch('/api/ai-image-styles')
      const data = await res.json()
      setStyles(data)
    } catch (error) {
      console.error('Error fetching styles:', error)
    } finally {
      setLoading(false)
    }
  }

  const useStyle = (styleId: string) => {
    router.push(`/ai-images/generate?style=${styleId}`)
  }

  const filteredStyles =
    selectedCategory === 'all'
      ? styles
      : styles.filter((s) => s.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Style Library
          </h1>
          <p className="text-gray-600">
            Pre-configured styles to enhance your AI image generation
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : ''
              }
            >
              All Styles ({styles.length})
            </Button>

            {STYLE_CATEGORIES.map((category) => {
              const count = styles.filter((s) => s.category === category.id).length
              return (
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
                  {category.icon} {category.name} ({count})
                </Button>
              )
            })}
          </div>
        </div>

        {/* Styles Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading styles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStyles.map((style) => (
              <Card
                key={style.id}
                className="overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center relative">
                  {style.thumbnailUrl ? (
                    <img
                      src={style.thumbnailUrl}
                      alt={style.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Palette className="w-16 h-16 text-purple-300" />
                  )}

                  {style.isPremium && (
                    <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      PRO
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold mb-2">{style.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {style.description}
                  </p>

                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Prompt Modifier:</p>
                    <p className="text-xs bg-gray-100 p-2 rounded line-clamp-2">
                      {style.promptModifier}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {style.model}
                    </span>
                    <span className="capitalize">{style.category}</span>
                  </div>

                  <Button
                    onClick={() => useStyle(style.id)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Use This Style
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredStyles.length === 0 && !loading && (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No styles in this category</h3>
            <p className="text-gray-600">Try selecting a different category</p>
          </div>
        )}

        {/* Info Card */}
        <Card className="p-6 mt-12 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-purple-200">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            How Styles Work
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              • Styles automatically enhance your prompts with professional modifiers
            </p>
            <p>
              • Each style is optimized for specific types of content
            </p>
            <p>
              • Premium styles (marked with <Crown className="w-3 h-3 inline" /> PRO) require BADASS tier subscription
            </p>
            <p>
              • You can combine styles with your own prompts for unique results
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

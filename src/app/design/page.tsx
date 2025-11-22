'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Layout, Upload, Palette, Plus, Image, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Design {
  id: string
  name: string
  thumbnailUrl: string | null
  width: number
  height: number
  lastEditedAt: string
}

interface Template {
  id: string
  name: string
  category: string
  thumbnailUrl: string | null
  width: number
  height: number
}

export default function DesignHomePage() {
  const [recentDesigns, setRecentDesigns] = useState<Design[]>([])
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [designsRes, templatesRes] = await Promise.all([
          fetch('/api/designs'),
          fetch('/api/design-templates')
        ])

        const designs = await designsRes.json()
        const templates = await templatesRes.json()

        setRecentDesigns(designs.slice(0, 6))
        setPopularTemplates(templates.slice(0, 8))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const categories = [
    { name: 'Social Media', icon: Users, description: 'Instagram, Facebook, Twitter posts' },
    { name: 'YouTube', icon: FileText, description: 'Thumbnails and channel art' },
    { name: 'Marketing', icon: Sparkles, description: 'Ads, banners, and promotions' },
    { name: 'Business', icon: Layout, description: 'Cards, presentations, logos' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Design Tools
          </h1>
          <p className="text-gray-600">Create stunning graphics for social media, marketing, and more</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Link href="/design/templates">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-pink-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-3">
                  <Layout className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Start from Template</h3>
                <p className="text-sm text-gray-600">20+ ready-made designs</p>
              </div>
            </Card>
          </Link>

          <Link href="/design/my-designs">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 flex items-center justify-center mb-3">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">My Designs</h3>
                <p className="text-sm text-gray-600">View all your work</p>
              </div>
            </Card>
          </Link>

          <Link href="/design/uploads">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-orange-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Upload Assets</h3>
                <p className="text-sm text-gray-600">Images, icons, shapes</p>
              </div>
            </Card>
          </Link>

          <Link href="/design/brand-kit">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-pink-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-3">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Brand Kit</h3>
                <p className="text-sm text-gray-600">Colors, fonts, logos</p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Browse by Category */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/design/templates?category=${category.name.toLowerCase().replace(' ', '-')}`}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <category.icon className="w-8 h-8 text-pink-500 mb-3" />
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Designs */}
        {recentDesigns.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Designs</h2>
              <Link href="/design/my-designs">
                <Button variant="ghost">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentDesigns.map((design) => (
                <Link key={design.id} href={`/design/editor/${design.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {design.thumbnailUrl ? (
                        <img src={design.thumbnailUrl} alt={design.name} className="w-full h-full object-cover" />
                      ) : (
                        <Image className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm truncate">{design.name}</p>
                      <p className="text-xs text-gray-500">{design.width} × {design.height}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Templates */}
        {popularTemplates.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Popular Templates</h2>
              <Link href="/design/templates">
                <Button variant="ghost">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {popularTemplates.map((template) => (
                <Link key={template.id} href={`/design/templates?template=${template.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      {template.thumbnailUrl ? (
                        <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
                      ) : (
                        <Layout className="w-8 h-8 text-purple-400" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="font-medium text-xs truncate">{template.name}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && recentDesigns.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Start Creating</h3>
            <p className="text-gray-600 mb-6">Choose a template or start from scratch</p>
            <Link href="/design/templates">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

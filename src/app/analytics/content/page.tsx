'use client'

import { useState } from 'react'
import { Globe, Palette, Image, Video, TrendingUp, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ContentAnalyticsPage() {
  const [contentType, setContentType] = useState<'all' | 'websites' | 'designs' | 'images' | 'videos'>('all')

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Content Analytics
          </h1>
          <p className="text-gray-600">Track performance of your created content</p>
        </div>

        {/* Content Type Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button
            variant={contentType === 'all' ? 'default' : 'outline'}
            onClick={() => setContentType('all')}
            size="sm"
          >
            All Content
          </Button>
          <Button
            variant={contentType === 'websites' ? 'default' : 'outline'}
            onClick={() => setContentType('websites')}
            size="sm"
          >
            <Globe className="w-4 h-4 mr-2" />
            Websites
          </Button>
          <Button
            variant={contentType === 'designs' ? 'default' : 'outline'}
            onClick={() => setContentType('designs')}
            size="sm"
          >
            <Palette className="w-4 h-4 mr-2" />
            Designs
          </Button>
          <Button
            variant={contentType === 'images' ? 'default' : 'outline'}
            onClick={() => setContentType('images')}
            size="sm"
          >
            <Image className="w-4 h-4 mr-2" />
            AI Images
          </Button>
          <Button
            variant={contentType === 'videos' ? 'default' : 'outline'}
            onClick={() => setContentType('videos')}
            size="sm"
          >
            <Video className="w-4 h-4 mr-2" />
            Videos
          </Button>
        </div>

        {/* Content Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Websites</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">0 published</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Designs</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">0 exported</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">AI Images</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">0 downloads</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Videos</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">0 clips created</p>
          </Card>
        </div>

        {/* Top Performing Content */}
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">Top Performing Content</h3>
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p>No content performance data available yet</p>
            <p className="text-sm mt-2">Create and publish content to see analytics here</p>
          </div>
        </Card>

        {/* Content Engagement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Most Viewed</h3>
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm">View tracking coming soon</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Most Downloaded</h3>
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm">Download tracking coming soon</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

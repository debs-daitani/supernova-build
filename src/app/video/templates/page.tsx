'use client'

import { Smartphone, Youtube, Video, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { VIDEO_TEMPLATES } from '@/lib/video-templates'

export default function VideoTemplatesPage() {
  const platformIcons = {
    YOUTUBE_SHORT: Youtube,
    INSTAGRAM_REEL: Smartphone,
    TIKTOK: Video,
    LINKEDIN: Briefcase,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Video Templates
          </h1>
          <p className="text-gray-600">Platform-optimized templates for social media</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VIDEO_TEMPLATES.map((template) => {
            const Icon = platformIcons[template.platform as keyof typeof platformIcons]
            return (
              <Card key={template.id} className="p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Aspect Ratio:</span>
                    <span className="font-medium">{template.aspectRatio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max Duration:</span>
                    <span className="font-medium">{template.maxDuration}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Resolution:</span>
                    <span className="font-medium">{template.recommendedWidth}x{template.recommendedHeight}</span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  Use Template
                </Button>
              </Card>
            )
          })}
        </div>

        <Card className="p-6 mt-8 bg-gradient-to-br from-pink-50 to-purple-50">
          <h3 className="font-bold mb-3">Template Features</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Platform-specific aspect ratios and dimensions</li>
            <li>• Pre-configured caption styles for each platform</li>
            <li>• Optimized for maximum engagement</li>
            <li>• Professional overlays and branding options</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

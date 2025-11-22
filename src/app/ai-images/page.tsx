'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Wand2, Image as ImageIcon, Palette, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AIImage {
  id: string
  prompt: string
  model: string
  style: string | null
  imageUrl: string | null
  thumbnailUrl: string | null
  status: string
  createdAt: string
}

export default function AIImagesHomePage() {
  const [recentImages, setRecentImages] = useState<AIImage[]>([])
  const [loading, setLoading] = useState(true)
  const [quotaUsed, setQuotaUsed] = useState(7)
  const [quotaLimit, setQuotaLimit] = useState(10)
  const [userTier, setUserTier] = useState('BOLD') // BRAVE, BOLD, BADASS

  useEffect(() => {
    fetchRecentImages()
    // TODO: Fetch actual quota usage
  }, [])

  const fetchRecentImages = async () => {
    try {
      const res = await fetch('/api/ai-images?status=COMPLETED')
      const data = await res.json()
      setRecentImages(data.slice(0, 6))
    } catch (error) {
      console.error('Error fetching recent images:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: Sparkles,
      title: 'Multiple AI Models',
      description: 'DALL-E 3, DALL-E 2, Stable Diffusion & Midjourney',
    },
    {
      icon: Palette,
      title: '24 Art Styles',
      description: 'Realistic, Anime, 3D, Digital Art, and more',
    },
    {
      icon: Wand2,
      title: 'Prompt Assistant',
      description: 'Smart suggestions to enhance your prompts',
    },
    {
      icon: Zap,
      title: 'Fast Generation',
      description: 'High-quality images in 10-60 seconds',
    },
  ]

  const exampleImages = [
    {
      title: 'Realistic Portrait',
      prompt: 'Professional headshot of a confident businesswoman',
      style: 'Realistic Photo',
    },
    {
      title: 'Fantasy Landscape',
      prompt: 'Mystical forest with glowing mushrooms',
      style: 'Digital Art',
    },
    {
      title: 'Anime Character',
      prompt: 'Cute anime character with colorful hair',
      style: 'Anime',
    },
    {
      title: 'Cyberpunk City',
      prompt: 'Futuristic city with neon lights at night',
      style: 'Cyberpunk',
    },
  ]

  const quotaPercentage = (quotaUsed / quotaLimit) * 100
  const isQuotaExceeded = quotaUsed >= quotaLimit

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            AI Image Generation
          </h1>
          <p className="text-gray-600">Create stunning images with AI - DALL-E, Midjourney, Stable Diffusion</p>
        </div>

        {/* Quota Display */}
        {userTier !== 'BADASS' && (
          <Card className="p-6 mb-8 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {userTier === 'BRAVE' ? 'Upgrade to Generate' : 'Monthly Quota'}
                </h3>
                <p className="text-sm text-gray-600">
                  {userTier === 'BRAVE'
                    ? 'AI image generation requires BOLD or BADASS tier'
                    : `${quotaUsed} of ${quotaLimit} images used this month`}
                </p>
              </div>
              {userTier === 'BRAVE' || isQuotaExceeded ? (
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade to {userTier === 'BRAVE' ? 'BOLD' : 'BADASS'}
                  </Button>
                </Link>
              ) : null}
            </div>
            {userTier !== 'BRAVE' && (
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    quotaPercentage >= 100
                      ? 'bg-red-500'
                      : quotaPercentage >= 80
                      ? 'bg-orange-500'
                      : 'bg-gradient-to-r from-pink-500 to-purple-500'
                  }`}
                  style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                ></div>
              </div>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/ai-images/generate">
            <Card className="p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-pink-300 h-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-4">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Generate New Image</h3>
                <p className="text-gray-600">
                  Create amazing images from text prompts using AI
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/ai-images/gallery">
            <Card className="p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-300 h-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">View Gallery</h3>
                <p className="text-gray-600">
                  Browse all your generated images and explore public gallery
                </p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6">
                <feature.icon className="w-10 h-10 text-pink-500 mb-3" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Generations */}
        {recentImages.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Generations</h2>
              <Link href="/ai-images/gallery">
                <Button variant="ghost">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentImages.map((image) => (
                <Link key={image.id} href={`/ai-images/${image.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      {image.thumbnailUrl ? (
                        <img
                          src={image.thumbnailUrl}
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-16 h-16 text-purple-300" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-sm line-clamp-2 mb-2">{image.prompt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{image.model}</span>
                        {image.style && <span>{image.style}</span>}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Example Prompts */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Get Inspired</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {exampleImages.map((example) => (
              <Card key={example.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-purple-300" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{example.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{example.prompt}</p>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {example.style}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {!loading && recentImages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Start Creating with AI</h3>
            <p className="text-gray-600 mb-6">
              Transform your ideas into stunning images using AI
            </p>
            <Link href="/ai-images/generate">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Your First Image
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

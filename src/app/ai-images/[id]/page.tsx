'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Download,
  Trash2,
  RefreshCw,
  Share2,
  ChevronLeft,
  Image as ImageIcon,
  Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AIImage {
  id: string
  prompt: string
  negativePrompt: string | null
  model: string
  style: string | null
  size: string
  imageUrl: string | null
  status: string
  isPublic: boolean
  createdAt: string
  generatedAt: string | null
  steps: number | null
  cfgScale: number | null
  seed: string | null
}

export default function AIImageDetailPage() {
  const router = useRouter()
  const params = useParams()
  const imageId = params.id as string

  const [image, setImage] = useState<AIImage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImage()
  }, [imageId])

  const fetchImage = async () => {
    try {
      const res = await fetch(`/api/ai-images/${imageId}`)
      const data = await res.json()
      setImage(data)
    } catch (error) {
      console.error('Error fetching image:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = () => {
    if (!image?.imageUrl) return

    const link = document.createElement('a')
    link.href = image.imageUrl
    link.download = `ai-image-${image.id}.png`
    link.click()
  }

  const deleteImage = async () => {
    if (!confirm('Delete this image permanently?')) return

    try {
      await fetch(`/api/ai-images/${imageId}`, { method: 'DELETE' })
      router.push('/ai-images/gallery')
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image')
    }
  }

  const togglePublic = async () => {
    if (!image) return

    try {
      const res = await fetch(`/api/ai-images/${imageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !image.isPublic }),
      })

      const updated = await res.json()
      setImage(updated)
    } catch (error) {
      console.error('Error updating image:', error)
    }
  }

  const regenerate = () => {
    if (!image) return

    // Navigate to generate page with pre-filled prompt
    const params = new URLSearchParams({
      prompt: image.prompt,
      model: image.model,
      size: image.size,
    })

    if (image.negativePrompt) {
      params.set('negativePrompt', image.negativePrompt)
    }

    router.push(`/ai-images/generate?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading image...</p>
        </div>
      </div>
    )
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Image not found</h2>
          <Link href="/ai-images/gallery">
            <Button>Back to Gallery</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/ai-images/gallery">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Preview */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="bg-gray-900 flex items-center justify-center min-h-[500px]">
                {image.imageUrl ? (
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="max-w-full max-h-[800px] object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                    <p>
                      {image.status === 'GENERATING' ? 'Generating...' : 'No image available'}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                onClick={downloadImage}
                disabled={!image.imageUrl}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              <Button onClick={regenerate} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>

              <Link href={`/design/editor/new?from=ai-image&imageId=${imageId}`}>
                <Button variant="outline">
                  <Palette className="w-4 h-4 mr-2" />
                  Use in Design Tools
                </Button>
              </Link>

              <Button onClick={togglePublic} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                {image.isPublic ? 'Make Private' : 'Share Publicly'}
              </Button>

              <Button onClick={deleteImage} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Image Details</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Prompt</p>
                  <p className="font-medium">{image.prompt}</p>
                </div>

                {image.negativePrompt && (
                  <div>
                    <p className="text-gray-500 mb-1">Negative Prompt</p>
                    <p className="font-medium">{image.negativePrompt}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 mb-1">Model</p>
                    <p className="font-medium">{image.model}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 mb-1">Size</p>
                    <p className="font-medium">{image.size}</p>
                  </div>
                </div>

                {image.style && (
                  <div>
                    <p className="text-gray-500 mb-1">Style</p>
                    <p className="font-medium">{image.style}</p>
                  </div>
                )}

                {image.steps && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 mb-1">Steps</p>
                      <p className="font-medium">{image.steps}</p>
                    </div>

                    {image.cfgScale && (
                      <div>
                        <p className="text-gray-500 mb-1">CFG Scale</p>
                        <p className="font-medium">{image.cfgScale}</p>
                      </div>
                    )}
                  </div>
                )}

                {image.seed && (
                  <div>
                    <p className="text-gray-500 mb-1">Seed</p>
                    <p className="font-medium font-mono text-xs">{image.seed}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      image.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : image.status === 'FAILED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {image.status}
                  </span>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Visibility</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      image.isPublic
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {image.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Created</p>
                  <p className="font-medium">
                    {new Date(image.createdAt).toLocaleDateString()} at{' '}
                    {new Date(image.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-4">Export Options</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={downloadImage}>
                  <Download className="w-4 h-4 mr-2" />
                  Download as PNG
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={downloadImage}>
                  <Download className="w-4 h-4 mr-2" />
                  Download as JPG
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  Download as PDF (Coming Soon)
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

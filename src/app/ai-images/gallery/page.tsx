'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Image as ImageIcon, Search, Filter, Download, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface AIImage {
  id: string
  prompt: string
  model: string
  style: string | null
  imageUrl: string | null
  thumbnailUrl: string | null
  status: string
  isPublic: boolean
  createdAt: string
}

export default function AIImagesGalleryPage() {
  const [images, setImages] = useState<AIImage[]>([])
  const [filter, setFilter] = useState<'all' | 'my-images' | 'public'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImages()
  }, [filter])

  const fetchImages = async () => {
    try {
      let url = '/api/ai-images?status=COMPLETED'
      if (filter === 'public') {
        url += '&public=true'
      }

      const res = await fetch(url)
      const data = await res.json()
      setImages(data)
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return

    try {
      await fetch(`/api/ai-images/${id}`, { method: 'DELETE' })
      setImages(images.filter((img) => img.id !== id))
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const filteredImages = images.filter((img) =>
    img.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            AI Image Gallery
          </h1>
          <p className="text-gray-600">Browse all generated images</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : ''}
            >
              All Images
            </Button>
            <Button
              variant={filter === 'my-images' ? 'default' : 'outline'}
              onClick={() => setFilter('my-images')}
              className={filter === 'my-images' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : ''}
            >
              My Images
            </Button>
            <Button
              variant={filter === 'public' ? 'default' : 'outline'}
              onClick={() => setFilter('public')}
              className={filter === 'public' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : ''}
            >
              Public Gallery
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading images...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No images found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Generate your first image'}
            </p>
            <Link href="/ai-images/generate">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                Generate Image
              </Button>
            </Link>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {filteredImages.map((image) => (
              <Card key={image.id} className="break-inside-avoid mb-4 overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100">
                    {image.thumbnailUrl ? (
                      <img
                        src={image.thumbnailUrl}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                  </div>

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link href={`/ai-images/${image.id}`}>
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => deleteImage(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  <p className="font-medium text-sm line-clamp-2 mb-2">{image.prompt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{image.model}</span>
                    {image.style && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{image.style}</span>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredImages.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            Showing {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

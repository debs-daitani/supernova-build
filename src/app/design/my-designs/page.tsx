'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Image, Search, Grid, List, Plus, Trash2, Copy, Download, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Design {
  id: string
  name: string
  width: number
  height: number
  thumbnailUrl: string | null
  category: string | null
  tags: string[]
  lastEditedAt: string
  createdAt: string
  template?: {
    id: string
    name: string
  }
}

export default function MyDesignsPage() {
  const router = useRouter()
  const [designs, setDesigns] = useState<Design[]>([])
  const [filteredDesigns, setFilteredDesigns] = useState<Design[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [selectedDesigns, setSelectedDesigns] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchDesigns()
  }, [])

  useEffect(() => {
    filterDesigns()
  }, [designs, searchQuery])

  const fetchDesigns = async () => {
    try {
      const res = await fetch('/api/designs')
      const data = await res.json()
      setDesigns(data)
    } catch (error) {
      console.error('Error fetching designs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDesigns = () => {
    if (!searchQuery) {
      setFilteredDesigns(designs)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = designs.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        d.template?.name.toLowerCase().includes(query)
    )
    setFilteredDesigns(filtered)
  }

  const deleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return

    try {
      await fetch(`/api/designs/${designId}`, {
        method: 'DELETE',
      })
      setDesigns(designs.filter((d) => d.id !== designId))
    } catch (error) {
      console.error('Error deleting design:', error)
    }
  }

  const duplicateDesign = async (design: Design) => {
    try {
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${design.name} (Copy)`,
          width: design.width,
          height: design.height,
          category: design.category,
          tags: design.tags,
          jsonData: {}, // Will be copied from original in backend
        }),
      })

      const newDesign = await res.json()
      setDesigns([newDesign, ...designs])
      router.push(`/design/editor/${newDesign.id}`)
    } catch (error) {
      console.error('Error duplicating design:', error)
    }
  }

  const toggleDesignSelection = (designId: string) => {
    const newSelected = new Set(selectedDesigns)
    if (newSelected.has(designId)) {
      newSelected.delete(designId)
    } else {
      newSelected.add(designId)
    }
    setSelectedDesigns(newSelected)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            My Designs
          </h1>
          <p className="text-gray-600">View and manage all your designs</p>
        </div>

        {/* Toolbar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Link href="/design/templates">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Design
                </Button>
              </Link>
            </div>
          </div>

          {selectedDesigns.size > 0 && (
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">
                {selectedDesigns.size} design{selectedDesigns.size > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`Delete ${selectedDesigns.size} design(s)?`)) {
                    selectedDesigns.forEach((id) => deleteDesign(id))
                    setSelectedDesigns(new Set())
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDesigns(new Set())}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Designs List/Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading designs...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No designs found' : 'No designs yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Start creating amazing designs from templates'}
            </p>
            <Link href="/design/templates">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Design
              </Button>
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDesigns.map((design) => (
              <Card
                key={design.id}
                className={`overflow-hidden hover:shadow-xl transition-all ${
                  selectedDesigns.has(design.id) ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                <div
                  className="w-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center cursor-pointer"
                  style={{ aspectRatio: `${design.width}/${design.height}` }}
                  onClick={() => router.push(`/design/editor/${design.id}`)}
                >
                  {design.thumbnailUrl ? (
                    <img
                      src={design.thumbnailUrl}
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-12 h-12 text-purple-400" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 truncate">{design.name}</h3>
                      <p className="text-sm text-gray-600">
                        {design.width} × {design.height}
                      </p>
                      {design.template && (
                        <p className="text-xs text-gray-500 mt-1">From: {design.template.name}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateDesign(design)
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteDesign(design.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Edited {formatDate(design.lastEditedAt)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDesigns.map((design) => (
              <Card
                key={design.id}
                className={`p-4 hover:shadow-lg transition-shadow ${
                  selectedDesigns.has(design.id) ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedDesigns.has(design.id)}
                    onChange={() => toggleDesignSelection(design.id)}
                    className="w-4 h-4"
                  />
                  <div
                    className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() => router.push(`/design/editor/${design.id}`)}
                  >
                    {design.thumbnailUrl ? (
                      <img
                        src={design.thumbnailUrl}
                        alt={design.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Image className="w-8 h-8 text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{design.name}</h3>
                    <p className="text-sm text-gray-600">
                      {design.width} × {design.height}
                    </p>
                    {design.template && (
                      <p className="text-xs text-gray-500 mt-1">From: {design.template.name}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Edited {formatDate(design.lastEditedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/design/editor/${design.id}`)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => duplicateDesign(design)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDesign(design.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredDesigns.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            Showing {filteredDesigns.length} of {designs.length} designs
          </div>
        )}
      </div>
    </div>
  )
}

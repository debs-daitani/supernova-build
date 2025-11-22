'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Image, File, Search, Trash2, Grid, List, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface DesignAsset {
  id: string
  name: string
  type: string
  fileUrl: string
  thumbnailUrl: string | null
  fileSize: number
  mimeType: string
  width: number | null
  height: number | null
  tags: string[]
  createdAt: string
}

export default function UploadsPage() {
  const [assets, setAssets] = useState<DesignAsset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<DesignAsset[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const assetTypes = [
    { id: 'all', name: 'All Assets' },
    { id: 'IMAGE', name: 'Images' },
    { id: 'ICON', name: 'Icons' },
    { id: 'SHAPE', name: 'Shapes' },
    { id: 'PHOTO', name: 'Photos' },
  ]

  useEffect(() => {
    fetchAssets()
  }, [])

  useEffect(() => {
    filterAssets()
  }, [assets, selectedType, searchQuery])

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/design-assets')
      const data = await res.json()
      setAssets(data)
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAssets = () => {
    let filtered = assets

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((a) => a.type === selectedType)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    setFilteredAssets(filtered)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum file size is 10MB.`)
          continue
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not a valid image file.`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        // Determine asset type
        let assetType = 'IMAGE'
        if (file.name.toLowerCase().includes('icon')) assetType = 'ICON'
        else if (file.name.toLowerCase().includes('shape')) assetType = 'SHAPE'
        else if (file.type.startsWith('image/')) assetType = 'PHOTO'

        formData.append('type', assetType)

        const res = await fetch('/api/design-assets', {
          method: 'POST',
          body: formData,
        })

        const newAsset = await res.json()
        setAssets([newAsset, ...assets])
      }
    } catch (error) {
      console.error('Error uploading assets:', error)
      alert('Failed to upload one or more files. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const deleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return

    try {
      await fetch(`/api/design-assets/${assetId}`, {
        method: 'DELETE',
      })
      setAssets(assets.filter((a) => a.id !== assetId))
    } catch (error) {
      console.error('Error deleting asset:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Upload Library
          </h1>
          <p className="text-gray-600">Upload and manage your design assets</p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8 p-8 border-2 border-dashed border-gray-300 hover:border-pink-400 transition-colors">
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Assets</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to browse (Max 10MB per file)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
            >
              {uploading ? 'Uploading...' : 'Select Files'}
            </Button>
          </div>
        </Card>

        {/* Toolbar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search assets..."
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
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {assetTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? 'default' : 'outline'}
                onClick={() => setSelectedType(type.id)}
                className={
                  selectedType === type.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : ''
                }
              >
                {type.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Assets Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading assets...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || selectedType !== 'all' ? 'No assets found' : 'No assets yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload images, icons, and shapes to use in your designs'}
            </p>
            {(searchQuery || selectedType !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedType('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative group">
                  {asset.thumbnailUrl || asset.fileUrl ? (
                    <img
                      src={asset.thumbnailUrl || asset.fileUrl}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-12 h-12 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteAsset(asset.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate mb-1">{asset.name}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{asset.type}</span>
                    <span>{formatFileSize(asset.fileSize)}</span>
                  </div>
                  {asset.width && asset.height && (
                    <p className="text-xs text-gray-500 mt-1">
                      {asset.width} × {asset.height}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    {asset.thumbnailUrl || asset.fileUrl ? (
                      <img
                        src={asset.thumbnailUrl || asset.fileUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Image className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{asset.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{asset.type}</span>
                      <span>{formatFileSize(asset.fileSize)}</span>
                      {asset.width && asset.height && (
                        <span>{asset.width} × {asset.height}</span>
                      )}
                      <span>Uploaded {formatDate(asset.createdAt)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAsset(asset.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredAssets.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            Showing {filteredAssets.length} of {assets.length} assets
          </div>
        )}
      </div>
    </div>
  )
}

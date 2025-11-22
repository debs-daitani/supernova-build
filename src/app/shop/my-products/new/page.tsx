'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PRODUCT_CATEGORIES } from '@/lib/shop-config'

export default function NewProductPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [productType, setProductType] = useState('DIGITAL')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [fileType, setFileType] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !price || !category) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          category,
          productType,
          tags,
          thumbnail,
          downloadUrl,
          fileSize: fileSize ? parseInt(fileSize) : null,
          fileType,
          isFeatured,
          isActive: true,
        }),
      })

      if (res.ok) {
        router.push('/shop/my-products')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Products
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Create New Product
          </h1>
          <p className="text-gray-600">Fill in the details to list your digital product</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Social Media Marketing Course"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a clear, descriptive name (max 200 characters)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what your product includes, who it's for, and what buyers will learn or receive..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide a detailed description to help buyers understand your product
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price (£) *
                    </label>
                    <Input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="29.99"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a category</option>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Type
                  </label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="DIGITAL">Digital Download</option>
                    <option value="COURSE">Online Course</option>
                    <option value="TEMPLATE">Template</option>
                    <option value="SERVICE">Service</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Media */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Media</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Thumbnail Image URL
                  </label>
                  <Input
                    type="url"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your image to a hosting service and paste the URL here (recommended: 1200x630px)
                  </p>
                  {thumbnail && (
                    <div className="mt-3">
                      <img
                        src={thumbnail}
                        alt="Preview"
                        className="w-full max-w-sm rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* File Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">File Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Download URL
                  </label>
                  <Input
                    type="url"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://your-storage.com/file.pdf"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your file to cloud storage (Dropbox, Google Drive, etc.) and paste the direct download link
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      File Size (bytes)
                    </label>
                    <Input
                      type="number"
                      value={fileSize}
                      onChange={(e) => setFileSize(e.target.value)}
                      placeholder="1048576"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Max 500MB (524,288,000 bytes)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      File Type
                    </label>
                    <Input
                      type="text"
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      placeholder="PDF, ZIP, MP4, etc."
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Tags */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Tags</h2>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Add Tags
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="e.g., marketing, business, beginner"
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add tags to help buyers find your product
                </p>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Settings */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Settings</h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-medium">Featured Product</div>
                    <div className="text-sm text-gray-600">
                      Mark this product as featured to highlight it on the shop homepage
                    </div>
                  </div>
                </label>
              </div>
            </Card>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
              >
                {submitting ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function NewThreadPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/forum/categories')
      const data = await res.json()
      setCategories(data)
      if (data.length > 0) setCategoryId(data[0].id)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (title.length < 10) {
      alert('Title must be at least 10 characters')
      return
    }

    if (content.length < 10) {
      alert('Content must be at least 10 characters')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          categoryId,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })

      const thread = await res.json()
      const category = categories.find((c) => c.id === categoryId)

      router.push(`/community/${category?.slug}/${thread.slug}`)
    } catch (error) {
      console.error('Error creating thread:', error)
      alert('Failed to create thread')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-8">
          Create New Thread
        </h1>

        <Card className="p-8">
          <form onSubmit={handleSubmit}>
            {/* Category */}
            <div className="mb-6">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full mt-2 p-2 border rounded-lg"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="mb-6">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your thread about?"
                className="mt-2"
                required
                minLength={10}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/200 characters (minimum 10)
              </p>
            </div>

            {/* Content */}
            <div className="mb-6">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, questions, or ideas..."
                rows={12}
                className="mt-2"
                required
                minLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                {content.length} characters (minimum 10)
              </p>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="adhd, marketing, strategy (comma separated)"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add tags to help others find your thread
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                {submitting ? 'Creating...' : 'Create Thread'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 mt-6 bg-gradient-to-br from-pink-50 to-purple-50">
          <h3 className="font-bold mb-3">Thread Guidelines</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Choose a clear, descriptive title</li>
            <li>• Provide enough context in your first post</li>
            <li>• Select the appropriate category</li>
            <li>• Use tags to improve discoverability</li>
            <li>• Be respectful and constructive</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

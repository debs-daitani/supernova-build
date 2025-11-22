'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, ArrowLeft } from 'lucide-react'

interface Template {
  id: string
  name: string
  category: string
  description: string
  thumbnail?: string
}

export default function NewWebsitePage() {
  const router = useRouter()
  const [step, setStep] = useState<'details' | 'template'>('details')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleCreate = async () => {
    if (!name || !username) return

    setLoading(true)
    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          templateId: selectedTemplate,
        }),
      })

      if (response.ok) {
        const website = await response.json()
        router.push(`/websites/${website.id}/pages`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create website')
      }
    } catch (error) {
      console.error('Error creating website:', error)
      alert('Failed to create website')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/websites" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Websites
          </Link>
          <h1 className="text-3xl font-bold">Create New Website</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {step === 'details' ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Website Details</CardTitle>
                <CardDescription>
                  Enter basic information about your new website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Website Name</Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Website"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="username">Subdomain</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="username"
                      placeholder="mywebsite"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    />
                    <span className="text-gray-500 text-sm whitespace-nowrap">
                      .daitaniverse.site
                    </span>
                  </div>
                  {username && (
                    <p className="text-xs text-gray-500 mt-1">
                      Your website will be at: <strong>{username}.daitaniverse.site</strong>
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => setStep('template')}
                    disabled={!name || !username}
                    className="flex-1"
                  >
                    Continue to Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
                <p className="text-gray-600">
                  Select a template to get started, or start with a blank canvas
                </p>
              </div>
              <Button variant="outline" onClick={() => setStep('details')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Blank Template */}
              <Card
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedTemplate === null ? 'ring-2 ring-pink-500' : ''
                }`}
                onClick={() => setSelectedTemplate(null)}
              >
                <CardHeader>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardTitle className="text-lg">Blank Template</CardTitle>
                  <CardDescription>Start from scratch</CardDescription>
                </CardHeader>
              </Card>

              {/* Templates */}
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedTemplate === template.id ? 'ring-2 ring-pink-500' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardHeader>
                    <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-4xl">{getCategoryIcon(template.category)}</span>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                onClick={handleCreate}
                disabled={loading || !name || !username}
              >
                {loading ? 'Creating...' : 'Create Website'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'landing-page': '🚀',
    'portfolio': '🎨',
    'business': '💼',
    'blog': '✍️',
    'restaurant': '🍽️',
    'agency': '📱',
    'event': '🎉',
    'ecommerce': '🛍️',
  }
  return icons[category] || '📄'
}

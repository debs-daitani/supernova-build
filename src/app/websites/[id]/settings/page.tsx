'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'

interface Website {
  id: string
  name: string
  domain: string
  subdomain: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  favicon?: string
  logo?: string
  theme?: any
  analyticsCode?: string
  customCSS?: string
  customJS?: string
  robotsTxt?: string
}

export default function WebsiteSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const websiteId = params.id as string

  const [website, setWebsite] = useState<Website | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    favicon: '',
    logo: '',
    analyticsCode: '',
    customCSS: '',
    customJS: '',
    robotsTxt: '',
  })

  useEffect(() => {
    fetchWebsite()
  }, [websiteId])

  const fetchWebsite = async () => {
    try {
      const response = await fetch(`/api/websites/${websiteId}`)
      const data = await response.json()
      setWebsite(data)
      setFormData({
        name: data.name || '',
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        seoKeywords: data.seoKeywords || '',
        favicon: data.favicon || '',
        logo: data.logo || '',
        analyticsCode: data.analyticsCode || '',
        customCSS: data.customCSS || '',
        customJS: data.customJS || '',
        robotsTxt: data.robotsTxt || '',
      })
    } catch (error) {
      console.error('Error fetching website:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Settings saved successfully!')
        fetchWebsite()
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/websites/${websiteId}/pages`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Pages
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Website Settings</h1>
              <p className="text-sm text-gray-600">{website?.subdomain}</p>
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Basic website information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Website Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Domain</Label>
                <Input value={website?.subdomain || ''} disabled />
                <p className="text-xs text-gray-500 mt-1">
                  Your website is published at: https://{website?.subdomain}
                </p>
              </div>

              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  placeholder="https://example.com/favicon.ico"
                  value={formData.favicon}
                  onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>Search engine optimization settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">Site Title</Label>
                <Input
                  id="seoTitle"
                  placeholder="My Awesome Website"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">Site Description</Label>
                <textarea
                  id="seoDescription"
                  className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="A brief description of your website"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="seoKeywords">Keywords (comma-separated)</Label>
                <Input
                  id="seoKeywords"
                  placeholder="web design, portfolio, business"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="robotsTxt">robots.txt</Label>
                <textarea
                  id="robotsTxt"
                  className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
                  placeholder="User-agent: *&#10;Disallow:"
                  value={formData.robotsTxt}
                  onChange={(e) => setFormData({ ...formData, robotsTxt: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Tracking codes and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="analyticsCode">Analytics Code</Label>
                <textarea
                  id="analyticsCode"
                  className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
                  placeholder="<!-- Google Analytics or other tracking code -->"
                  value={formData.analyticsCode}
                  onChange={(e) => setFormData({ ...formData, analyticsCode: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This code will be injected into the &lt;head&gt; of all pages
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Custom Code */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Code</CardTitle>
              <CardDescription>Advanced customization with CSS and JavaScript</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customCSS">Custom CSS</Label>
                <textarea
                  id="customCSS"
                  className="w-full min-h-[150px] rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
                  placeholder=".my-class { color: pink; }"
                  value={formData.customCSS}
                  onChange={(e) => setFormData({ ...formData, customCSS: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="customJS">Custom JavaScript</Label>
                <textarea
                  id="customJS"
                  className="w-full min-h-[150px] rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
                  placeholder="console.log('Hello!');"
                  value={formData.customJS}
                  onChange={(e) => setFormData({ ...formData, customJS: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </main>
    </div>
  )
}

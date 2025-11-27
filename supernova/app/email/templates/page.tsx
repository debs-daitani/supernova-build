'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Plus } from 'lucide-react'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')

  useEffect(() => {
    fetchTemplates()
  }, [category])

  const fetchTemplates = async () => {
    try {
      const url = category === 'all' ? '/api/email/templates' : `/api/email/templates?category=${category}`
      const res = await fetch(url)
      const data = await res.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', 'welcome', 'newsletter', 'promo', 'follow-up', 'announcement']

  if (loading) return <div className="text-white font-josefin">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-white">Email Templates</h2>
          <p className="text-sm text-gray-400 font-josefin">Reusable email templates</p>
        </div>
        <Link
          href="/email/templates/create"
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-black font-bold font-josefin flex items-center gap-2"
        >
          <Plus size={20} />
          Create Template
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg font-josefin transition-all ${
              category === cat
                ? 'bg-hot-pink text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/email/templates/${template.id}`}
            className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl overflow-hidden hover:bg-white/10 transition-all"
          >
            {template.thumbnailUrl ? (
              <img src={template.thumbnailUrl} alt={template.name} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-hot-pink/20 to-light-teal/20 flex items-center justify-center">
                <FileText size={64} className="text-gray-600" />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-supernova text-white mb-1">{template.name}</h3>
              <p className="text-sm text-gray-400 font-josefin capitalize">{template.category}</p>
            </div>
          </Link>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-12 text-center">
          <FileText className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-supernova text-white mb-2">No templates yet</h3>
          <p className="text-gray-400 font-josefin mb-6">Create your first email template</p>
          <Link
            href="/email/templates/create"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-black font-bold font-josefin"
          >
            Create Template
          </Link>
        </div>
      )}
    </div>
  )
}

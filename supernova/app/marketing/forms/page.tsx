'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Eye, Edit, Trash2, BarChart2, Copy, CheckCircle } from 'lucide-react'

interface MarketingForm {
  id: string
  name: string
  description: string | null
  fields: any
  settings: any
  submissionCount: number
  status: string
  createdAt: string
}

export default function FormsPage() {
  const [forms, setForms] = useState<MarketingForm[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/marketing/forms')
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      }
    } catch (error) {
      console.error('Failed to fetch forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return

    try {
      const response = await fetch(`/api/marketing/forms/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setForms(forms.filter((f) => f.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete form:', error)
    }
  }

  const copyEmbedCode = (form: MarketingForm) => {
    const embedCode = `<iframe src="${window.location.origin}/embed/form/${form.id}" width="100%" height="400" frameborder="0"></iframe>`
    navigator.clipboard.writeText(embedCode)
    setCopied(form.id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading forms...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Forms</h2>
          <p className="text-sm text-gray-400 font-josefin">
            Create embeddable forms to capture leads
          </p>
        </div>
        <Link
          href="/marketing/forms/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
        >
          <Plus size={20} />
          Create Form
        </Link>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Plus className="text-purple-400" size={32} />
          </div>
          <h3 className="text-xl font-supernova text-white mb-2">No Forms Yet</h3>
          <p className="text-gray-400 font-josefin mb-4">
            Create your first form to start capturing leads
          </p>
          <Link
            href="/marketing/forms/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 font-josefin hover:bg-purple-500/30 transition-all"
          >
            <Plus size={18} />
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-supernova text-white text-lg">{form.name}</h3>
                  <p className="text-sm text-gray-400 font-josefin line-clamp-2">
                    {form.description || 'No description'}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-josefin ${
                    form.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {form.status}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <BarChart2 size={14} />
                  <span className="font-josefin">{form.submissionCount} submissions</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="font-josefin">
                    {(form.fields as any[])?.length || 0} fields
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-light-teal/10">
                <Link
                  href={`/marketing/forms/${form.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 font-josefin text-sm hover:bg-white/20 transition-all"
                >
                  <Edit size={14} />
                  Edit
                </Link>
                <Link
                  href={`/marketing/forms/${form.id}/submissions`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 font-josefin text-sm hover:bg-white/20 transition-all"
                >
                  <Eye size={14} />
                  View
                </Link>
                <button
                  onClick={() => copyEmbedCode(form)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 font-josefin text-sm hover:bg-white/20 transition-all"
                >
                  {copied === form.id ? (
                    <>
                      <CheckCircle size={14} className="text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Embed
                    </>
                  )}
                </button>
                <button
                  onClick={() => deleteForm(form.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all ml-auto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

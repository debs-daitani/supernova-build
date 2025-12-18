'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Eye, Copy, CheckCircle, Settings, BarChart2 } from 'lucide-react'

interface FormField {
  id: string
  type: string
  label: string
  placeholder: string
  required: boolean
  options?: string[]
}

interface MarketingForm {
  id: string
  name: string
  description: string | null
  fields: FormField[]
  settings: any
  submissionCount: number
  status: string
}

interface FormSubmission {
  id: string
  data: any
  createdAt: string
}

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [form, setForm] = useState<MarketingForm | null>(null)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'builder' | 'submissions' | 'settings'>('builder')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchForm()
    fetchSubmissions()
  }, [id])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/marketing/forms/${id}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data)
      }
    } catch (error) {
      console.error('Failed to fetch form:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/marketing/forms/${id}/submissions`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    }
  }

  const saveForm = async () => {
    if (!form) return

    setSaving(true)
    try {
      const response = await fetch(`/api/marketing/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          fields: form.fields,
          settings: form.settings,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to save')
      }
    } catch (error) {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async () => {
    if (!form) return

    setSaving(true)
    try {
      const newStatus = form.status === 'active' ? 'inactive' : 'active'
      const response = await fetch(`/api/marketing/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setForm({ ...form, status: newStatus })
      }
    } catch (error) {
      alert('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const addField = (type: string) => {
    if (!form) return
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      placeholder: '',
      required: false,
      options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
    }
    setForm({ ...form, fields: [...form.fields, newField] })
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!form) return
    setForm({
      ...form,
      fields: form.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    })
  }

  const removeField = (fieldId: string) => {
    if (!form) return
    setForm({ ...form, fields: form.fields.filter((f) => f.id !== fieldId) })
  }

  const copyEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/form/${id}" width="100%" height="400" frameborder="0"></iframe>`
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading...</div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 font-josefin">Form not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/marketing/forms')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-light-teal" size={24} />
          </button>
          <div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-2xl font-supernova text-light-teal bg-transparent border-none focus:outline-none"
            />
            <p className="text-sm text-gray-400 font-josefin">
              {form.submissionCount} submissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyEmbedCode}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-josefin hover:bg-white/20 transition-all"
          >
            {copied ? (
              <>
                <CheckCircle size={18} className="text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Embed
              </>
            )}
          </button>
          <button
            onClick={saveForm}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-josefin hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            Save
          </button>
          <button
            onClick={toggleStatus}
            disabled={saving}
            className={`px-4 py-2 rounded-lg font-josefin transition-all disabled:opacity-50 ${
              form.status === 'active'
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
            }`}
          >
            {form.status === 'active' ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 rounded-lg font-josefin transition-all ${
            activeTab === 'builder'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Builder
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-josefin transition-all ${
            activeTab === 'submissions'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <BarChart2 size={16} />
          Submissions
          {submissions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-xs">
              {submissions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg font-josefin transition-all ${
            activeTab === 'settings'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Settings size={16} className="inline mr-1" />
          Settings
        </button>
      </div>

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fields Editor */}
          <div className="space-y-4">
            {form.fields.map((field) => (
              <div
                key={field.id}
                className="backdrop-blur-xl bg-white/5 rounded-xl border border-light-teal/20 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-500 cursor-grab" />
                    <span className="text-xs font-josefin text-purple-400 uppercase">
                      {field.type}
                    </span>
                  </div>
                  <button
                    onClick={() => removeField(field.id)}
                    className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-josefin text-gray-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-josefin text-gray-400 mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {field.type === 'select' && (
                  <div>
                    <label className="block text-xs font-josefin text-gray-400 mb-1">
                      Options (one per line)
                    </label>
                    <textarea
                      value={field.options?.join('\n') || ''}
                      onChange={(e) =>
                        updateField(field.id, { options: e.target.value.split('\n') })
                      }
                      rows={3}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="rounded"
                  />
                  <span className="font-josefin">Required field</span>
                </label>
              </div>
            ))}

            {/* Add Field */}
            <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-dashed border-light-teal/20 p-4">
              <p className="text-sm font-josefin text-gray-400 mb-2">Add a field:</p>
              <div className="flex flex-wrap gap-2">
                {['text', 'email', 'phone', 'number', 'textarea', 'select', 'checkbox'].map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => addField(type)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 font-josefin text-sm hover:bg-white/20 transition-all capitalize"
                    >
                      + {type}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="sticky top-6">
            <h4 className="font-supernova text-gray-400 mb-2 text-sm">Preview</h4>
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="font-supernova text-white text-lg mb-4">{form.name}</h3>
                <div className="space-y-4">
                  {form.fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-josefin text-gray-300 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-700 text-white font-josefin focus:outline-none"
                          disabled
                        />
                      ) : field.type === 'select' ? (
                        <select
                          className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-700 text-gray-400 font-josefin focus:outline-none"
                          disabled
                        >
                          <option>{field.placeholder || 'Select...'}</option>
                          {field.options?.map((opt, i) => (
                            <option key={i}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-center gap-2">
                          <input type="checkbox" disabled className="rounded" />
                          <span className="text-gray-400 font-josefin text-sm">
                            {field.placeholder || field.label}
                          </span>
                        </label>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-700 text-white font-josefin focus:outline-none"
                          disabled
                        />
                      )}
                    </div>
                  ))}
                  <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin">
                    {form.settings?.buttonText || 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 font-josefin">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase">
                      Date
                    </th>
                    {form.fields.map((field) => (
                      <th
                        key={field.id}
                        className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase"
                      >
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-teal/10">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-sm font-josefin text-gray-300">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      {form.fields.map((field) => (
                        <td key={field.id} className="px-4 py-3 text-sm font-josefin text-white">
                          {submission.data[field.label] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-xl backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 space-y-4">
          <h3 className="font-supernova text-white">Form Settings</h3>

          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-1">Button Text</label>
            <input
              type="text"
              value={form.settings?.buttonText || ''}
              onChange={(e) =>
                setForm({ ...form, settings: { ...form.settings, buttonText: e.target.value } })
              }
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-1">Success Message</label>
            <textarea
              value={form.settings?.successMessage || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  settings: { ...form.settings, successMessage: e.target.value },
                })
              }
              rows={2}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-1">Redirect URL</label>
            <input
              type="text"
              value={form.settings?.redirectUrl || ''}
              onChange={(e) =>
                setForm({ ...form, settings: { ...form.settings, redirectUrl: e.target.value } })
              }
              placeholder="https://example.com/thank-you"
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}

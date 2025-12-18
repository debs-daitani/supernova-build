'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, GripVertical, Type, Mail, Phone, Hash, AlignLeft, CheckSquare, List } from 'lucide-react'

interface FormField {
  id: string
  type: string
  label: string
  placeholder: string
  required: boolean
  options?: string[]
}

const FIELD_TYPES = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'select', label: 'Dropdown', icon: List },
]

export default function NewFormPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([
    { id: '1', type: 'text', label: 'Name', placeholder: 'Your name', required: true },
    { id: '2', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
  ])
  const [buttonText, setButtonText] = useState('Submit')
  const [successMessage, setSuccessMessage] = useState('Thank you for your submission!')
  const [saving, setSaving] = useState(false)

  const addField = (type: string) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      placeholder: '',
      required: false,
      options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  const createForm = async () => {
    if (!name) {
      alert('Please enter a form name')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/marketing/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          fields,
          settings: {
            buttonText,
            successMessage,
          },
        }),
      })

      if (response.ok) {
        const form = await response.json()
        router.push(`/marketing/forms/${form.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create form')
      }
    } catch (error) {
      alert('Failed to create form')
    } finally {
      setSaving(false)
    }
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
            <h2 className="text-2xl font-supernova text-light-teal">Create Form</h2>
            <p className="text-sm text-gray-400 font-josefin">Build your lead capture form</p>
          </div>
        </div>
        <button
          onClick={createForm}
          disabled={saving || !name}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Form'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Builder */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 space-y-4">
            <h3 className="font-supernova text-white">Form Details</h3>
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Form Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contact Form"
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this form for?"
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Fields */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 space-y-4">
            <h3 className="font-supernova text-white">Form Fields</h3>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 rounded-xl bg-black/30 border border-light-teal/10 space-y-3"
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
            <div className="pt-4 border-t border-light-teal/10">
              <p className="text-sm font-josefin text-gray-400 mb-2">Add a field:</p>
              <div className="flex flex-wrap gap-2">
                {FIELD_TYPES.map((ft) => {
                  const Icon = ft.icon
                  return (
                    <button
                      key={ft.type}
                      onClick={() => addField(ft.type)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 font-josefin text-sm hover:bg-white/20 transition-all"
                    >
                      <Icon size={14} />
                      {ft.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 space-y-4">
            <h3 className="font-supernova text-white">Settings</h3>
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">
                Success Message
              </label>
              <textarea
                value={successMessage}
                onChange={(e) => setSuccessMessage(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="sticky top-6">
          <h4 className="font-supernova text-gray-400 mb-2 text-sm">Preview</h4>
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="font-supernova text-white text-lg mb-4">{name || 'Your Form'}</h3>
              <div className="space-y-4">
                {fields.map((field) => (
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
                  {buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

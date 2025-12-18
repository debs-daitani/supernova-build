'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Zap, Mail, Tag, List, Webhook, Plus, Trash2, ArrowRight } from 'lucide-react'

interface MarketingForm {
  id: string
  name: string
}

const TRIGGER_TYPES = [
  { type: 'form_submitted', label: 'Form Submitted', icon: Zap, description: 'When someone submits a form' },
  { type: 'tag_added', label: 'Tag Added', icon: Tag, description: 'When a tag is added to a contact' },
]

const ACTION_TYPES = [
  { type: 'send_email', label: 'Send Email', icon: Mail, description: 'Send an email to the contact' },
  { type: 'add_to_list', label: 'Add to List', icon: List, description: 'Add contact to an email list' },
  { type: 'add_tag', label: 'Add Tag', icon: Tag, description: 'Add a tag to the contact' },
  { type: 'webhook', label: 'Webhook', icon: Webhook, description: 'Send data to an external URL' },
]

export default function NewAutomationPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState<any>({ type: 'form_submitted' })
  const [actions, setActions] = useState<any[]>([{ type: 'add_tag', tag: '' }])
  const [forms, setForms] = useState<MarketingForm[]>([])
  const [saving, setSaving] = useState(false)

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
    }
  }

  const addAction = () => {
    setActions([...actions, { type: 'add_tag', tag: '' }])
  }

  const updateAction = (index: number, updates: any) => {
    const newActions = [...actions]
    newActions[index] = { ...newActions[index], ...updates }
    setActions(newActions)
  }

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const createAutomation = async () => {
    if (!name) {
      alert('Please enter an automation name')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/marketing/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          trigger,
          actions,
        }),
      })

      if (response.ok) {
        const automation = await response.json()
        router.push(`/marketing/automations/${automation.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create automation')
      }
    } catch (error) {
      alert('Failed to create automation')
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
            onClick={() => router.push('/marketing/automations')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-light-teal" size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-supernova text-light-teal">Create Automation</h2>
            <p className="text-sm text-gray-400 font-josefin">
              Set up automated workflows for your marketing
            </p>
          </div>
        </div>
        <button
          onClick={createAutomation}
          disabled={saving || !name}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Automation'}
        </button>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Name */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="font-supernova text-white mb-4">Automation Name</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New Lead Follow-up"
            className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Trigger */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="font-supernova text-white mb-4 flex items-center gap-2">
            <Zap size={20} className="text-blue-400" />
            When this happens...
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TRIGGER_TYPES.map((t) => {
                const Icon = t.icon
                return (
                  <button
                    key={t.type}
                    onClick={() => setTrigger({ type: t.type })}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      trigger.type === t.type
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-light-teal/20 bg-black/30 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={18} className="text-blue-400" />
                      <span className="font-josefin text-white">{t.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-josefin">{t.description}</p>
                  </button>
                )
              })}
            </div>

            {/* Trigger Configuration */}
            {trigger.type === 'form_submitted' && (
              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Select Form</label>
                <select
                  value={trigger.formId || ''}
                  onChange={(e) => setTrigger({ ...trigger, formId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
                >
                  <option value="">Any form</option>
                  {forms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {trigger.type === 'tag_added' && (
              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Tag Name</label>
                <input
                  type="text"
                  value={trigger.tag || ''}
                  onChange={(e) => setTrigger({ ...trigger, tag: e.target.value })}
                  placeholder="customer"
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowRight size={24} className="text-gray-500 rotate-90" />
        </div>

        {/* Actions */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="font-supernova text-white mb-4 flex items-center gap-2">
            <Zap size={20} className="text-purple-400" />
            Do this...
          </h3>

          <div className="space-y-4">
            {actions.map((action, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-black/30 border border-light-teal/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-josefin text-purple-400">Action {index + 1}</span>
                  {actions.length > 1 && (
                    <button
                      onClick={() => removeAction(index)}
                      className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">
                    Action Type
                  </label>
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(index, { type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
                  >
                    {ACTION_TYPES.map((at) => (
                      <option key={at.type} value={at.type}>
                        {at.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Configuration */}
                {action.type === 'send_email' && (
                  <>
                    <div>
                      <label className="block text-sm font-josefin text-gray-300 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={action.subject || ''}
                        onChange={(e) => updateAction(index, { subject: e.target.value })}
                        placeholder="Welcome to our community!"
                        className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-josefin text-gray-300 mb-1">
                        Message
                      </label>
                      <textarea
                        value={action.message || ''}
                        onChange={(e) => updateAction(index, { message: e.target.value })}
                        placeholder="Hey {{name}}, thanks for signing up!"
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </>
                )}

                {action.type === 'add_to_list' && (
                  <div>
                    <label className="block text-sm font-josefin text-gray-300 mb-1">
                      List Name
                    </label>
                    <input
                      type="text"
                      value={action.listName || ''}
                      onChange={(e) => updateAction(index, { listName: e.target.value })}
                      placeholder="Newsletter Subscribers"
                      className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                {action.type === 'add_tag' && (
                  <div>
                    <label className="block text-sm font-josefin text-gray-300 mb-1">
                      Tag Name
                    </label>
                    <input
                      type="text"
                      value={action.tag || ''}
                      onChange={(e) => updateAction(index, { tag: e.target.value })}
                      placeholder="lead"
                      className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                {action.type === 'webhook' && (
                  <div>
                    <label className="block text-sm font-josefin text-gray-300 mb-1">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={action.url || ''}
                      onChange={(e) => updateAction(index, { url: e.target.value })}
                      placeholder="https://example.com/webhook"
                      className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={addAction}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-gray-300 font-josefin hover:bg-white/20 transition-all"
            >
              <Plus size={18} />
              Add Another Action
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Zap, Mail, Tag, List, Webhook, Plus, Trash2, ArrowRight, Play, Pause } from 'lucide-react'

interface MarketingForm {
  id: string
  name: string
}

interface Automation {
  id: string
  name: string
  trigger: any
  actions: any[]
  status: string
  runCount: number
}

const ACTION_TYPES = [
  { type: 'send_email', label: 'Send Email', icon: Mail },
  { type: 'add_to_list', label: 'Add to List', icon: List },
  { type: 'add_tag', label: 'Add Tag', icon: Tag },
  { type: 'webhook', label: 'Webhook', icon: Webhook },
]

export default function EditAutomationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [automation, setAutomation] = useState<Automation | null>(null)
  const [forms, setForms] = useState<MarketingForm[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAutomation()
    fetchForms()
  }, [id])

  const fetchAutomation = async () => {
    try {
      const response = await fetch(`/api/marketing/automations/${id}`)
      if (response.ok) {
        const data = await response.json()
        setAutomation(data)
      }
    } catch (error) {
      console.error('Failed to fetch automation:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const saveAutomation = async () => {
    if (!automation) return

    setSaving(true)
    try {
      const response = await fetch(`/api/marketing/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: automation.name,
          trigger: automation.trigger,
          actions: automation.actions,
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
    if (!automation) return

    setSaving(true)
    try {
      const newStatus = automation.status === 'active' ? 'paused' : 'active'
      const response = await fetch(`/api/marketing/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setAutomation({ ...automation, status: newStatus })
      }
    } catch (error) {
      alert('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const addAction = () => {
    if (!automation) return
    setAutomation({
      ...automation,
      actions: [...automation.actions, { type: 'add_tag', tag: '' }],
    })
  }

  const updateAction = (index: number, updates: any) => {
    if (!automation) return
    const newActions = [...automation.actions]
    newActions[index] = { ...newActions[index], ...updates }
    setAutomation({ ...automation, actions: newActions })
  }

  const removeAction = (index: number) => {
    if (!automation) return
    setAutomation({
      ...automation,
      actions: automation.actions.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading...</div>
      </div>
    )
  }

  if (!automation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 font-josefin">Automation not found</p>
      </div>
    )
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
            <input
              type="text"
              value={automation.name}
              onChange={(e) => setAutomation({ ...automation, name: e.target.value })}
              className="text-2xl font-supernova text-light-teal bg-transparent border-none focus:outline-none"
            />
            <p className="text-sm text-gray-400 font-josefin">
              Run {automation.runCount} times
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveAutomation}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-josefin hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            Save
          </button>
          <button
            onClick={toggleStatus}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-josefin transition-all disabled:opacity-50 ${
              automation.status === 'active'
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
            }`}
          >
            {automation.status === 'active' ? (
              <>
                <Pause size={18} />
                Active
              </>
            ) : (
              <>
                <Play size={18} />
                Paused
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Trigger */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="font-supernova text-white mb-4 flex items-center gap-2">
            <Zap size={20} className="text-blue-400" />
            When this happens...
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Trigger Type</label>
              <select
                value={automation.trigger?.type || 'form_submitted'}
                onChange={(e) =>
                  setAutomation({ ...automation, trigger: { type: e.target.value } })
                }
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              >
                <option value="form_submitted">Form Submitted</option>
                <option value="tag_added">Tag Added</option>
              </select>
            </div>

            {automation.trigger?.type === 'form_submitted' && (
              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Select Form</label>
                <select
                  value={automation.trigger?.formId || ''}
                  onChange={(e) =>
                    setAutomation({
                      ...automation,
                      trigger: { ...automation.trigger, formId: e.target.value },
                    })
                  }
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

            {automation.trigger?.type === 'tag_added' && (
              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Tag Name</label>
                <input
                  type="text"
                  value={automation.trigger?.tag || ''}
                  onChange={(e) =>
                    setAutomation({
                      ...automation,
                      trigger: { ...automation.trigger, tag: e.target.value },
                    })
                  }
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
            {automation.actions.map((action, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-black/30 border border-light-teal/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-josefin text-purple-400">Action {index + 1}</span>
                  {automation.actions.length > 1 && (
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
                        placeholder="Welcome!"
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
                        placeholder="Hey {{name}}..."
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
                      placeholder="Newsletter"
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
                      placeholder="https://..."
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

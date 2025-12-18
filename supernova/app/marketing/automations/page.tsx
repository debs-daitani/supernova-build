'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Play, Pause, Edit, Trash2, Zap, ArrowRight } from 'lucide-react'

interface Automation {
  id: string
  name: string
  trigger: any
  actions: any[]
  status: string
  runCount: number
  createdAt: string
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAutomations()
  }, [])

  const fetchAutomations = async () => {
    try {
      const response = await fetch('/api/marketing/automations')
      if (response.ok) {
        const data = await response.json()
        setAutomations(data)
      }
    } catch (error) {
      console.error('Failed to fetch automations:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (automation: Automation) => {
    const newStatus = automation.status === 'active' ? 'paused' : 'active'
    try {
      const response = await fetch(`/api/marketing/automations/${automation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setAutomations(
          automations.map((a) => (a.id === automation.id ? { ...a, status: newStatus } : a))
        )
      }
    } catch (error) {
      console.error('Failed to toggle status:', error)
    }
  }

  const deleteAutomation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return

    try {
      const response = await fetch(`/api/marketing/automations/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setAutomations(automations.filter((a) => a.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete automation:', error)
    }
  }

  const getTriggerLabel = (trigger: any) => {
    switch (trigger?.type) {
      case 'form_submitted':
        return 'Form Submitted'
      case 'tag_added':
        return `Tag Added: ${trigger.tag}`
      case 'page_visited':
        return 'Page Visited'
      default:
        return trigger?.type || 'Unknown'
    }
  }

  const getActionLabels = (actions: any[]) => {
    return actions
      .map((action) => {
        switch (action.type) {
          case 'send_email':
            return 'Send Email'
          case 'add_to_list':
            return 'Add to List'
          case 'add_tag':
            return `Add Tag: ${action.tag}`
          case 'webhook':
            return 'Webhook'
          default:
            return action.type
        }
      })
      .join(', ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading automations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Automations</h2>
          <p className="text-sm text-gray-400 font-josefin">
            Create automated workflows triggered by user actions
          </p>
        </div>
        <Link
          href="/marketing/automations/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
        >
          <Plus size={20} />
          Create Automation
        </Link>
      </div>

      {/* Automations List */}
      {automations.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Zap className="text-purple-400" size={32} />
          </div>
          <h3 className="text-xl font-supernova text-white mb-2">No Automations Yet</h3>
          <p className="text-gray-400 font-josefin mb-4">
            Create your first automation to automate your marketing
          </p>
          <Link
            href="/marketing/automations/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 font-josefin hover:bg-purple-500/30 transition-all"
          >
            <Plus size={18} />
            Create Your First Automation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {automations.map((automation) => (
            <div
              key={automation.id}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-supernova text-white text-lg">{automation.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-josefin ${
                        automation.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {automation.status}
                    </span>
                  </div>

                  {/* Workflow Visualization */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                      <Zap size={14} />
                      <span className="font-josefin">{getTriggerLabel(automation.trigger)}</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-500" />
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                      <span className="font-josefin">{getActionLabels(automation.actions)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 font-josefin mt-2">
                    Run {automation.runCount} times
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(automation)}
                    className={`p-2 rounded-lg transition-all ${
                      automation.status === 'active'
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                  >
                    {automation.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <Link
                    href={`/marketing/automations/${automation.id}`}
                    className="p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => deleteAutomation(automation.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

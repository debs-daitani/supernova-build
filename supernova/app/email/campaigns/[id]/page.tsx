'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Eye, MousePointer, UserX, AlertCircle, Save, Edit } from 'lucide-react'
import Link from 'next/link'

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [htmlMode, setHtmlMode] = useState(false)

  useEffect(() => {
    fetchCampaign()
    fetchSubscriberCount()
  }, [params.id])

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/email/campaigns/${params.id}`)
      const data = await res.json()
      setCampaign(data)
      setEditing(data.status === 'DRAFT' || data.status === 'draft')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriberCount = async () => {
    try {
      const response = await fetch('/api/email/subscribers')
      if (response.ok) {
        const data = await response.json()
        setSubscriberCount(data.filter((s: any) => s.status === 'active').length)
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
    }
  }

  const saveDraft = async () => {
    if (!campaign) return
    setSaving(true)
    try {
      const response = await fetch(`/api/email/campaigns/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaign.name,
          subject: campaign.subject,
          content: campaign.htmlContent || campaign.content,
        }),
      })
      if (response.ok) {
        alert('Draft saved!')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async () => {
    if (subscriberCount === 0) {
      alert('No active subscribers! Go to Email → Subscribers and click "Sync from CRM"')
      return
    }
    if (!confirm(`Send this campaign to ${subscriberCount} subscribers?`)) return
    setSending(true)
    try {
      const response = await fetch(`/api/email/campaigns/${params.id}/send`, { method: 'POST' })
      if (response.ok) {
        alert('Campaign sent successfully!')
        // Refresh the campaign data to show updated stats
        await fetchCampaign()
        setEditing(false)
      } else {
        alert('Failed to send campaign')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to send campaign')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="text-white font-josefin">Loading...</div>
  if (!campaign) return <div className="text-white font-josefin">Campaign not found</div>

  const stats = [
    { icon: Send, label: 'Sent', value: campaign.sentCount, color: 'text-blue-400' },
    { icon: Eye, label: 'Opened', value: campaign.openedCount, percent: campaign.sentCount ? ((campaign.openedCount / campaign.sentCount) * 100).toFixed(1) : 0, color: 'text-green-400' },
    { icon: MousePointer, label: 'Clicked', value: campaign.clickedCount, percent: campaign.sentCount ? ((campaign.clickedCount / campaign.sentCount) * 100).toFixed(1) : 0, color: 'text-purple-400' },
    { icon: AlertCircle, label: 'Bounced', value: campaign.bouncedCount, color: 'text-yellow-400' },
    { icon: UserX, label: 'Unsubscribed', value: campaign.unsubscribedCount, color: 'text-red-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/email/campaigns" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-supernova text-white">{campaign.name}</h2>
            <p className="text-sm text-gray-400 font-josefin">
              {editing ? `Ready to send to ${subscriberCount} subscribers` : campaign.subject}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-josefin ${
            campaign.status === 'SENT' || campaign.status === 'sent' ? 'bg-green-500/10 text-green-400' :
            campaign.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-400' :
            campaign.status === 'DRAFT' || campaign.status === 'draft' ? 'bg-gray-500/10 text-gray-400' :
            'bg-yellow-500/10 text-yellow-400'
          }`}>
            {campaign.status}
          </span>
        </div>
        {editing && (
          <div className="flex items-center gap-2">
            <button
              onClick={saveDraft}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-white/10 text-white font-josefin hover:bg-white/20 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSend}
              disabled={sending || subscriberCount === 0}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-black font-bold font-josefin disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Now'}
            </button>
          </div>
        )}
      </div>

      {subscriberCount === 0 && editing && (
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <p className="text-red-400 font-josefin">
            ⚠️ No active subscribers! Go to{' '}
            <Link href="/email/subscribers" className="underline font-semibold">
              Email → Subscribers
            </Link>{' '}
            and click "Sync from CRM" to add your contacts.
          </p>
        </div>
      )}

      {(campaign.status === 'SENT' || campaign.status === 'sent') && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-4">
                <Icon className={`${stat.color} mb-2`} size={24} />
                <div className="text-2xl font-supernova text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 font-josefin">{stat.label}</div>
                {stat.percent && (
                  <div className="text-xs text-gray-500 font-josefin mt-1">{stat.percent}%</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {editing ? (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-supernova text-hot-pink mb-4">Edit Campaign</h3>
            <div>
              <label className="block text-sm font-josefin text-gray-400 mb-1">Campaign Name</label>
              <input
                type="text"
                value={campaign.name}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-josefin text-gray-400 mb-1">Subject Line</label>
              <input
                type="text"
                value={campaign.subject}
                onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-josefin text-gray-400">Email Content</label>
                <button
                  type="button"
                  onClick={() => setHtmlMode(!htmlMode)}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-josefin hover:bg-purple-500/30 transition-all"
                >
                  <Edit size={14} />
                  {htmlMode ? 'Switch to Visual' : 'Switch to HTML'}
                </button>
              </div>
              {htmlMode ? (
                <textarea
                  value={campaign.htmlContent || campaign.content || ''}
                  onChange={(e) => setCampaign({ ...campaign, htmlContent: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500 font-mono text-sm"
                  placeholder="Write your HTML content here..."
                />
              ) : (
                <div className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300">
                  <div
                    contentEditable
                    onInput={(e) => setCampaign({ ...campaign, htmlContent: e.currentTarget.innerHTML })}
                    dangerouslySetInnerHTML={{ __html: campaign.htmlContent || campaign.content || '<p class="text-gray-400">Start typing your email content...</p>' }}
                    className="min-h-[300px] focus:outline-none text-gray-900"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
            <h3 className="text-xl font-supernova text-hot-pink mb-4">Preview</h3>
            <div className="bg-white rounded-lg p-6 max-h-96 overflow-y-auto">
              <div className="border-b border-gray-300 pb-4 mb-4">
                <p className="text-sm text-gray-600 font-josefin">Subject: {campaign.subject || 'No subject'}</p>
              </div>
              <div dangerouslySetInnerHTML={{ __html: campaign.htmlContent || campaign.content || '<p class="text-gray-400">No content yet...</p>' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
            <h3 className="text-xl font-supernova text-hot-pink mb-4">Campaign Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-josefin text-gray-400 mb-1">From</label>
                <p className="text-white font-josefin">{campaign.fromName} &lt;{campaign.fromEmail}&gt;</p>
              </div>
              <div>
                <label className="block text-sm font-josefin text-gray-400 mb-1">Subject</label>
                <p className="text-white font-josefin">{campaign.subject}</p>
              </div>
              {campaign.previewText && (
                <div>
                  <label className="block text-sm font-josefin text-gray-400 mb-1">Preview Text</label>
                  <p className="text-white font-josefin">{campaign.previewText}</p>
                </div>
              )}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
            <h3 className="text-xl font-supernova text-hot-pink mb-4">Preview</h3>
            <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: campaign.htmlContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Eye, MousePointer, UserX, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchCampaign()
  }, [params.id])

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/email/campaigns/${params.id}`)
      const data = await res.json()
      setCampaign(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!confirm('Send this campaign now?')) return
    setSending(true)
    try {
      await fetch(`/api/email/campaigns/${params.id}/send`, { method: 'POST' })
      fetchCampaign()
    } catch (error) {
      console.error('Error:', error)
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
            <p className="text-sm text-gray-400 font-josefin">{campaign.subject}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-josefin ${
            campaign.status === 'SENT' ? 'bg-green-500/10 text-green-400' :
            campaign.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-400' :
            campaign.status === 'DRAFT' ? 'bg-gray-500/10 text-gray-400' :
            'bg-yellow-500/10 text-yellow-400'
          }`}>
            {campaign.status}
          </span>
        </div>
        {campaign.status === 'DRAFT' && (
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-black font-bold font-josefin disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Now'}
          </button>
        )}
      </div>

      {campaign.status === 'SENT' && (
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
    </div>
  )
}

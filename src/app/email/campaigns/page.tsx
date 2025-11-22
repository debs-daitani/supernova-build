'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Plus, Send, Calendar, BarChart3, Edit } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  totalRecipients: number
  sentCount: number
  openedCount: number
  clickedCount: number
  sentAt: string | null
  scheduledFor: string | null
  createdAt: string
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  SENDING: { label: 'Sending', color: 'bg-yellow-100 text-yellow-800' },
  SENT: { label: 'Sent', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-800' },
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchCampaigns()
  }, [filter])

  const fetchCampaigns = async () => {
    try {
      const params = new URLSearchParams()
      if (filter) params.append('status', filter)

      const response = await fetch(`/api/email/campaigns?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOpenRate = (campaign: Campaign) => {
    if (campaign.totalRecipients === 0) return 0
    return Math.round((campaign.openedCount / campaign.totalRecipients) * 100)
  }

  const getClickRate = (campaign: Campaign) => {
    if (campaign.totalRecipients === 0) return 0
    return Math.round((campaign.clickedCount / campaign.totalRecipients) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
                <Send className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Email Campaigns</h1>
                <p className="text-gray-600">Create and manage your email campaigns</p>
              </div>
            </div>

            <Link
              href="/email/campaigns/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === ''
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Campaigns
            </button>
            <button
              onClick={() => setFilter('DRAFT')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'DRAFT'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setFilter('SCHEDULED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'SCHEDULED'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setFilter('SENT')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'SENT'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Sent
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading campaigns...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && campaigns.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-12 text-center">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first email campaign to start engaging with your subscribers.
            </p>
            <Link
              href="/email/campaigns/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Campaign
            </Link>
          </div>
        )}

        {/* Campaigns Grid */}
        {!loading && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const openRate = getOpenRate(campaign)
              const clickRate = getClickRate(campaign)

              return (
                <div
                  key={campaign.id}
                  className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:border-purple-400 hover:shadow-lg transition-all"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG]?.color ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG]?.label ||
                        campaign.status}
                    </span>

                    {campaign.status === 'DRAFT' && (
                      <Link
                        href={`/email/campaigns/${campaign.id}/edit`}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                    )}
                  </div>

                  {/* Campaign Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {campaign.name}
                  </h3>

                  {/* Subject */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.subject}</p>

                  {/* Stats */}
                  {campaign.status === 'SENT' && (
                    <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-200">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{campaign.sentCount}</div>
                        <div className="text-xs text-gray-500">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{openRate}%</div>
                        <div className="text-xs text-gray-500">Opened</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">{clickRate}%</div>
                        <div className="text-xs text-gray-500">Clicked</div>
                      </div>
                    </div>
                  )}

                  {campaign.status === 'SCHEDULED' && campaign.scheduledFor && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                      <Calendar className="w-4 h-4" />
                      Scheduled for {new Date(campaign.scheduledFor).toLocaleString()}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {campaign.status === 'SENT' && (
                      <Link
                        href={`/email/campaigns/${campaign.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors text-sm"
                      >
                        <BarChart3 className="w-4 h-4" />
                        View Analytics
                      </Link>
                    )}

                    {campaign.status === 'DRAFT' && (
                      <Link
                        href={`/email/campaigns/${campaign.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Continue Editing
                      </Link>
                    )}
                  </div>

                  {/* Date */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    {campaign.sentAt
                      ? `Sent ${new Date(campaign.sentAt).toLocaleDateString()}`
                      : `Created ${new Date(campaign.createdAt).toLocaleDateString()}`}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

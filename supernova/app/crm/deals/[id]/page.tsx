'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, DollarSign, Calendar, TrendingUp, User, Building } from 'lucide-react'

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [deal, setDeal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('activities')

  useEffect(() => {
    fetchDeal()
  }, [params.id])

  const fetchDeal = async () => {
    try {
      const response = await fetch(`/api/crm/deals/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setDeal(data)
      }
    } catch (error) {
      console.error('Failed to fetch deal:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading...</div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 font-josefin">Deal not found</p>
      </div>
    )
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      LEAD: 'neon-lime',
      QUALIFIED: 'light-teal',
      PROPOSAL: 'blue-400',
      NEGOTIATION: 'purple-400',
      WON: 'green-400',
      LOST: 'red-400',
    }
    return colors[stage] || 'gray-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/crm/deals')}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-light-teal" size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-supernova text-light-teal">{deal.title}</h2>
          <span className={`text-${getStageColor(deal.stage)} font-josefin`}>{deal.stage}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <h3 className="text-lg font-supernova text-light-teal mb-4">Deal Information</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 font-josefin mb-1">Value</div>
                <div className="flex items-center gap-2">
                  <DollarSign className="text-hot-pink" size={20} />
                  <span className="text-2xl font-supernova text-hot-pink">
                    {deal.value.toLocaleString()} {deal.currency}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 font-josefin mb-1">Probability</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-hot-pink to-light-teal"
                      style={{ width: `${deal.probability}%` }}
                    />
                  </div>
                  <span className="text-white font-josefin font-semibold">{deal.probability}%</span>
                </div>
              </div>

              {deal.expectedCloseDate && (
                <div>
                  <div className="text-sm text-gray-400 font-josefin mb-1">Expected Close</div>
                  <div className="flex items-center gap-2 text-gray-300 font-josefin">
                    <Calendar size={18} className="text-light-teal" />
                    {new Date(deal.expectedCloseDate).toLocaleDateString()}
                  </div>
                </div>
              )}

              {deal.assignedTo && (
                <div>
                  <div className="text-sm text-gray-400 font-josefin mb-1">Assigned To</div>
                  <div className="flex items-center gap-2 text-gray-300 font-josefin">
                    <User size={18} className="text-light-teal" />
                    {deal.assignedTo.name}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <div className="text-sm text-gray-400 font-josefin mb-1">Stage</div>
                <select
                  value={deal.stage}
                  onChange={async (e) => {
                    const response = await fetch(`/api/crm/deals/${deal.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ stage: e.target.value }),
                    })
                    if (response.ok) {
                      fetchDeal()
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                >
                  <option value="LEAD">Lead</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <h3 className="text-lg font-supernova text-light-teal mb-4">Contact</h3>
            <div
              className="p-4 rounded-lg bg-black/50 hover:bg-black/70 cursor-pointer transition-colors"
              onClick={() => router.push(`/crm/contacts/${deal.contact.id}`)}
            >
              <div className="font-josefin text-white mb-2">{deal.contact.name}</div>
              <div className="text-sm text-gray-400 font-josefin">{deal.contact.email}</div>
              {deal.contact.company && (
                <div className="flex items-center gap-2 text-gray-400 font-josefin text-sm mt-2">
                  <Building size={14} />
                  {deal.contact.company}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {['activities', 'tasks', 'notes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-3 font-josefin capitalize ${
                    activeTab === tab
                      ? 'bg-light-teal/10 text-light-teal border-b-2 border-light-teal'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'activities' && (
                <div className="space-y-4">
                  <button className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-light-teal/30 text-light-teal hover:bg-light-teal/10 font-josefin transition-all">
                    + Add Activity
                  </button>
                  {deal.activities.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="p-4 rounded-lg bg-black/50 border border-white/10"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-josefin font-semibold text-white">
                          {activity.subject}
                        </span>
                        <span className="text-xs text-gray-400 font-josefin">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-gray-300 font-josefin text-sm">{activity.description}</p>
                      )}
                      <span className="inline-block mt-2 px-2 py-1 rounded bg-light-teal/20 text-light-teal text-xs font-josefin">
                        {activity.type}
                      </span>
                    </div>
                  ))}
                  {deal.activities.length === 0 && (
                    <p className="text-gray-500 font-josefin text-sm text-center py-8">
                      No activities yet
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <button className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-light-teal/30 text-light-teal hover:bg-light-teal/10 font-josefin transition-all">
                    + Add Task
                  </button>
                  {deal.tasks.map((task: any) => (
                    <div key={task.id} className="p-4 rounded-lg bg-black/50 border border-white/10">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.status === 'COMPLETED'}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-josefin text-white">{task.title}</div>
                          {task.dueDate && (
                            <div className="text-xs text-gray-400 font-josefin mt-1">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-josefin bg-blue-500/20 text-blue-400">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                  {deal.tasks.length === 0 && (
                    <p className="text-gray-500 font-josefin text-sm text-center py-8">
                      No tasks yet
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <div className="mb-4">
                    <textarea
                      placeholder="Add notes about this deal..."
                      defaultValue={deal.notes || ''}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-light-teal/20 text-white placeholder-gray-500 font-josefin focus:outline-none focus:border-light-teal"
                      rows={6}
                    />
                    <button className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,142,0.5)] transition-all">
                      Save Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

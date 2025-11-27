'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Building, MapPin, Calendar, Plus } from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  location?: string
  status: string
  source: string
  tags: string[]
  deals: any[]
  activities: any[]
  tasks: any[]
  createdAt: string
}

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('activities')

  useEffect(() => {
    fetchContact()
  }, [params.id])

  const fetchContact = async () => {
    try {
      const response = await fetch(`/api/crm/contacts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setContact(data)
      }
    } catch (error) {
      console.error('Failed to fetch contact:', error)
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

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 font-josefin">Contact not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/crm/contacts')}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-light-teal" size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-supernova text-light-teal">{contact.name}</h2>
          <p className="text-sm text-gray-400 font-josefin">{contact.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <h3 className="text-lg font-supernova text-light-teal mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300 font-josefin">
                <Mail size={18} className="text-light-teal" />
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-3 text-gray-300 font-josefin">
                  <Phone size={18} className="text-light-teal" />
                  <a href={`tel:${contact.phone}`} className="hover:text-white">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-3 text-gray-300 font-josefin">
                  <Building size={18} className="text-light-teal" />
                  <span>{contact.company}</span>
                </div>
              )}
              {contact.location && (
                <div className="flex items-center gap-3 text-gray-300 font-josefin">
                  <MapPin size={18} className="text-light-teal" />
                  <span>{contact.location}</span>
                </div>
              )}
              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                  {contact.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-light-teal/20 text-light-teal font-josefin text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Deals Summary */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-supernova text-light-teal">Deals</h3>
              <button className="text-hot-pink hover:text-hot-pink/80 font-josefin text-sm">
                + New Deal
              </button>
            </div>
            <div className="space-y-3">
              {contact.deals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-3 rounded-lg bg-black/50 border border-light-teal/10 hover:border-light-teal/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/crm/deals/${deal.id}`)}
                >
                  <div className="font-josefin text-white">{deal.title}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-hot-pink font-semibold font-josefin">
                      ${deal.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 font-josefin">{deal.stage}</span>
                  </div>
                </div>
              ))}
              {contact.deals.length === 0 && (
                <p className="text-gray-500 font-josefin text-sm">No deals yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {['activities', 'tasks'].map((tab) => (
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
                    + Add Note
                  </button>
                  {contact.activities.map((activity) => (
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
                  {contact.activities.length === 0 && (
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
                  {contact.tasks.map((task) => (
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
                        <span
                          className={`px-2 py-1 rounded text-xs font-josefin ${
                            task.priority === 'URGENT'
                              ? 'bg-red-500/20 text-red-400'
                              : task.priority === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                  {contact.tasks.length === 0 && (
                    <p className="text-gray-500 font-josefin text-sm text-center py-8">
                      No tasks yet
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

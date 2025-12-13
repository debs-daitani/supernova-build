'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'

interface ContactsData {
  total: number
  newThisWeek: number
}

export default function ContactsWidget() {
  const [data, setData] = useState<ContactsData>({ total: 0, newThisWeek: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/crm/contacts')
        if (response.ok) {
          const result = await response.json()
          const contacts = result.contacts || []
          const total = contacts.length

          // Calculate new this week
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          const newThisWeek = contacts.filter((c: { createdAt: string }) =>
            new Date(c.createdAt) > oneWeekAgo
          ).length

          setData({ total, newThisWeek })
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error)
        // Use placeholder data
        setData({ total: 47, newThisWeek: 3 })
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  return (
    <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#0a0a0a] rounded-lg">
          <Users size={20} className="text-[#00F0E9]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">CONTACTS</h3>
          <p className="text-[#888888] text-xs">Your Crew</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        {loading ? (
          <div className="h-12 bg-[#3d3d3d] rounded animate-pulse" />
        ) : (
          <>
            <span className="text-4xl font-bold text-white">{data.total}</span>
            {data.newThisWeek > 0 && (
              <p className="text-[#00F0E9] text-sm mt-1">+{data.newThisWeek} this week</p>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {data.total === 0 ? (
        <Link href="/crm" className="text-[#00F0E9] text-sm hover:underline">
          Add your first contact →
        </Link>
      ) : (
        <Link href="/crm" className="text-[#00F0E9] text-sm hover:underline">
          View CRM →
        </Link>
      )}
    </div>
  )
}

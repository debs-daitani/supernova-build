'use client'

import { Activity, Users, Mail, BarChart3, PoundSterling } from 'lucide-react'

interface ActivityItem {
  type: 'contact' | 'email' | 'quiz' | 'payment'
  text: string
  time: string
}

const mockActivity: ActivityItem[] = [
  { type: 'contact', text: 'New contact: Jane Smith', time: '2 hours ago' },
  { type: 'email', text: 'Campaign "Welcome Series" sent', time: 'Yesterday' },
  { type: 'quiz', text: 'Quiz completed: 3 new leads', time: '2 days ago' },
  { type: 'payment', text: 'Payment received: £97', time: '3 days ago' },
  { type: 'contact', text: 'Deal won: Project Alpha', time: '4 days ago' },
]

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'contact':
      return <Users size={16} className="text-[#00F0E9]" />
    case 'email':
      return <Mail size={16} className="text-[#FF008E]" />
    case 'quiz':
      return <BarChart3 size={16} className="text-[#D3FF2C]" />
    case 'payment':
      return <PoundSterling size={16} className="text-[#00A29D]" />
  }
}

export default function ActivityWidget() {
  return (
    <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-xl p-6 col-span-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#0a0a0a] rounded-lg">
          <Activity size={20} className="text-[#FF008E]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">RECENT ACTIVITY</h3>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 mb-4">
        {mockActivity.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#3d3d3d] transition-colors"
          >
            <div className="p-1.5 bg-[#1a1a1a] rounded">
              {getActivityIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{item.text}</p>
            </div>
            <span className="text-[#888888] text-xs whitespace-nowrap">{item.time}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <button className="text-[#00F0E9] text-sm hover:underline">
        View All Activity →
      </button>
    </div>
  )
}

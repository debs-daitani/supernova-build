'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, UserPlus, Mail, BarChart3, Mic, Guitar, ExternalLink } from 'lucide-react'
import VoiceRecorder from '@/components/VoiceRecorder'

interface QuickActionsWidgetProps {
  userId?: string
}

export default function QuickActionsWidget({ userId }: QuickActionsWidgetProps) {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)

  const handleTranscriptionComplete = (transcription: string) => {
    console.log('Transcription:', transcription)
    setShowVoiceRecorder(false)
    // TODO: Navigate to chat with transcription or save memo
  }

  const actions = [
    {
      icon: <UserPlus size={18} />,
      label: '+ New Contact',
      href: '/crm',
      external: false,
    },
    {
      icon: <Mail size={18} />,
      label: '+ New Campaign',
      href: '/email/campaigns/create',
      external: false,
    },
    {
      icon: <BarChart3 size={18} />,
      label: '+ New Quiz',
      href: '/admin/quiz/create',
      external: false,
    },
  ]

  return (
    <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#0a0a0a] rounded-lg">
          <Zap size={20} className="text-[#D3FF2C]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">QUICK ACTIONS</h3>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 w-full p-3 bg-[#0a0a0a] border border-[#3d3d3d] rounded-lg text-white text-sm hover:border-[#00F0E9] transition-colors"
          >
            {action.icon}
            <span>{action.label}</span>
          </Link>
        ))}

        {/* Voice Memo Button */}
        <button
          onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
          className="flex items-center gap-3 w-full p-3 bg-[#0a0a0a] border border-[#3d3d3d] rounded-lg text-white text-sm hover:border-[#00F0E9] transition-colors"
        >
          <Mic size={18} />
          <span>Record Voice Memo</span>
        </button>

        {/* Voice Recorder */}
        {showVoiceRecorder && userId && (
          <div className="p-3 bg-[#0a0a0a] border border-[#00F0E9] rounded-lg">
            <VoiceRecorder
              userId={userId}
              conversationId={null}
              onTranscriptionComplete={handleTranscriptionComplete}
            />
          </div>
        )}

        {/* VENUED Button */}
        <a
          href="https://venued.wtf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 w-full p-3 bg-gradient-to-r from-[#FF008E]/20 to-[#00F0E9]/20 border border-[#3d3d3d] rounded-lg text-white text-sm hover:border-[#00F0E9] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Guitar size={18} />
            <span>Open VENUED</span>
          </div>
          <ExternalLink size={14} className="text-[#888888]" />
        </a>
      </div>
    </div>
  )
}

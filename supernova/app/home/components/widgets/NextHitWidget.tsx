'use client'

import { Target, ExternalLink } from 'lucide-react'

interface NextHitWidgetProps {
  task?: {
    title: string
    source: string
  }
}

export default function NextHitWidget({ task }: NextHitWidgetProps) {
  const defaultTask = {
    title: 'Follow up with Jane about the proposal',
    source: 'CRM',
  }

  const currentTask = task || defaultTask

  const handleDoThis = () => {
    // TODO: Mark task as in progress and open relevant page
    console.log('Starting task:', currentTask.title)
  }

  const handleSkip = () => {
    // TODO: Skip task and show next one
    console.log('Skipping task:', currentTask.title)
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-xl p-6 col-span-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#0a0a0a] rounded-lg">
          <Target size={20} className="text-[#D3FF2C]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">YOUR NEXT BIG HIT</h3>
          <p className="text-[#888888] text-xs">Based on your energy level</p>
        </div>
      </div>

      {/* Task Card */}
      {currentTask ? (
        <div className="bg-[#0a0a0a] border border-[#3d3d3d] rounded-lg p-5 mb-4">
          <p className="text-white text-lg mb-4">{currentTask.title}</p>
          <div className="flex gap-3">
            <button
              onClick={handleDoThis}
              className="px-6 py-2.5 bg-gradient-to-r from-[#FF008E] to-[#C9005C] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Do This Now
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-2.5 border border-[#3d3d3d] text-white font-semibold rounded-lg hover:bg-[#3d3d3d] transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-[#3d3d3d] rounded-lg p-5 mb-4 text-center">
          <p className="text-[#888888]">No urgent tasks! Time to create something new. 🤘</p>
        </div>
      )}

      {/* Footer */}
      <a
        href="https://venued.wtf"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[#00F0E9] text-sm hover:underline"
      >
        Open VENUED <ExternalLink size={14} />
      </a>
    </div>
  )
}

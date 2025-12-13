'use client'

import { useState } from 'react'
import { Flame } from 'lucide-react'

type EnergyLevel = 'HIGH' | 'MEDIUM' | 'LOW'

interface EnergyWidgetProps {
  initialEnergy?: EnergyLevel
}

export default function EnergyWidget({ initialEnergy = 'MEDIUM' }: EnergyWidgetProps) {
  const [energy, setEnergy] = useState<EnergyLevel>(initialEnergy)
  const [showSelector, setShowSelector] = useState(false)

  const energyColors: Record<EnergyLevel, string> = {
    HIGH: '#D3FF2C',
    MEDIUM: '#FFB800',
    LOW: '#FF4444',
  }

  const handleSetEnergy = (level: EnergyLevel) => {
    setEnergy(level)
    setShowSelector(false)
    // TODO: Save to API/localStorage
    localStorage.setItem('userEnergy', level)
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#0a0a0a] rounded-lg">
          <Flame size={20} className="text-[#FF008E]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">ENERGY LEVEL</h3>
          <p className="text-[#888888] text-xs">Your Gig Vibe</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <span
          className="text-4xl font-bold"
          style={{ color: energyColors[energy] }}
        >
          {energy}
        </span>
      </div>

      {/* Energy Selector */}
      {showSelector ? (
        <div className="flex gap-2">
          {(['HIGH', 'MEDIUM', 'LOW'] as EnergyLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => handleSetEnergy(level)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                energy === level
                  ? 'ring-2 ring-white'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: energyColors[level],
                color: level === 'HIGH' ? '#000' : '#fff'
              }}
            >
              {level}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setShowSelector(true)}
          className="text-[#00F0E9] text-sm hover:underline"
        >
          Click to update →
        </button>
      )}
    </div>
  )
}

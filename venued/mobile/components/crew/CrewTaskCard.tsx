'use client';

import { Flame, Zap, Star, Brain, Rocket, Clock, Play } from 'lucide-react';
import { CrewTask } from '@/lib/types';

interface CrewTaskCardProps {
  task: CrewTask;
  onToggleComplete: () => void;
  onStartFocus?: () => void;
  isActive?: boolean;
}

export default function CrewTaskCard({ task, onToggleComplete, onStartFocus, isActive }: CrewTaskCardProps) {
  const energyConfig = {
    high: { icon: Flame, color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/30' },
    medium: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    low: { icon: Star, color: 'text-electric-purple', bg: 'bg-electric-purple/10', border: 'border-electric-purple/30' },
  };

  const energy = energyConfig[task.energyLevel];
  const EnergyIcon = energy.icon;

  const isOverdue = task.scheduledTime && !task.completed && new Date() > new Date(`${task.scheduledDate}T${task.scheduledTime}`);

  return (
    <div
      className={`
        group relative p-4 rounded-lg border-2 transition-all duration-300
        ${task.completed
          ? 'border-neon-green/30 bg-neon-green/5'
          : isActive
          ? 'border-neon-pink bg-neon-pink/10 shadow-[0_0_30px_rgba(255,27,141,0.3)]'
          : isOverdue
          ? 'border-red-500/50 bg-red-500/10 animate-pulse'
          : 'border-white/10 bg-gray-900/50 hover:border-electric-purple/40'
        }
      `}
    >
      {/* Checkbox */}
      <button
        onClick={onToggleComplete}
        className={`
          absolute top-4 left-4 w-6 h-6 rounded border-2 flex items-center justify-center transition-all
          ${task.completed
            ? 'bg-neon-green border-neon-green shadow-[0_0_10px_rgba(57,255,20,0.5)]'
            : 'border-gray-600 hover:border-neon-green'
          }
        `}
      >
        {task.completed && (
          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="ml-10">
        {/* Title */}
        <h4 className={`text-base font-bold mb-2 ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className={`text-sm mb-3 ${task.completed ? 'text-gray-600' : 'text-gray-400'}`}>
            {task.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          {/* Energy */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${energy.bg} ${energy.color}`}>
            <EnergyIcon className="w-3 h-3" />
            <span className="text-xs font-semibold capitalize">{task.energyLevel}</span>
          </div>

          {/* Time */}
          {task.scheduledTime && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-blue-400">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-semibold">{task.scheduledTime}</span>
            </div>
          )}

          {/* Hyperfocus */}
          {task.isHyperfocus && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-blue-400">
              <Brain className="w-3 h-3" />
              <span className="text-xs font-semibold">Focus</span>
            </div>
          )}

          {/* Quick Win */}
          {task.isQuickWin && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-neon-green/10 text-neon-green">
              <Rocket className="w-3 h-3" />
              <span className="text-xs font-semibold">Quick Win</span>
            </div>
          )}
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{task.estimatedHours}h</span>
            {task.timeSpent > 0 && (
              <span className="text-neon-green">{task.timeSpent}m tracked</span>
            )}
          </div>

          {/* Focus Button */}
          {!task.completed && onStartFocus && (
            <button
              onClick={onStartFocus}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-electric-purple/20 text-electric-purple hover:bg-electric-purple/30 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Play className="w-3 h-3" />
              <span className="text-xs font-semibold">Focus</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Glow */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/10 to-electric-purple/10 rounded-lg pointer-events-none animate-pulse" />
      )}
    </div>
  );
}

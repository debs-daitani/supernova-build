'use client';

import { Flame, Zap, Star, Brain, Rocket, GripVertical, Clock } from 'lucide-react';
import { Task, EnergyLevel } from '@/lib/types';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onToggleComplete: () => void;
}

export default function TaskCard({ task, onEdit, onToggleComplete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const energyConfig: Record<EnergyLevel, { icon: typeof Flame; color: string; bg: string; label: string }> = {
    high: { icon: Flame, color: 'text-neon-pink', bg: 'bg-neon-pink/10', label: 'High Energy' },
    medium: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Medium Energy' },
    low: { icon: Star, color: 'text-electric-purple', bg: 'bg-electric-purple/10', label: 'Low Energy' },
  };

  const energy = energyConfig[task.energyLevel];
  const EnergyIcon = energy.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative p-4 rounded-lg border-2 bg-gray-900/50 backdrop-blur-sm
        ${task.completed
          ? 'border-neon-green/30 bg-neon-green/5'
          : 'border-white/10 hover:border-electric-purple/40'
        }
        transition-all duration-200 cursor-pointer
      `}
      onClick={onEdit}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-2 mb-3 ml-6">
        {/* Energy Badge */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded ${energy.bg} ${energy.color}`}>
          <EnergyIcon className="w-3 h-3" />
          <span className="text-xs font-semibold">{energy.label}</span>
        </div>

        {/* Hyperfocus Badge */}
        {task.isHyperfocus && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-blue-400">
            <Brain className="w-3 h-3" />
            <span className="text-xs font-semibold">Deep Focus</span>
          </div>
        )}

        {/* Quick Win Badge */}
        {task.isQuickWin && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-neon-green/10 text-neon-green">
            <Rocket className="w-3 h-3" />
            <span className="text-xs font-semibold">Quick Win</span>
          </div>
        )}
      </div>

      {/* Task Title */}
      <h4 className={`
        text-sm font-bold mb-2 pr-6
        ${task.completed ? 'text-gray-500 line-through' : 'text-white'}
      `}>
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className={`text-xs mb-3 ${task.completed ? 'text-gray-600' : 'text-gray-400'}`}>
          {task.description}
        </p>
      )}

      {/* Bottom Row - Time & Difficulty */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{task.estimatedHours}h</span>
        </div>

        <span className={`
          px-2 py-0.5 rounded text-xs font-semibold
          ${task.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' : ''}
          ${task.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
          ${task.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : ''}
        `}>
          {task.difficulty}
        </span>
      </div>

      {/* Complete Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete();
        }}
        className={`
          absolute top-4 right-4 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
          ${task.completed
            ? 'bg-neon-green border-neon-green'
            : 'border-gray-600 hover:border-neon-green'
          }
        `}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Dependency Indicator */}
      {task.dependencies.length > 0 && (
        <div className="absolute bottom-2 right-2">
          <div className="w-2 h-2 rounded-full bg-electric-purple animate-pulse" />
        </div>
      )}
    </div>
  );
}

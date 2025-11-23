'use client';

import { Calendar, CheckCircle, Zap, Flame } from 'lucide-react';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const statusConfig = {
    planning: {
      label: 'Planning',
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/40',
      icon: Calendar,
    },
    live: {
      label: 'Live',
      color: 'text-neon-green',
      bg: 'bg-neon-green/20',
      border: 'border-neon-green/40',
      icon: Zap,
    },
    complete: {
      label: 'Complete',
      color: 'text-electric-purple',
      bg: 'bg-electric-purple/20',
      border: 'border-electric-purple/40',
      icon: CheckCircle,
    },
  };

  const priorityConfig = {
    low: { color: 'text-gray-400', icon: null },
    medium: { color: 'text-yellow-400', icon: null },
    high: { color: 'text-neon-pink', icon: Flame },
  };

  const status = statusConfig[project.status];
  const priority = priorityConfig[project.priority];
  const StatusIcon = status.icon;
  const PriorityIcon = priority.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const daysUntilTarget = Math.ceil(
    (new Date(project.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      onClick={onClick}
      className="group relative p-6 rounded-2xl border-2 border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-neon-pink/40 hover:shadow-[0_0_30px_rgba(255,27,141,0.2)] transition-all duration-300 cursor-pointer"
    >
      {/* Priority Indicator */}
      {project.priority === 'high' && PriorityIcon && (
        <div className="absolute top-4 right-4">
          <PriorityIcon className={`w-5 h-5 ${priority.color} animate-pulse`} />
        </div>
      )}

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${status.bg} border ${status.border} mb-4`}>
        <StatusIcon className={`w-4 h-4 ${status.color}`} />
        <span className={`text-sm font-bold ${status.color} uppercase tracking-wide`}>
          {status.label}
        </span>
      </div>

      {/* Project Name */}
      <h3 className="text-2xl font-black text-white mb-2 group-hover:text-neon-pink transition-colors line-clamp-2">
        {project.name}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400 font-medium">Progress</span>
          <span className="text-white font-bold">{project.progress}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-pink to-electric-purple transition-all duration-500 rounded-full"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Tasks Counter */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-neon-green" />
          <span className="text-sm text-gray-400">
            <span className="text-white font-bold">{project.tasksCompleted}</span>
            {' / '}
            <span>{project.tasksTotal}</span>
            {' tasks'}
          </span>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div>
          <span className="uppercase tracking-wider">Target</span>
          <p className="text-white font-semibold mt-1">
            {formatDate(project.targetDate)}
          </p>
        </div>
        {daysUntilTarget > 0 && project.status !== 'complete' && (
          <div className="text-right">
            <span className="uppercase tracking-wider">Time Left</span>
            <p className={`font-semibold mt-1 ${
              daysUntilTarget < 7 ? 'text-neon-pink' : 'text-white'
            }`}>
              {daysUntilTarget}d
            </p>
          </div>
        )}
        {project.status === 'complete' && (
          <div className="text-right">
            <span className="uppercase tracking-wider text-electric-purple">✓ Shipped</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-800/50 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/0 to-electric-purple/0 group-hover:from-neon-pink/5 group-hover:to-electric-purple/5 rounded-2xl transition-all duration-300 pointer-events-none" />
    </div>
  );
}

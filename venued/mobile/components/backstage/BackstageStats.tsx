'use client';

import { Star, TrendingUp, Clock, Music } from 'lucide-react';
import { BackstageStats as StatsType } from '@/lib/types';

interface BackstageStatsProps {
  stats: StatsType;
}

export default function BackstageStats({ stats }: BackstageStatsProps) {
  const statCards = [
    {
      icon: Star,
      value: stats.activeProjects,
      label: 'Active Projects',
      color: 'neon-pink',
      bgGradient: 'from-neon-pink/10',
      borderColor: 'border-neon-pink/30',
      iconColor: 'text-neon-pink',
    },
    {
      icon: TrendingUp,
      value: stats.tasksCompleted,
      label: 'Tasks Completed',
      color: 'electric-purple',
      bgGradient: 'from-electric-purple/10',
      borderColor: 'border-electric-purple/30',
      iconColor: 'text-electric-purple',
    },
    {
      icon: Clock,
      value: stats.hoursLogged,
      label: 'Hours Logged',
      color: 'neon-green',
      bgGradient: 'from-neon-green/10',
      borderColor: 'border-neon-green/30',
      iconColor: 'text-neon-green',
    },
    {
      icon: Music,
      value: stats.milestonesHit,
      label: 'Milestones Hit',
      color: 'white',
      bgGradient: 'from-white/10',
      borderColor: 'border-white/30',
      iconColor: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statCards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className={`p-6 rounded-xl border ${card.borderColor} bg-gradient-to-br ${card.bgGradient} to-transparent hover:scale-105 transition-transform duration-300 animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <Icon className={`w-8 h-8 ${card.iconColor}`} />
              <span className="text-4xl font-black text-white">
                {card.value}
              </span>
            </div>
            <p className="text-gray-400 font-medium">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}

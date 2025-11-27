'use client';

import { Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  filter?: string;
}

export default function EmptyState({ filter = 'all' }: EmptyStateProps) {
  const getEmptyMessage = () => {
    switch (filter) {
      case 'live':
        return {
          title: 'No Live Shows',
          description: 'Start a project and kick off your tour. The stage is waiting.',
        };
      case 'planning':
        return {
          title: 'No Shows in Planning',
          description: 'Create a project and start mapping out your next big launch.',
        };
      case 'complete':
        return {
          title: 'No Completed Shows',
          description: 'Ship your first project and celebrate the win. Every headliner starts somewhere.',
        };
      default:
        return {
          title: 'No Projects Yet',
          description: 'Time to plan your first show. Every tour starts with a single project.',
        };
    }
  };

  const message = getEmptyMessage();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/20 to-electric-purple/20 blur-3xl" />

        {/* Card */}
        <div className="relative p-12 rounded-3xl border border-white/10 bg-black/80 backdrop-blur-sm max-w-lg text-center">
          <Sparkles className="w-16 h-16 text-electric-purple mx-auto mb-6 animate-pulse" />

          <h2 className="text-3xl font-black text-white mb-4">
            {message.title}
          </h2>

          <p className="text-gray-400 mb-8 text-lg">
            {message.description}
          </p>

          <Link
            href="/setlist"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-neon-pink to-electric-purple rounded-full text-black font-bold hover:shadow-[0_0_40px_rgba(255,27,141,0.6)] transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            New Show
          </Link>
        </div>
      </div>
    </div>
  );
}

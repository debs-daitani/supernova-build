'use client';

import { ProjectStatus } from '@/lib/types';

interface FilterTabsProps {
  activeFilter: ProjectStatus | 'all';
  onFilterChange: (filter: ProjectStatus | 'all') => void;
  counts: {
    all: number;
    planning: number;
    live: number;
    complete: number;
  };
}

export default function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  const tabs = [
    { id: 'all' as const, label: 'All Shows', count: counts.all },
    { id: 'live' as const, label: 'Live', count: counts.live },
    { id: 'planning' as const, label: 'Planning', count: counts.planning },
    { id: 'complete' as const, label: 'Complete', count: counts.complete },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`
              relative px-6 py-3 rounded-lg font-bold text-sm transition-all duration-300 whitespace-nowrap
              ${isActive
                ? 'bg-gradient-to-r from-neon-pink to-electric-purple text-black shadow-[0_0_20px_rgba(255,27,141,0.4)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }
            `}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`
                ml-2 px-2 py-0.5 rounded-full text-xs font-black
                ${isActive ? 'bg-black/20' : 'bg-white/10'}
              `}>
                {tab.count}
              </span>
            )}

            {/* Active indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
        );
      })}
    </div>
  );
}

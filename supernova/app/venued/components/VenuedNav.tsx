'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Rocket, Star, Users, Calendar, Brain } from 'lucide-react';

export default function VenuedNav() {
  const pathname = usePathname();

  const tabs = [
    { href: '/venued', label: 'Backstage', icon: Rocket },
    { href: '/venued/setlist', label: 'Setlist', icon: Star },
    { href: '/venued/crew', label: 'Crew', icon: Users },
    { href: '/venued/tour', label: 'Tour', icon: Calendar },
    { href: '/venued/entourage', label: 'Entourage', icon: Brain },
  ];

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/home"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #FF008E, #00F0E9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            VENUED
          </h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-[#FF008E] text-white'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

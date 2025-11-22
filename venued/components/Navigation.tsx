'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Users, ListChecks, Calendar, Sparkles } from 'lucide-react';

const navItems = [
  { name: 'Backstage', href: '/backstage', icon: Music },
  { name: 'Setlist', href: '/setlist', icon: ListChecks },
  { name: 'Crew', href: '/crew', icon: Users },
  { name: 'Tour', href: '/tour', icon: Calendar },
  { name: 'Entourage', href: '/entourage', icon: Sparkles },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-neon-pink/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-black tracking-tighter text-white group-hover:text-neon-pink transition-colors duration-300">
              VENUED
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-all duration-300
                    ${isActive
                      ? 'text-neon-pink'
                      : 'text-white hover:text-neon-pink'
                    }
                    group
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                  {item.name}

                  {/* Active underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-pink shadow-[0_0_8px_rgba(255,27,141,0.8)]" />
                  )}

                  {/* Hover glow effect */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm bg-neon-pink/10 rounded-md -z-10" />
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-neon-pink transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - could be expanded later */}
      <div className="md:hidden hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors
                  ${isActive
                    ? 'text-neon-pink bg-neon-pink/10'
                    : 'text-white hover:text-neon-pink hover:bg-neon-pink/5'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

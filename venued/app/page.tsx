import Link from 'next/link';
import { Zap, Rocket, Target } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-neon-pink/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-electric-purple/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Logo/Title */}
          <div className="mb-8">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter mb-4">
              <span className="inline-block bg-gradient-to-r from-neon-pink via-electric-purple to-neon-pink bg-clip-text text-transparent animate-pulse">
                VENUED
              </span>
            </h1>
            <div className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-neon-pink to-transparent" />
          </div>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 tracking-wide">
            Strategic project planning for ADHD brains who build like rockstars
          </p>

          {/* Sub-tagline */}
          <p className="text-lg sm:text-xl text-gray-400 mb-12 font-medium">
            Plan your projects like a tour. Execute like a headliner.
          </p>

          {/* CTA Button */}
          <Link
            href="/backstage"
            className="group inline-flex items-center gap-3 px-10 py-5 text-xl font-bold text-black bg-neon-pink rounded-full hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(255,27,141,0.5)] hover:shadow-[0_0_50px_rgba(255,27,141,0.8)]"
          >
            Get VENUED
            <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary text */}
          <p className="mt-8 text-sm text-gray-500 uppercase tracking-widest font-semibold">
            Get VENUED. Get it Done.
          </p>
        </div>
      </div>

      {/* Features Preview */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 rounded-2xl border border-neon-pink/20 bg-black/50 backdrop-blur-sm hover:border-neon-pink/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,27,141,0.2)]">
            <div className="w-12 h-12 rounded-full bg-neon-pink/20 flex items-center justify-center mb-4 group-hover:bg-neon-pink/30 transition-colors">
              <Target className="w-6 h-6 text-neon-pink" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Stay Focused</h3>
            <p className="text-gray-400">
              Break down overwhelming projects into achievable milestones. Built for brains that need structure, not restriction.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 rounded-2xl border border-electric-purple/20 bg-black/50 backdrop-blur-sm hover:border-electric-purple/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(157,78,221,0.2)]">
            <div className="w-12 h-12 rounded-full bg-electric-purple/20 flex items-center justify-center mb-4 group-hover:bg-electric-purple/30 transition-colors">
              <Zap className="w-6 h-6 text-electric-purple" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Build Momentum</h3>
            <p className="text-gray-400">
              Turn ideas into action with tour-style planning. Every project is a show, every task is part of the setlist.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 rounded-2xl border border-neon-green/20 bg-black/50 backdrop-blur-sm hover:border-neon-green/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(57,255,20,0.2)]">
            <div className="w-12 h-12 rounded-full bg-neon-green/20 flex items-center justify-center mb-4 group-hover:bg-neon-green/30 transition-colors">
              <Rocket className="w-6 h-6 text-neon-green" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ship It</h3>
            <p className="text-gray-400">
              ADHD-friendly tools to keep you on track. Timelines, crew management, and support when you need it most.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

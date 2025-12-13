'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Book, Sparkles } from 'lucide-react';
import UserGuideModal from '@/components/UserGuideModal';
import { generateDemoData, isDemoDataLoaded } from '@/lib/demoData';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);

  useEffect(() => {
    setDemoLoaded(isDemoDataLoaded());
  }, []);

  const handleRehearsalStudio = () => {
    generateDemoData();
    setDemoLoaded(true);
    router.push('/backstage');
  };

  const handleJamSession = () => {
    // Clear any existing demo data and start fresh
    if (typeof window !== 'undefined') {
      localStorage.removeItem('venued_projects');
      localStorage.removeItem('venued_crew_tasks');
      localStorage.removeItem('venued_sample_data_loaded');
      localStorage.removeItem('demo_data_loaded');
      // Set flag to prevent auto-populating sample data
      localStorage.setItem('venued_jam_session', 'true');
    }
    router.push('/backstage');
  };

  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col items-center justify-start sm:justify-center">
        <div className="max-w-4xl mx-auto text-center w-full">
          {/* Logo - responsive sizing */}
          <div className="mb-3 sm:mb-4 flex justify-center">
            <div className="relative w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56">
              <Image
                src="/images/VENUED_Logo.png"
                alt="VENUED"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(255,0,142,0.6)]"
                priority
              />
            </div>
          </div>

          {/* Tagline - wraps on very small screens */}
          <p className="text-base sm:text-xl md:text-2xl font-arp-display text-magenta mb-2 sm:mb-4 tracking-wide">
            Get VENUED | Get it DONE!
          </p>

          {/* Sub-tagline */}
          <p className="text-sm sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto font-josefin px-2">
            Strategic project planning for VARIANT brains who build like rockstars
          </p>

          {/* CTA Buttons - Jam Session PRIMARY (top), Rehearsal Studio secondary */}
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center max-w-sm sm:max-w-md mx-auto px-2">
            {/* Jam Session Button - PRIMARY */}
            <button
              onClick={handleJamSession}
              className="w-full group flex flex-col items-center gap-1 px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold text-black bg-magenta rounded-2xl hover:bg-neon-cyan transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(255,0,142,0.5)] hover:shadow-[0_0_50px_rgba(0,240,233,0.8)]"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                JAM SESSION
              </span>
              <span className="text-xs sm:text-sm font-normal opacity-80">
                Your lyrics your way
              </span>
            </button>

            {/* Rehearsal Studio Button - Secondary */}
            <button
              onClick={handleRehearsalStudio}
              className="w-full group flex flex-col items-center gap-1 px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold text-white bg-white/10 rounded-2xl hover:bg-white/20 transition-all border-2 border-white/20 hover:border-magenta/40"
            >
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                REHEARSAL STUDIO
              </span>
              <span className="text-xs sm:text-sm font-normal opacity-80">
                Play with samples
              </span>
            </button>
          </div>

          {/* User Guide Link */}
          <button
            onClick={() => setShowUserGuide(true)}
            className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-neon-cyan hover:text-white transition-colors font-semibold text-sm sm:text-base"
          >
            <Book className="w-4 h-4 sm:w-5 sm:h-5" />
            User Guide
          </button>

          {/* SUPERNova Coming Soon */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-vivid-pink/20 to-magenta/20 border border-magenta/30 backdrop-blur-sm max-w-sm sm:max-w-lg mx-auto">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-magenta to-neon-cyan mb-2">
                SUPERNova AI
              </h3>
              <p className="text-sm sm:text-base text-gray-300 font-josefin mb-3">
                Your bold, direct, anti-BS coaching assistant
              </p>
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-dark-grey-azure/80 rounded-full border border-neon-cyan/30">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-neon-cyan animate-pulse" />
                <span className="text-sm sm:text-base text-neon-cyan font-semibold">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Guide Modal */}
      <UserGuideModal isOpen={showUserGuide} onClose={() => setShowUserGuide(false)} />

      {/* Footer */}
      <div className="py-4 sm:py-6 text-center mt-8">
        <p className="text-xs sm:text-sm text-gray-500 font-josefin">
          Built for VARIANT brains, by VARIANT brains.
        </p>
      </div>
    </div>
  );
}

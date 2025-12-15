'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Check if on VENUED routes
  const isVenuedRoute = pathname?.startsWith('/venued');

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
    }

    // Check if already installed as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after a delay, especially on VENUED routes
      const dismissed = localStorage.getItem('pwaPromptDismissed');
      const lastDismissed = dismissed ? new Date(dismissed) : null;
      const daysSinceDismissed = lastDismissed
        ? (Date.now() - lastDismissed.getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      // Show if never dismissed or dismissed more than 7 days ago
      if (daysSinceDismissed > 7) {
        setTimeout(() => setShowInstallPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Show iOS prompt on VENUED routes if not already installed
  useEffect(() => {
    if (isIOS && !isStandalone && isVenuedRoute) {
      const dismissed = localStorage.getItem('pwaPromptDismissed');
      const lastDismissed = dismissed ? new Date(dismissed) : null;
      const daysSinceDismissed = lastDismissed
        ? (Date.now() - lastDismissed.getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      if (daysSinceDismissed > 7) {
        setTimeout(() => setShowInstallPrompt(true), 3000);
      }
    }
  }, [isIOS, isStandalone, isVenuedRoute]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
    } catch (err) {
      console.log('Install prompt error:', err);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwaPromptDismissed', new Date().toISOString());
  };

  // Don't show if already installed
  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* Install Prompt Banner */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
          <div className="max-w-md mx-auto backdrop-blur-xl bg-black/90 rounded-2xl border border-[#FF008E]/30 p-4 shadow-[0_0_30px_rgba(255,0,142,0.3)]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF008E] to-[#00F0E9] flex items-center justify-center">
                <Smartphone className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">
                  {isVenuedRoute ? 'Install VENUED' : 'Install dAItaniverse'}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {isVenuedRoute
                    ? 'Get quick access to your productivity tools from your home screen'
                    : 'Add to your home screen for the best experience'}
                </p>

                {isIOS ? (
                  <div className="mt-3 text-sm text-gray-300">
                    <p className="flex items-center gap-2">
                      <span>Tap</span>
                      <span className="px-2 py-0.5 bg-white/10 rounded">Share</span>
                      <span>then</span>
                      <span className="px-2 py-0.5 bg-white/10 rounded">Add to Home Screen</span>
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleInstall}
                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF008E] to-[#00F0E9] text-white font-medium text-sm hover:scale-105 transition-transform"
                  >
                    <Download size={16} />
                    Install App
                  </button>
                )}
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

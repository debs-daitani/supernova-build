'use client';

import { useState } from 'react';
import { Music, Zap, X, ChevronRight } from 'lucide-react';
import TourCreationModal from './TourCreationModal';
import QuickActionModal from './QuickActionModal';

interface LFGChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function LFGChoiceModal({ isOpen, onClose, onCreated }: LFGChoiceModalProps) {
  const [showTourModal, setShowTourModal] = useState(false);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);

  if (!isOpen) return null;

  const handleTourClick = () => {
    setShowTourModal(true);
  };

  const handleQuickActionClick = () => {
    setShowQuickActionModal(true);
  };

  const handleTourCreated = () => {
    setShowTourModal(false);
    onCreated?.();
    onClose();
  };

  const handleQuickActionCreated = () => {
    setShowQuickActionModal(false);
    onCreated?.();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-dark-grey-azure rounded-2xl border border-magenta/30 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-supernova text-white">What's the Move?</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Choice Cards */}
          <div className="space-y-4">
            {/* Kick Off a Tour */}
            <button
              onClick={handleTourClick}
              className="w-full p-5 rounded-xl border-2 border-magenta/30 bg-gradient-to-br from-magenta/10 to-transparent hover:border-magenta hover:shadow-[0_0_30px_rgba(255,0,142,0.3)] transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-magenta/20 text-magenta group-hover:scale-110 transition-transform">
                  <Music className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Kick Off a Tour
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Full project with multiple actions. Plan your headlining show.
                  </p>
                </div>
              </div>
            </button>

            {/* Quick Action */}
            <button
              onClick={handleQuickActionClick}
              className="w-full p-5 rounded-xl border-2 border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 to-transparent hover:border-neon-cyan hover:shadow-[0_0_30px_rgba(0,240,233,0.3)] transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-neon-cyan/20 text-neon-cyan group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Quick Action
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Standalone single task. Get it done and move on.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tour Creation Modal */}
      <TourCreationModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        onCreated={handleTourCreated}
      />

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={showQuickActionModal}
        onClose={() => setShowQuickActionModal(false)}
        onCreated={handleQuickActionCreated}
      />
    </>
  );
}

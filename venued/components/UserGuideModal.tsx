'use client';

import { X } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserGuideModal({ isOpen, onClose }: UserGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-dark-grey-azure rounded-2xl border border-magenta/30 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header - fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-supernova text-white">User Guide</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6 text-gray-300 font-josefin">
            <section>
              <h3 className="text-lg font-semibold text-magenta mb-2">What is VENUED?</h3>
              <p>
                VENUED is a strategic project planning app designed specifically for VARIANT brains.
                We understand that your brain works differently - and that's not a flaw, it's an advantage!
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-neon-cyan mb-2">The 5 Sections</h3>
              <ul className="space-y-3">
                <li>
                  <strong className="text-white">Backstage</strong> - Your gig strategy hub. See Your Next Big Hit (smart suggestions),
                  Quick Wins shortcuts, process your Inbox, and toggle between Spotlight (simplified) and Full Stage (complete) views with Morning Launch Mode.
                </li>
                <li>
                  <strong className="text-white">Crew</strong> - Your action management hub. Create Tours (projects) and Actions (tasks),
                  organise by stage (Planning/Development/Launch), attach links to Google Drive or Notion, and track progress.
                </li>
                <li>
                  <strong className="text-white">Tour</strong> - Your calendar view. Schedule actions, see weekly overview with day-specific colours,
                  and plan your gigs without overwhelm.
                </li>
                <li>
                  <strong className="text-white">Setlist</strong> - Your gig vibe tracker. Monitor energy levels, access focus playlists,
                  and match your work to your current vibe.
                </li>
                <li>
                  <strong className="text-white">Entourage</strong> - 9 specialised support modules: Tune Up, Retune, New Releases, Brain Dump,
                  Reframe, Amplify, Chill Mode, Gig Highlights, and The Encore.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-vivid-yellow-green mb-2">Key Features</h3>
              <ul className="space-y-2">
                <li><strong className="text-white">Quick Capture</strong> - Floating button on every page. Capture thoughts in 2 seconds flat.</li>
                <li><strong className="text-white">Your Next Big Hit</strong> - Smart suggestions based on your energy and priorities.</li>
                <li><strong className="text-white">Morning Launch Mode</strong> - Spotlight (calm start) vs Full Stage (everything visible) toggle.</li>
                <li><strong className="text-white">End My Day</strong> - Structured shutdown ritual with 4 prompts + celebratory pyrotechnics.</li>
                <li><strong className="text-white">Link Attachments</strong> - Connect Google Drive, Notion, or any URL to your actions.</li>
                <li><strong className="text-white">Gig Vibes</strong> - Tag actions by energy level (Low/Medium/High) for better matching.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-azure mb-2">Getting Started</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Jam Session</strong> - Start fresh with your own tours and actions</li>
                <li><strong>Rehearsal Studio</strong> - Explore with sample data first</li>
                <li>Use the LFG button to create new tours or actions</li>
                <li>Use Quick Capture to dump thoughts into your Inbox</li>
                <li>Process Inbox items from Backstage when ready</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-vivid-pink mb-2">Pro Tips</h3>
              <ul className="space-y-2">
                <li>First visit of the day? Spotlight mode auto-loads for a calm start</li>
                <li>Match actions to your current gig vibe for better flow</li>
                <li>Use End My Day to close out properly - your future self will thank you</li>
                <li>Attach links to keep everything in one place</li>
                <li>Check Entourage when you need a reset, reframe, or boost</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer - fixed */}
        <div className="p-4 sm:p-6 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-4 bg-magenta text-black font-bold rounded-xl hover:bg-neon-cyan transition-all shadow-[0_0_20px_rgba(255,0,142,0.5)] hover:shadow-[0_0_30px_rgba(0,240,233,0.6)]"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

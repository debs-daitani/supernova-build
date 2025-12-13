'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Music,
  Star,
  Users,
  Calendar,
  Brain,
  Zap,
  Sparkles,
  Rocket,
  Check,
  Sun,
  Inbox,
  Link2,
  Moon,
} from 'lucide-react';
import { generateDemoData } from '@/lib/demoData';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  details?: string[];
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to VENUED',
    description: 'Strategic project planning for VARIANT brains who build like rockstars',
    icon: Rocket,
    color: 'neon-pink',
    details: [
      'Plan your projects like a tour, execute like a headliner',
      'Built specifically for VARIANT brains',
      'All data stays local—nothing sent to servers',
      'Install as a PWA for offline access',
    ],
  },
  {
    title: 'BACKSTAGE',
    description: 'Your gig strategy hub - everything starts here',
    icon: Star,
    color: 'neon-pink',
    details: [
      'Your Next Big Hit - smart suggestions based on energy and priorities',
      'Quick Wins - 4 shortcuts: LFG, Quick Capture, Check Gig Vibe, End My Day',
      'Inbox - process thoughts captured on the fly',
      'Morning Launch Mode - Spotlight (simplified) vs Full Stage (complete) views',
      'Active Tours and upcoming actions at a glance',
    ],
  },
  {
    title: 'CREW',
    description: 'Your action management hub - where the work gets done',
    icon: Users,
    color: 'neon-green',
    details: [
      'Tours (projects) organised by stage: Planning, Development, Launch',
      'Actions (tasks) with gig vibes: Low, Medium, High energy',
      'Loose Actions for standalone tasks without a tour',
      'Attach links to Google Drive, Notion, or any URL',
      'Unified LFG button to create tours or actions',
    ],
  },
  {
    title: 'TOUR',
    description: 'Your calendar view - schedule and visualise your week',
    icon: Calendar,
    color: 'blue-400',
    details: [
      'Weekly view with day-specific colours',
      'Schedule actions by date',
      'See what\'s coming up at a glance',
      'Plan your gigs without overwhelm',
    ],
  },
  {
    title: 'SETLIST',
    description: 'Your gig vibe tracker - match work to energy',
    icon: Music,
    color: 'electric-purple',
    details: [
      'Track your energy levels throughout the day',
      'Focus playlists to get in the zone',
      'Energy patterns over time',
      'Match actions to your current vibe',
    ],
  },
  {
    title: 'ENTOURAGE',
    description: '9 specialised support modules for VARIANT brains',
    icon: Brain,
    color: 'yellow-400',
    details: [
      'Tune Up & Retune - Reset and refocus protocols',
      'New Releases & Brain Dump - Capture and clear mental clutter',
      'Reframe & Amplify - Shift perspective and boost confidence',
      'Chill Mode & Reset - Wind down and recover',
      'Gig Highlights & The Encore - Celebrate wins and reflect',
    ],
  },
  {
    title: 'New Features to Explore',
    description: 'Power tools to supercharge your workflow',
    icon: Zap,
    color: 'neon-cyan',
    details: [
      'Quick Capture button - floating on every page, capture thoughts in 2 seconds',
      'End My Day ritual - structured shutdown with 4 prompts + pyrotechnics',
      'Morning Launch Mode - Spotlight for calm starts, Full Stage when ready',
      'Link attachments - connect Google Drive, Notion docs to actions',
      'Your Next Big Hit - AI-style smart task suggestions',
    ],
  },
  {
    title: "You're Ready to Rock!",
    description: 'Choose how you want to start your VENUED journey',
    icon: Sparkles,
    color: 'neon-pink',
    details: [
      'Rehearsal Studio - explore with sample data',
      'Jam Session - start fresh with your own projects',
      'Your data is stored locally and private',
      'Access the User Guide anytime via the ? icon in the nav',
    ],
  },
];

export default function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const hasCompletedOnboarding = localStorage.getItem('venued_onboarding_complete');
    if (!hasCompletedOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('venued_onboarding_complete', 'true');
    setIsVisible(false);
  };

  const handleLoadDemo = () => {
    generateDemoData();
    localStorage.setItem('venued_onboarding_complete', 'true');
    setIsVisible(false);
    router.push('/backstage');
  };

  const handleStartFresh = () => {
    localStorage.setItem('venued_onboarding_complete', 'true');
    setIsVisible(false);
    router.push('/backstage');
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg px-4 py-4 overflow-hidden">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute -top-10 right-0 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Skip onboarding"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Main card */}
        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 overflow-hidden flex flex-col max-h-full">
          {/* Progress bar */}
          <div className="h-2 bg-black/30 flex-shrink-0">
            <div
              className="h-full bg-gradient-to-r from-electric-purple to-neon-pink transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Content - scrollable */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1">
            {/* Icon - consistent magenta glow style */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-magenta/20 border-2 border-magenta/50 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,142,0.4)]">
                <Icon className="w-10 h-10 text-magenta drop-shadow-[0_0_8px_rgba(255,0,142,0.8)]" />
              </div>
            </div>

            {/* Title and description */}
            <h2 className="text-3xl sm:text-4xl font-black text-center text-white mb-4">
              {step.title}
            </h2>
            <p className="text-lg sm:text-xl text-center text-gray-300 mb-8">
              {step.description}
            </p>

            {/* Details */}
            {step.details && (
              <div className="space-y-3 mb-8">
                {step.details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <Check className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                    <span className="text-gray-200">{detail}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Final step actions */}
            {isLastStep && (
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                  onClick={handleLoadDemo}
                  className="flex-1 px-8 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white font-bold hover:bg-white/20 transition-all text-center"
                >
                  <Sparkles className="w-5 h-5 inline-block mr-2" />
                  Rehearsal Studio: play with samples
                </button>
                <button
                  onClick={handleStartFresh}
                  className="flex-1 px-8 py-4 bg-magenta rounded-xl text-black font-bold hover:bg-neon-cyan transition-all text-center shadow-[0_0_20px_rgba(255,0,142,0.5)] hover:shadow-[0_0_30px_rgba(0,240,233,0.6)]"
                >
                  <Rocket className="w-5 h-5 inline-block mr-2" />
                  Jam Session: your lyrics your way
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentStep === 0
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {/* Step indicator */}
              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-gradient-to-r from-electric-purple to-neon-pink'
                        : index < currentStep
                        ? 'w-2 bg-neon-green'
                        : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {!isLastStep && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-electric-purple text-white font-semibold hover:bg-neon-pink transition-all"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              {isLastStep && <div />}
            </div>

            {/* Skip link */}
            <div className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Skip tour, I know what I'm doing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  Target,
  Sparkles,
  Rocket,
  Check,
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
    description: 'Strategic project planning for ADHD brains who build like rockstars',
    icon: Rocket,
    color: 'neon-pink',
    details: [
      'Plan your projects like a tour',
      'Execute like a headliner',
      'Built specifically for ADHD brains',
      'All data stays local—nothing sent to servers',
    ],
  },
  {
    title: 'BACKSTAGE',
    description: 'Your command center. See all projects at a glance.',
    icon: Music,
    color: 'neon-pink',
    details: [
      'View all active projects',
      'Track progress and priorities',
      'Filter by status (Planning, Live, Complete)',
      'Quick stats and overview',
    ],
  },
  {
    title: 'SETLIST',
    description: 'Build your project like a setlist with drag-and-drop phases',
    icon: Star,
    color: 'electric-purple',
    details: [
      'Break projects into manageable phases',
      'Add tasks with energy levels',
      'Mark hyperfocus tasks',
      'Create quick wins for momentum',
    ],
  },
  {
    title: 'CREW',
    description: 'Your daily task manager with ADHD-friendly features',
    icon: Users,
    color: 'neon-green',
    details: [
      'Energy level matching',
      'Built-in focus timer',
      'Schedule tasks by date',
      'Celebrate completions with confetti!',
    ],
  },
  {
    title: 'TOUR',
    description: 'Strategic timeline view with ADHD reality checks',
    icon: Calendar,
    color: 'blue-400',
    details: [
      'See your week at a glance',
      'Time blindness multiplier (1.8x by default)',
      'Workload distribution',
      'Prevent burnout with visual warnings',
    ],
  },
  {
    title: 'ENTOURAGE',
    description: '17 specialized ADHD support tools to optimize your brain',
    icon: Brain,
    color: 'yellow-400',
    details: [
      'Time Blindness Tracker - Learn your real multiplier',
      'Hyperfocus Logger - Track flow states',
      'Energy Tracker - Map your patterns',
      'Brain Dump Space - Clear mental clutter',
      'Dopamine Menu - Gamified rewards',
      'Body Doubling Simulator - Virtual accountability',
      'Pattern Insights - Personalized recommendations',
    ],
  },
  {
    title: "You're Ready to Rock!",
    description: 'Choose how you want to start your VENUED journey',
    icon: Sparkles,
    color: 'neon-pink',
    details: [
      'Load demo data to explore features',
      'Start fresh with your own projects',
      'Your data is stored locally and private',
      'Install as a PWA for offline access',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg px-4">
      <div className="relative w-full max-w-3xl">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Main card */}
        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 overflow-hidden">
          {/* Progress bar */}
          <div className="h-2 bg-black/30">
            <div
              className="h-full bg-gradient-to-r from-electric-purple to-neon-pink transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-8 sm:p-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-br from-${step.color} to-${step.color}/50 flex items-center justify-center animate-pulse`}
              >
                <Icon className="w-10 h-10 text-white" />
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
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleLoadDemo}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-neon-pink to-electric-purple rounded-xl text-white font-bold hover:shadow-[0_0_30px_rgba(255,27,141,0.5)] transition-all text-center"
                >
                  <Sparkles className="w-5 h-5 inline-block mr-2" />
                  Load Demo Data
                </button>
                <button
                  onClick={handleStartFresh}
                  className="flex-1 px-8 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white font-bold hover:bg-white/20 transition-all text-center"
                >
                  Start Fresh
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

              {!isLastStep ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-electric-purple text-white font-semibold hover:bg-neon-pink transition-all"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleStartFresh}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-neon-green text-black font-semibold hover:bg-white transition-all"
                >
                  Get Started
                  <Rocket className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Skip link */}
            <div className="text-center mt-6">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Skip tour, I know what I'm doing
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="hidden sm:inline">
            Use arrow keys or click buttons to navigate
          </span>
        </div>
      </div>
    </div>
  );
}

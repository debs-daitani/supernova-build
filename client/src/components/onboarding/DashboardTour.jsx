import React, { useState, useEffect, useRef } from 'react';
import onboardingService from '../../services/onboarding';

export default function DashboardTour({ onComplete, onSkip, steps: customSteps }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightPosition, setSpotlightPosition] = useState(null);
  const tooltipRef = useRef(null);

  // Default tour steps
  const defaultSteps = [
    {
      target: '[data-tour="navigation"]',
      title: 'Your Navigation',
      content: 'Access all your tools from this sidebar. Everything you need is just one click away.',
      position: 'right'
    },
    {
      target: '[data-tour="quick-actions"]',
      title: 'Quick Actions',
      content: 'Jump straight into creating content with these shortcuts. Perfect for when you know exactly what you want to do.',
      position: 'bottom'
    },
    {
      target: '[data-tour="stats"]',
      title: 'Your Dashboard',
      content: 'Track your key metrics at a glance. Monitor your growth, sales, and engagement all in one place.',
      position: 'bottom'
    },
    {
      target: '[data-tour="search"]',
      title: 'Universal Search',
      content: 'Find anything instantly with our powerful search. Works across all your content, contacts, and data.',
      position: 'bottom'
    },
    {
      target: '[data-tour="help"]',
      title: 'Help & Support',
      content: 'Get help anytime with our knowledge base, video tutorials, and live chat support.',
      position: 'left'
    }
  ];

  const steps = customSteps || defaultSteps;
  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (currentStepData) {
      updateSpotlight();
      window.addEventListener('resize', updateSpotlight);
      window.addEventListener('scroll', updateSpotlight);

      return () => {
        window.removeEventListener('resize', updateSpotlight);
        window.removeEventListener('scroll', updateSpotlight);
      };
    }
  }, [currentStep, currentStepData]);

  const updateSpotlight = () => {
    if (!currentStepData) return;

    const element = document.querySelector(currentStepData.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setSpotlightPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await onboardingService.completeStep('dashboard-tour', 'tour');
      onComplete?.();
    } catch (error) {
      console.error('Failed to complete tour:', error);
      onComplete?.();
    }
  };

  const handleSkipTour = async () => {
    try {
      await onboardingService.updateProgress({ showTips: false });
      onSkip?.();
    } catch (error) {
      console.error('Failed to skip tour:', error);
      onSkip?.();
    }
  };

  const getTooltipPosition = () => {
    if (!spotlightPosition || !currentStepData) return {};

    const padding = 20;
    const tooltipWidth = 400;
    const tooltipHeight = 200; // Approximate

    let top, left;

    switch (currentStepData.position) {
      case 'right':
        top = spotlightPosition.top;
        left = spotlightPosition.left + spotlightPosition.width + padding;
        break;
      case 'left':
        top = spotlightPosition.top;
        left = spotlightPosition.left - tooltipWidth - padding;
        break;
      case 'bottom':
        top = spotlightPosition.top + spotlightPosition.height + padding;
        left = spotlightPosition.left + (spotlightPosition.width / 2) - (tooltipWidth / 2);
        break;
      case 'top':
        top = spotlightPosition.top - tooltipHeight - padding;
        left = spotlightPosition.left + (spotlightPosition.width / 2) - (tooltipWidth / 2);
        break;
      default:
        top = spotlightPosition.top + spotlightPosition.height + padding;
        left = spotlightPosition.left;
    }

    // Keep tooltip within viewport
    const maxLeft = window.innerWidth - tooltipWidth - 20;
    const maxTop = window.innerHeight - tooltipHeight - 20;
    left = Math.max(20, Math.min(left, maxLeft));
    top = Math.max(20, Math.min(top, maxTop));

    return { top, left };
  };

  if (!currentStepData) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay with spotlight cutout */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top */}
        {spotlightPosition && (
          <>
            <div
              className="absolute bg-black bg-opacity-70 transition-all duration-300"
              style={{
                top: 0,
                left: 0,
                right: 0,
                height: spotlightPosition.top
              }}
            />
            {/* Left */}
            <div
              className="absolute bg-black bg-opacity-70 transition-all duration-300"
              style={{
                top: spotlightPosition.top,
                left: 0,
                width: spotlightPosition.left,
                height: spotlightPosition.height
              }}
            />
            {/* Right */}
            <div
              className="absolute bg-black bg-opacity-70 transition-all duration-300"
              style={{
                top: spotlightPosition.top,
                left: spotlightPosition.left + spotlightPosition.width,
                right: 0,
                height: spotlightPosition.height
              }}
            />
            {/* Bottom */}
            <div
              className="absolute bg-black bg-opacity-70 transition-all duration-300"
              style={{
                top: spotlightPosition.top + spotlightPosition.height,
                left: 0,
                right: 0,
                bottom: 0
              }}
            />
          </>
        )}
      </div>

      {/* Highlighted element border */}
      {spotlightPosition && (
        <div
          className="absolute border-4 border-purple-500 rounded-lg pointer-events-none transition-all duration-300 shadow-2xl"
          style={{
            top: spotlightPosition.top - 4,
            left: spotlightPosition.left - 4,
            width: spotlightPosition.width + 8,
            height: spotlightPosition.height + 8
          }}
        />
      )}

      {/* Tooltip */}
      {spotlightPosition && (
        <div
          ref={tooltipRef}
          className="absolute bg-white rounded-xl shadow-2xl p-6 w-[400px] transition-all duration-300 pointer-events-auto"
          style={getTooltipPosition()}
        >
          {/* Arrow indicator */}
          <div
            className={`absolute w-4 h-4 bg-white transform rotate-45 ${
              currentStepData.position === 'right'
                ? '-left-2 top-6'
                : currentStepData.position === 'left'
                ? '-right-2 top-6'
                : currentStepData.position === 'bottom'
                ? 'left-1/2 -translate-x-1/2 -top-2'
                : 'left-1/2 -translate-x-1/2 -bottom-2'
            }`}
          />

          {/* Content */}
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-purple-600 text-sm font-semibold mb-1">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {currentStepData.title}
                </h3>
              </div>
              <button
                onClick={handleSkipTour}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-700 mb-6">
              {currentStepData.content}
            </p>

            {/* Progress dots */}
            <div className="flex items-center gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-purple-600'
                      : index < currentStep
                      ? 'w-1.5 bg-purple-600'
                      : 'w-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Back
              </button>

              <button
                onClick={handleSkipTour}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Skip tour
              </button>

              <button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg"
              >
                {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DashboardTour Component
 * Interactive spotlight tour with 4 stops
 */

import { useState, useEffect, useRef } from 'react';

export default function DashboardTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const tourSteps = [
    {
      target: '#sidebar',
      title: 'This Is Your Main Navigation',
      description: 'Click any tool to access it. Your top tools are pinned here based on your goal.',
      position: 'right'
    },
    {
      target: '#quick-wins',
      title: 'Your Quick Wins Checklist',
      description: 'Complete these 5 tasks to get your first win! Each takes just 1-3 minutes.',
      position: 'left'
    },
    {
      target: '#supernova-chat',
      title: 'Meet SUPERNova AI',
      description: 'Stuck? Click here anytime. SUPERNova knows everything and speaks in Debs\' voice. Try asking: "Help me build a page"',
      position: 'left'
    },
    {
      target: '#profile-menu',
      title: 'Your Profile',
      description: 'Manage your account, billing, and preferences here.',
      position: 'bottom'
    }
  ];

  const currentStep = tourSteps[step];

  useEffect(() => {
    if (currentStep) {
      updateTooltipPosition();
    }
  }, [step]);

  const updateTooltipPosition = () => {
    if (!currentStep) return;

    const targetElement = document.querySelector(currentStep.target);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top, left;

      switch (currentStep.position) {
        case 'right':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + 20;
          break;
        case 'left':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - 400;
          break;
        case 'bottom':
          top = rect.bottom + scrollY + 20;
          left = rect.left + scrollX + rect.width / 2 - 200;
          break;
        case 'top':
          top = rect.top + scrollY - 200;
          left = rect.left + scrollX + rect.width / 2 - 200;
          break;
        default:
          top = rect.top + scrollY;
          left = rect.right + scrollX + 20;
      }

      setTooltipPosition({ top, left });

      // Scroll target into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!currentStep) {
    return null;
  }

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/70 z-40" onClick={handleSkip} />

      {/* Spotlight effect on target */}
      <SpotlightHighlight target={currentStep.target} />

      {/* Tooltip */}
      <div
        className="fixed z-50 animate-fade-in"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: currentStep.position === 'bottom' || currentStep.position === 'top'
            ? 'translateX(-50%)'
            : 'translateY(-50%)'
        }}
      >
        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm border-2 border-orange-500">
          <h3 className="text-xl font-bold mb-2 text-gray-900">{currentStep.title}</h3>
          <p className="text-gray-700 mb-4">{currentStep.description}</p>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Step {step + 1} of {tourSteps.length}
            </span>

            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all"
                >
                  ← Back
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all"
              >
                {step < tourSteps.length - 1 ? 'Next →' : 'Finish Tour'}
              </button>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 transition-all"
          >
            Skip Tour
          </button>
        </div>

        {/* Arrow pointer */}
        <div
          className={`absolute w-0 h-0 ${
            currentStep.position === 'right'
              ? 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-white border-r-8 border-y-transparent border-y-8 border-l-0'
              : currentStep.position === 'left'
              ? 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-white border-l-8 border-y-transparent border-y-8 border-r-0'
              : currentStep.position === 'bottom'
              ? 'left-1/2 top-0 -translate-x-1/2 -translate-y-full border-b-white border-b-8 border-x-transparent border-x-8 border-t-0'
              : 'left-1/2 bottom-0 -translate-x-1/2 translate-y-full border-t-white border-t-8 border-x-transparent border-x-8 border-b-0'
          }`}
        />
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

/**
 * Spotlight Highlight Component
 * Creates a "cut-out" effect highlighting the target element
 */
function SpotlightHighlight({ target }) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(target);
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        setPosition({
          top: rect.top + scrollY - 5,
          left: rect.left + scrollX - 5,
          width: rect.width + 10,
          height: rect.height + 10
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [target]);

  return (
    <div
      className="fixed z-45 pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        height: `${position.height}px`
      }}
    >
      <div className="absolute inset-0 bg-white/10 rounded-lg border-2 border-orange-500 shadow-2xl animate-pulse-slow" />
    </div>
  );
}

/**
 * SetupWizard Component
 * 3-step modal wizard for onboarding setup
 */

import { useState } from 'react';

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [wantsSamples, setWantsSamples] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      // Save to backend
      const response = await fetch('/api/onboarding/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          wantsSampleData: wantsSamples
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save setup');
      }

      onComplete({ goal, wantsSamples });
    } catch (error) {
      console.error('Error completing setup:', error);
      alert('There was an error saving your preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-3xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                step >= i ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Meet SUPERNova */}
        {step === 1 && (
          <Step1MeetSuperNova onNext={() => setStep(2)} />
        )}

        {/* Step 2: Choose Goal */}
        {step === 2 && (
          <Step2ChooseGoal
            goal={goal}
            setGoal={setGoal}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {/* Step 3: Sample Data */}
        {step === 3 && (
          <Step3SampleData
            wantsSamples={wantsSamples}
            setWantsSamples={setWantsSamples}
            onBack={() => setStep(2)}
            onComplete={handleComplete}
            isLoading={isLoading}
          />
        )}

      </div>
    </div>
  );
}

/**
 * Step 1: Meet SUPERNova
 */
function Step1MeetSuperNova({ onNext }) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-4 text-gray-900">Meet Your AI Assistant</h2>

      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-6 mb-6">
        <div className="text-6xl mb-4 text-center">🤖</div>

        <div className="text-lg text-gray-800 leading-relaxed space-y-4">
          <p className="italic">"Hey! 👋</p>

          <p className="italic">
            I'm SUPERNova - your 24/7 business coach.
          </p>

          <p className="italic">
            Think of me as Debs' AI twin - I know all her frameworks, strategies, and I speak just as directly.
          </p>

          <p className="italic">
            Got questions? Just ask. I'm always here."
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold transition-all transform hover:scale-105"
      >
        Nice to Meet You →
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Step 1 of 3
      </p>
    </div>
  );
}

/**
 * Step 2: Choose Goal
 */
function Step2ChooseGoal({ goal, setGoal, onBack, onNext }) {
  const goalOptions = [
    {
      id: 'website',
      icon: '🌐',
      title: 'Build a Website',
      desc: 'I need an online presence'
    },
    {
      id: 'ecommerce',
      icon: '🛒',
      title: 'Start Selling Online',
      desc: 'I have products to sell'
    },
    {
      id: 'course',
      icon: '🎓',
      title: 'Create a Course',
      desc: 'I want to teach what I know'
    },
    {
      id: 'crm',
      icon: '👥',
      title: 'Manage Customers (CRM)',
      desc: 'I need to track leads & sales'
    },
    {
      id: 'all',
      icon: '🤷',
      title: "I'm Not Sure Yet",
      desc: 'Show me everything'
    }
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-4 text-gray-900">Let's Focus Your Energy</h2>
      <p className="text-gray-600 mb-6">What's your #1 priority right now?</p>

      <div className="space-y-3 mb-6">
        {goalOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setGoal(option.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              goal === option.id
                ? 'border-orange-500 bg-orange-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{option.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{option.title}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </div>
              {goal === option.id && (
                <span className="text-orange-500 text-xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
        >
          ← Back
        </button>

        <button
          onClick={onNext}
          disabled={!goal}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Continue →
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">
        Step 2 of 3
      </p>
    </div>
  );
}

/**
 * Step 3: Sample Data
 */
function Step3SampleData({ wantsSamples, setWantsSamples, onBack, onComplete, isLoading }) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-4 text-gray-900">Want a Head Start?</h2>

      <p className="text-gray-600 mb-6">
        We can pre-populate your account with examples so you can see how everything works.
      </p>

      <div className="space-y-3 mb-6">
        <button
          onClick={() => setWantsSamples(true)}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            wantsSamples
              ? 'border-orange-500 bg-orange-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              wantsSamples ? 'border-orange-500' : 'border-gray-300'
            }`}>
              {wantsSamples && <div className="w-3 h-3 rounded-full bg-orange-500" />}
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900">Yes, show me examples</div>
              <div className="text-sm text-gray-600">(You can delete them anytime)</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setWantsSamples(false)}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            !wantsSamples
              ? 'border-orange-500 bg-orange-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              !wantsSamples ? 'border-orange-500' : 'border-gray-300'
            }`}>
              {!wantsSamples && <div className="w-3 h-3 rounded-full bg-orange-500" />}
            </div>
            <div className="font-bold text-gray-900">No, I'll start from scratch</div>
          </div>
        </button>
      </div>

      {wantsSamples && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div className="text-sm">
              <strong>SUPERNova says:</strong><br/>
              "I recommend starting with examples - you'll learn faster by seeing it in action!"
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          ← Back
        </button>

        <button
          onClick={onComplete}
          disabled={isLoading}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Setting Up...' : "Let's Go! →"}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">
        Step 3 of 3
      </p>

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
    </div>
  );
}

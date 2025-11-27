import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import onboardingService from '../../services/onboarding';
import useAuthStore from '../../stores/authStore';

export default function WelcomeWizard({ onComplete, onSkip }) {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [businessName, setBusinessName] = useState(user?.name || '');
  const [businessType, setBusinessType] = useState('');
  const [loadSampleData, setLoadSampleData] = useState(true);
  const [loading, setLoading] = useState(false);

  const totalSteps = 5;

  const goals = [
    {
      id: 'website',
      title: 'Build a Website',
      description: 'Create a professional website or landing page',
      icon: '🌐',
      features: ['Website Builder', 'Templates', 'Custom Domain', 'SEO Tools']
    },
    {
      id: 'courses',
      title: 'Sell Online Courses',
      description: 'Launch and sell courses to your audience',
      icon: '🎓',
      features: ['Course Builder', 'Video Hosting', 'Student Management', 'Certificates']
    },
    {
      id: 'ecommerce',
      title: 'Run an Online Store',
      description: 'Sell physical or digital products online',
      icon: '🛒',
      features: ['Product Catalog', 'Payment Processing', 'Inventory', 'Shipping']
    },
    {
      id: 'crm',
      title: 'Manage Customers',
      description: 'Track leads, contacts, and close deals',
      icon: '📊',
      features: ['Contact Management', 'Pipeline', 'Email Marketing', 'Automation']
    },
    {
      id: 'all',
      title: 'Use Everything',
      description: 'Explore all 40+ features and tools',
      icon: '⭐',
      features: ['All Features', 'Full Platform Access', 'Advanced Tools', 'Integrations']
    }
  ];

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);

      // Save progress
      try {
        await onboardingService.updateProgress({
          currentStep: `step-${currentStep + 1}`,
          primaryGoal: selectedGoal,
          selectedFeatures
        });
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);

      // Complete welcome wizard
      await onboardingService.completeStep('welcome-wizard', 'welcome');

      // Update user profile if changed
      if (businessName !== user?.name) {
        await updateUser({ name: businessName });
      }

      // Update final progress
      await onboardingService.updateProgress({
        primaryGoal: selectedGoal,
        selectedFeatures,
        currentStep: 'completed-welcome'
      });

      // TODO: Load sample data if requested
      // if (loadSampleData) {
      //   await sampleDataService.loadForGoal(selectedGoal);
      // }

      onComplete?.(selectedGoal);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Failed to save onboarding progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAll = async () => {
    try {
      await onboardingService.updateProgress({ skipOnboarding: true });
      onSkip?.();
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[...Array(totalSteps)].map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all ${
            index + 1 === currentStep
              ? 'w-8 bg-purple-600'
              : index + 1 < currentStep
              ? 'w-2 bg-purple-600'
              : 'w-2 bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-8xl mb-6">👋</div>
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to The dAItaniverse!
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        You've joined the platform that replaces 40+ tools and saves you £600/month.
        Let's get you set up in just 2 minutes!
      </p>

      <div className="grid md:grid-cols-3 gap-6 text-left mb-8">
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="font-semibold text-gray-900 mb-2">Quick Setup</h3>
          <p className="text-sm text-gray-600">Get started in less than 2 minutes</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="font-semibold text-gray-900 mb-2">Tailored to You</h3>
          <p className="text-sm text-gray-600">Customized based on your goals</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="font-semibold text-gray-900 mb-2">Ready to Launch</h3>
          <p className="text-sm text-gray-600">Sample data to help you explore</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">What's your primary goal?</h2>
        <p className="text-lg text-gray-600">
          We'll customize your experience to help you achieve it faster
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => setSelectedGoal(goal.id)}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              selectedGoal === goal.id
                ? 'border-purple-600 bg-purple-50 shadow-lg'
                : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
            }`}
          >
            <div className="text-5xl mb-3">{goal.icon}</div>
            <h3 className="font-bold text-gray-900 mb-2">{goal.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
            <div className="space-y-1">
              {goal.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="text-purple-600">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Quick Setup</h2>
        <p className="text-lg text-gray-600">
          Tell us a bit about yourself to personalize your experience
        </p>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Business/Brand Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g., Acme Inc"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will appear on your websites, emails, and invoices
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Business Type (Optional)
          </label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="coach">Coach/Consultant</option>
            <option value="creator">Content Creator</option>
            <option value="ecommerce">E-commerce Store</option>
            <option value="agency">Agency</option>
            <option value="educator">Educator/Teacher</option>
            <option value="freelancer">Freelancer</option>
            <option value="saas">SaaS Company</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Pro Tip</h4>
              <p className="text-sm text-gray-700">
                You can change these settings anytime from your account settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Load Sample Data?</h2>
        <p className="text-lg text-gray-600">
          We can pre-populate your account with examples to help you explore
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setLoadSampleData(true)}
          className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
            loadSampleData
              ? 'border-purple-600 bg-purple-50 shadow-lg'
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">✅</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Yes, load sample data (Recommended)
              </h3>
              <p className="text-gray-600 mb-4">
                We'll create example pages, products, and content so you can see how everything works
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Sample website pages
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Demo products/courses
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Example contacts
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Template emails
                </div>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setLoadSampleData(false)}
          className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
            !loadSampleData
              ? 'border-purple-600 bg-purple-50 shadow-lg'
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">📝</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No, I'll start from scratch
              </h3>
              <p className="text-gray-600">
                Begin with a clean slate and build everything yourself
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              Sample data can be deleted anytime. It's just there to help you learn the platform faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-8xl mb-6">🎉</div>
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        You're All Set!
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        Your account is ready to go. Here's what happens next:
      </p>

      <div className="grid gap-4 text-left mb-8">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🎯</div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">1. Take a Quick Tour</h3>
              <p className="text-gray-700">
                We'll show you around your dashboard and highlight key features
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">✅</div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">2. Complete Your Quick Wins</h3>
              <p className="text-gray-700">
                Follow our checklist to get your first results in minutes
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🚀</div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">3. Start Building!</h3>
              <p className="text-gray-700">
                Create your {selectedGoal === 'website' ? 'website' : selectedGoal === 'courses' ? 'first course' : selectedGoal === 'ecommerce' ? 'store' : 'pipeline'} and launch to the world
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🎁</div>
          <div className="flex-1 text-left">
            <h4 className="font-bold text-gray-900 mb-2">Bonus: Invite Friends, Get Rewards!</h4>
            <p className="text-gray-700">
              Share your referral link and get 1 month FREE for every friend who joins.
              Refer 50 people = Lifetime FREE access!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-purple-600">The dAItaniverse</div>
          </div>
          <button
            onClick={handleSkipAll}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Skip for now
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-12">
          {renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Back
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>

          <button
            onClick={handleNext}
            disabled={loading || (currentStep === 2 && !selectedGoal)}
            className={`px-8 py-3 rounded-lg font-bold transition-colors ${
              loading || (currentStep === 2 && !selectedGoal)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : currentStep === totalSteps
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Setting up...
              </div>
            ) : currentStep === totalSteps ? (
              'Let\'s Go! 🚀'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

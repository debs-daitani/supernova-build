/**
 * Phase 2BF: Signup Flow
 * Multi-step signup experience
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import signupService from '../../services/signup';

export default function SignupFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    agreeToTerms: false,
    primaryGoal: '',
    industry: '',
    referralSource: '',
    selectedPlan: searchParams.get('plan') || 'trial',
    utmSource: searchParams.get('utm_source') || '',
    utmMedium: searchParams.get('utm_medium') || '',
    utmCampaign: searchParams.get('utm_campaign') || ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  useEffect(() => {
    // Initialize or resume signup session
    const sid = signupService.getOrCreateSessionId();
    setSessionId(sid);

    // Track page view
    signupService.trackStepCompletion(1, { sessionId: sid });
  }, []);

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(signupService.validatePassword(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    if (step === 2) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms';
      }
    }

    if (step === 3) {
      if (!formData.primaryGoal) newErrors.primaryGoal = 'Please select your main goal';
      if (!formData.industry) newErrors.industry = 'Please select your industry';
      if (!formData.referralSource) newErrors.referralSource = 'Please tell us how you found us';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);

    try {
      // Update session progress
      await signupService.updateSignupSession(sessionId, {
        currentStep: currentStep + 1,
        ...formData
      });

      // Track step completion
      signupService.trackStepCompletion(currentStep + 1, { sessionId });

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error updating signup session:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSelectPlan = async (plan) => {
    setFormData(prev => ({ ...prev, selectedPlan: plan }));

    if (plan === 'trial') {
      // Create trial account
      await handleCompleteTrial();
    } else {
      // Go to payment step
      setCurrentStep(5);
    }
  };

  const handleCompleteTrial = async () => {
    setLoading(true);

    try {
      const result = await signupService.completeSignup({
        ...formData,
        sessionId,
        planType: 'trial'
      });

      // Track conversion
      signupService.trackSignupComplete({ ...formData, planType: 'trial' });

      // Clear session
      signupService.clearSessionId();

      // Show success and redirect
      navigate('/signup/success?plan=trial');
    } catch (error) {
      console.error('Error completing signup:', error);
      alert(error.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePaid = async (paymentMethod) => {
    setLoading(true);

    try {
      const result = await signupService.submitPayment({
        ...formData,
        sessionId,
        planType: formData.selectedPlan,
        paymentMethod
      });

      // Track conversion
      signupService.trackSignupComplete({ ...formData, planType: formData.selectedPlan });

      // Clear session
      signupService.clearSessionId();

      // Show success and redirect
      navigate('/signup/success?plan=pro');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    const steps = ['Email', 'Details', 'About You', 'Plan'];
    const progress = (currentStep / 4) * 100;

    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`text-sm font-medium ${
                index < currentStep
                  ? 'text-purple-600'
                  : index === currentStep - 1
                  ? 'text-purple-600'
                  : 'text-gray-400'
              }`}
            >
              {index < currentStep && '✓ '}
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Step {currentStep} of 4
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">The dAItaniverse</h1>
          <p className="text-gray-600 mt-2">Join 500+ female entrepreneurs</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {currentStep < 5 && renderProgressBar()}

          {/* Step 1: Email */}
          {currentStep === 1 && (
            <Step1Email
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              onNext={handleNext}
              loading={loading}
            />
          )}

          {/* Step 2: Name & Password */}
          {currentStep === 2 && (
            <Step2Credentials
              formData={formData}
              errors={errors}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              passwordStrength={passwordStrength}
              onChange={handleInputChange}
              onNext={handleNext}
              onBack={handleBack}
              loading={loading}
            />
          )}

          {/* Step 3: Onboarding */}
          {currentStep === 3 && (
            <Step3Onboarding
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              onNext={handleNext}
              onBack={handleBack}
              loading={loading}
            />
          )}

          {/* Step 4: Plan Selection */}
          {currentStep === 4 && (
            <Step4PlanSelection
              formData={formData}
              onSelectPlan={handleSelectPlan}
              onBack={handleBack}
              loading={loading}
            />
          )}

          {/* Step 5: Payment (for paid plans) */}
          {currentStep === 5 && (
            <Step5Payment
              formData={formData}
              onComplete={handleCompletePaid}
              onBack={handleBack}
              loading={loading}
            />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

// ============================================
// STEP 1: EMAIL
// ============================================
function Step1Email({ formData, errors, onChange, onNext, loading }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Start Your FREE 7-Day Trial
        </h2>
        <p className="text-gray-600 mt-2">
          No credit card required. Cancel anytime.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Your Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="you@email.com"
          className={`w-full px-4 py-3 border ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          We'll never spam you. Promise.
        </p>
      </div>

      <button
        onClick={onNext}
        disabled={loading}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold disabled:bg-gray-300"
      >
        {loading ? 'Please wait...' : 'Continue →'}
      </button>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-green-600">✅</span>
          <span>Access all 40+ tools instantly</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-green-600">✅</span>
          <span>No credit card needed</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-green-600">✅</span>
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 2: CREDENTIALS
// ============================================
function Step2Credentials({
  formData,
  errors,
  showPassword,
  setShowPassword,
  passwordStrength,
  onChange,
  onNext,
  onBack,
  loading
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Great! Now Tell Us Your Name
        </h2>
        <p className="text-gray-600 mt-1">
          Email: <span className="font-medium">{formData.email}</span> ✓
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            placeholder="Sarah"
            className={`w-full px-4 py-2 border ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-purple-600`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            placeholder="Mitchell"
            className={`w-full px-4 py-2 border ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-purple-600`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Create Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            placeholder="At least 8 characters"
            className={`w-full px-4 py-2 border ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-purple-600`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
        {passwordStrength && !errors.password && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    passwordStrength.color === 'red'
                      ? 'bg-red-500'
                      : passwordStrength.color === 'orange'
                      ? 'bg-orange-500'
                      : passwordStrength.color === 'yellow'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">{passwordStrength.label}</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => onChange('agreeToTerms', e.target.checked)}
            className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
          />
          <span className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="/terms" target="_blank" className="text-purple-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" className="text-purple-600 hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-semibold"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold disabled:bg-gray-300"
        >
          {loading ? 'Creating...' : 'Create Account →'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// STEP 3: ONBOARDING
// ============================================
function Step3Onboarding({ formData, errors, onChange, onNext, onBack, loading }) {
  const goals = signupService.getGoalOptions();
  const industries = signupService.getIndustryOptions();
  const referrals = signupService.getReferralOptions();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Almost There! 3 Quick Questions
        </h2>
        <p className="text-gray-600 mt-1">
          This helps us personalize your experience.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          What's your main goal? *
        </label>
        <div className="space-y-2">
          {goals.map((goal) => (
            <label
              key={goal.value}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.primaryGoal === goal.value
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="goal"
                value={goal.value}
                checked={formData.primaryGoal === goal.value}
                onChange={(e) => onChange('primaryGoal', e.target.value)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-xl">{goal.icon}</span>
              <span className="font-medium text-gray-900">{goal.label}</span>
            </label>
          ))}
        </div>
        {errors.primaryGoal && (
          <p className="text-red-500 text-xs mt-1">{errors.primaryGoal}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          What industry are you in? *
        </label>
        <select
          value={formData.industry}
          onChange={(e) => onChange('industry', e.target.value)}
          className={`w-full px-4 py-2 border ${
            errors.industry ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-purple-600`}
        >
          <option value="">Select your industry...</option>
          {industries.map((industry) => (
            <option key={industry.value} value={industry.value}>
              {industry.label}
            </option>
          ))}
        </select>
        {errors.industry && (
          <p className="text-red-500 text-xs mt-1">{errors.industry}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Where did you hear about us? *
        </label>
        <select
          value={formData.referralSource}
          onChange={(e) => onChange('referralSource', e.target.value)}
          className={`w-full px-4 py-2 border ${
            errors.referralSource ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-purple-600`}
        >
          <option value="">Select an option...</option>
          {referrals.map((referral) => (
            <option key={referral.value} value={referral.value}>
              {referral.label}
            </option>
          ))}
        </select>
        {errors.referralSource && (
          <p className="text-red-500 text-xs mt-1">{errors.referralSource}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-semibold"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold disabled:bg-gray-300"
        >
          {loading ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// STEP 4: PLAN SELECTION
// ============================================
function Step4PlanSelection({ formData, onSelectPlan, onBack, loading }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Last Step: Choose Your Plan
        </h2>
      </div>

      {/* Free Trial */}
      <div className="border-2 border-purple-600 rounded-xl p-6 bg-purple-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            7-Day FREE Trial
          </h3>
          <span className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">
            ⭐ RECOMMENDED
          </span>
        </div>

        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✅</span>
            Access all 40+ tools
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✅</span>
            No credit card required
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✅</span>
            Cancel anytime
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✅</span>
            Upgrade to paid anytime
          </li>
        </ul>

        <button
          onClick={() => onSelectPlan('trial')}
          disabled={loading}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold disabled:bg-gray-300"
        >
          {loading ? 'Creating Account...' : 'START FREE TRIAL →'}
        </button>
      </div>

      {/* Pro Plan */}
      <div className="border-2 border-gray-300 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          PRO - £26/Month
        </h3>

        <p className="text-gray-600 mb-4">Everything in trial, plus:</p>

        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✅</span>
            Priority support
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✅</span>
            No limitations
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✅</span>
            SUPERNova AI included
          </li>
        </ul>

        <p className="text-sm text-gray-600 mb-4">
          First month: <span className="font-semibold">£26</span>
          <br />
          Then: £26/month (cancel anytime)
        </p>

        <button
          onClick={() => onSelectPlan('pro')}
          disabled={loading}
          className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors font-semibold"
        >
          START PAID PLAN →
        </button>
      </div>

      <p className="text-center text-sm text-gray-600">
        💯 30-Day Money-Back Guarantee
      </p>

      <button
        onClick={onBack}
        className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-semibold"
      >
        ← Back
      </button>
    </div>
  );
}

// ============================================
// STEP 5: PAYMENT
// ============================================
function Step5Payment({ formData, onComplete, onBack, loading }) {
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
    postcode: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(paymentMethod);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Complete Your Order
        </h2>
        <p className="text-gray-600 mt-1">
          Pro Plan - £26/month
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={paymentMethod.cardNumber}
              onChange={(e) =>
                setPaymentMethod({ ...paymentMethod, cardNumber: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MM/YY
              </label>
              <input
                type="text"
                placeholder="12/25"
                value={paymentMethod.expiry}
                onChange={(e) =>
                  setPaymentMethod({ ...paymentMethod, expiry: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVC
              </label>
              <input
                type="text"
                placeholder="123"
                value={paymentMethod.cvc}
                onChange={(e) =>
                  setPaymentMethod({ ...paymentMethod, cvc: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="Sarah Mitchell"
              value={paymentMethod.name}
              onChange={(e) =>
                setPaymentMethod({ ...paymentMethod, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Postcode
            </label>
            <input
              type="text"
              placeholder="SW1A 1AA"
              value={paymentMethod.postcode}
              onChange={(e) =>
                setPaymentMethod({ ...paymentMethod, postcode: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Pro Plan (Monthly)</span>
            <span className="font-semibold">£26.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="font-semibold">£0.00</span>
          </div>
          <div className="border-t border-gray-300 pt-2 flex justify-between text-lg">
            <span className="font-bold">Total Today:</span>
            <span className="font-bold">£26.00</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Then £26/month. Cancel anytime.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold disabled:bg-gray-300"
        >
          {loading ? 'Processing...' : 'Complete Purchase →'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-semibold"
        >
          ← Back
        </button>
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm text-gray-600">
          🔒 Secure payment powered by Stripe
        </p>
        <p className="text-sm text-gray-600">
          💯 30-day money-back guarantee
        </p>
      </div>
    </form>
  );
}

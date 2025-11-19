/**
 * Phase 2BG: Upgrade Modal
 * Modal for upgrading from trial to paid plan
 */

import React, { useState } from 'react';
import billingService from '../../services/billing';

export default function UpgradeModal({ isOpen, onClose, onSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState('pro_monthly');
  const [step, setStep] = useState('select-plan'); // 'select-plan', 'payment', 'processing', 'success'
  const [error, setError] = useState(null);

  const plans = billingService.getAvailablePlans().filter(p => p.id !== 'trial');

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    setError(null);
  };

  const handleContinueToPayment = () => {
    setStep('payment');
  };

  const handleBackToPlanSelection = () => {
    setStep('select-plan');
    setError(null);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    try {
      setStep('processing');
      setError(null);

      // Note: In production, you would:
      // 1. Load Stripe.js
      // 2. Create payment method with Stripe Elements
      // 3. Call billingService.createSubscription()

      // For now, we'll show a placeholder message
      console.log('Upgrading to plan:', selectedPlan);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStep('success');

      // Track upgrade
      const planPrice = billingService.getPlanPrice(selectedPlan);
      billingService.trackUpgrade(selectedPlan, planPrice);

      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err.response?.data?.error || 'Failed to process upgrade. Please try again.');
      setStep('payment');
    }
  };

  const handleClose = () => {
    if (step === 'processing') return; // Prevent closing during processing
    setStep('select-plan');
    setSelectedPlan('pro_monthly');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'select-plan' && 'Choose Your Plan'}
            {step === 'payment' && 'Payment Details'}
            {step === 'processing' && 'Processing...'}
            {step === 'success' && 'Success!'}
          </h2>
          {step !== 'processing' && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Plan Selection */}
          {step === 'select-plan' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all ${
                      selectedPlan === plan.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    } ${plan.popular ? 'ring-2 ring-purple-400' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="px-4 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="px-4 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <div className="mt-3">
                        {plan.monthlyEquivalent ? (
                          <div>
                            <div className="text-3xl font-bold text-gray-900">
                              £{plan.monthlyEquivalent.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">per month</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Billed £{plan.price} annually
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-3xl font-bold text-gray-900">
                              {plan.interval === 'lifetime' ? '£' + plan.price : '£' + plan.price}
                            </div>
                            <div className="text-sm text-gray-600">
                              {plan.interval === 'lifetime' ? 'one-time' : `per ${plan.interval}`}
                            </div>
                          </div>
                        )}
                      </div>
                      {plan.savings && (
                        <div className="mt-2 text-sm font-semibold text-green-600">
                          {plan.savings.display}
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {selectedPlan === plan.id && (
                      <div className="absolute inset-0 border-2 border-purple-600 rounded-xl pointer-events-none"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinueToPayment}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Form */}
          {step === 'payment' && (
            <div className="space-y-6">
              {/* Selected Plan Summary */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Selected Plan</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{selectedPlanData?.name}</p>
                    <p className="text-sm text-gray-600">
                      {billingService.getPlanPriceDisplay(selectedPlan)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      £{selectedPlanData?.price}
                    </div>
                    {selectedPlanData?.savings && (
                      <div className="text-sm text-green-600 font-semibold">
                        {selectedPlanData.savings.display}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Payment Form */}
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Card Information
                  </label>
                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-3">
                      Note: Stripe integration would go here in production
                    </p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Card number"
                        className="w-full px-4 py-2 border rounded-lg"
                        disabled
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM / YY"
                          className="px-4 py-2 border rounded-lg"
                          disabled
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          className="px-4 py-2 border rounded-lg"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">🔒</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Secure payment powered by Stripe
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Your payment information is encrypted and secure. We never store your card details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleBackToPlanSelection}
                    className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Complete Upgrade - £{selectedPlanData?.price}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing your upgrade...</h3>
              <p className="text-gray-600">Please wait while we set up your subscription.</p>
              <p className="text-sm text-gray-500 mt-4">This may take a few moments.</p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Successful!</h3>
              <p className="text-gray-600 mb-6">
                Welcome to {selectedPlanData?.name}! You now have access to all PRO features.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-sm text-green-800">
                  A receipt has been sent to your email address.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

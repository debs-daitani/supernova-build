/**
 * Phase 2BG: Change Plan / Subscription Management
 * Change subscription plan or cancel subscription
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import billingService from '../../services/billing';

export default function ChangePlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const plans = billingService.getAvailablePlans().filter(p => p.id !== 'trial');

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await billingService.getSubscription();
      setSubscription(data);
      setSelectedPlan(data.planType);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (selectedPlan === subscription.planType) {
      alert('This is already your current plan');
      return;
    }

    if (!confirm(`Change your plan to ${billingService.getPlanDisplayName(selectedPlan)}?`)) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await billingService.updateSubscription(selectedPlan);

      alert('Plan changed successfully!');
      loadSubscription();

    } catch (err) {
      console.error('Change plan error:', err);
      setError(err.response?.data?.error || 'Failed to change plan');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelReason) {
      alert('Please select a cancellation reason');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await billingService.cancelSubscription(cancelImmediately, cancelReason);

      billingService.trackCancellation(cancelReason);

      alert(
        cancelImmediately
          ? 'Subscription canceled. Your access has ended.'
          : 'Subscription will cancel at the end of your billing period. You\'ll keep access until then.'
      );

      setShowCancelModal(false);
      navigate('/billing');

    } catch (err) {
      console.error('Cancel subscription error:', err);
      setError(err.response?.data?.error || 'Failed to cancel subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivate = async () => {
    if (!confirm('Reactivate your subscription?')) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await billingService.reactivateSubscription();

      alert('Subscription reactivated successfully!');
      loadSubscription();

    } catch (err) {
      console.error('Reactivate error:', err);
      setError(err.response?.data?.error || 'Failed to reactivate subscription');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  const currentPlan = plans.find(p => p.id === subscription?.planType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Change Plan</h1>
              <p className="mt-1 text-gray-600">Upgrade, downgrade, or cancel your subscription</p>
            </div>
            <button
              onClick={() => navigate('/billing')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              ← Back to Billing
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Current Plan */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {billingService.getPlanDisplayName(subscription?.planType)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {billingService.getPlanPriceDisplay(subscription?.planType)}
              </p>
              {subscription?.currentPeriodEnd && (
                <p className="text-sm text-gray-600 mt-1">
                  {subscription?.cancelAtPeriodEnd ? 'Ends' : 'Renews'} on {billingService.formatDate(subscription.currentPeriodEnd)}
                </p>
              )}
            </div>
            {subscription?.cancelAtPeriodEnd && (
              <button
                onClick={handleReactivate}
                disabled={processing}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Reactivate'}
              </button>
            )}
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Subscription ending:</strong> Your subscription will cancel on{' '}
                {billingService.formatDate(subscription.currentPeriodEnd)}. You'll keep access until then.
              </p>
            </div>
          )}
        </div>

        {/* Available Plans */}
        {!subscription?.cancelAtPeriodEnd && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Choose a Different Plan</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  } ${plan.id === subscription?.planType ? 'ring-2 ring-green-400' : ''}`}
                >
                  {plan.id === subscription?.planType && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                        CURRENT PLAN
                      </span>
                    </div>
                  )}
                  {plan.popular && plan.id !== subscription?.planType && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                        POPULAR
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

                  <ul className="space-y-2">
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleChangePlan}
                disabled={processing || selectedPlan === subscription?.planType}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Change Plan'}
              </button>
            </div>

            {selectedPlan !== subscription?.planType && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> When you change plans, you'll be charged or credited a prorated amount based on the time remaining in your current billing period.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Cancel Subscription */}
        {!subscription?.cancelAtPeriodEnd && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cancel Subscription</h2>
            <p className="text-sm text-gray-600 mb-4">
              We'd hate to see you go, but you can cancel your subscription at any time.
            </p>
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-6 py-2 border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancel Subscription</h2>

            <p className="text-gray-700 mb-6">
              We're sorry to see you go! Before you cancel, please let us know why you're leaving.
            </p>

            <div className="space-y-3 mb-6">
              {billingService.getCancellationReasons().map((reason) => (
                <label
                  key={reason.value}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason.value}
                    checked={cancelReason === reason.value}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="text-purple-600"
                  />
                  <span className="text-gray-900">{reason.label}</span>
                </label>
              ))}
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cancelImmediately}
                  onChange={(e) => setCancelImmediately(e.target.checked)}
                  className="rounded text-purple-600"
                />
                <span className="text-sm text-gray-700">
                  Cancel immediately (otherwise you'll keep access until {billingService.formatDate(subscription?.currentPeriodEnd)})
                </span>
              </label>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setCancelImmediately(false);
                  setError(null);
                }}
                disabled={processing}
                className="flex-1 px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={processing || !cancelReason}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

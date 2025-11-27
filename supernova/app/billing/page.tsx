'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatAmount, getSubscriptionStatusDisplay } from '@/lib/stripe';

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/stripe/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      const data = await response.json();
      setSubscriptions(data.subscriptions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      const response = await fetch(
        `/api/stripe/subscriptions/${subscriptionId}/cancel`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to cancel subscription');
      await fetchSubscriptions();
      alert('Subscription will cancel at the end of the billing period');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(
        `/api/stripe/subscriptions/${subscriptionId}/cancel`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to reactivate subscription');
      await fetchSubscriptions();
      alert('Subscription reactivated successfully');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleManageWithStripe = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      if (!response.ok) throw new Error('Failed to create portal session');
      const data = await response.json();
      window.location.href = data.url;
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const activeSubscription = subscriptions.find(
    (sub) => sub.status === 'ACTIVE' || sub.status === 'TRIALING'
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Active Subscription Card */}
      {activeSubscription ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'Supernova, sans-serif' }}
              >
                Your Subscription
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeSubscription.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {activeSubscription.status}
                </span>
              </div>
            </div>
            <button
              onClick={handleManageWithStripe}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              style={{ fontFamily: 'Josefin Sans, sans-serif' }}
            >
              Manage via Stripe
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Current Period</p>
              <p className="text-white font-medium">
                {new Date(activeSubscription.currentPeriodStart).toLocaleDateString()} -{' '}
                {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Next Billing Date</p>
              <p className="text-white font-medium">
                {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          </div>

          {activeSubscription.trialEnd && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-400 text-sm">
                Trial ends on {new Date(activeSubscription.trialEnd).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <Link
              href="/billing/plans"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-medium transition-all"
              style={{ fontFamily: 'Josefin Sans, sans-serif' }}
            >
              Upgrade Plan
            </Link>
            {activeSubscription.cancelAtPeriodEnd ? (
              <button
                onClick={() => handleReactivateSubscription(activeSubscription.id)}
                className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-medium transition-all"
                style={{ fontFamily: 'Josefin Sans, sans-serif' }}
              >
                Reactivate Subscription
              </button>
            ) : (
              <button
                onClick={() => handleCancelSubscription(activeSubscription.id)}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-all"
                style={{ fontFamily: 'Josefin Sans, sans-serif' }}
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: 'Supernova, sans-serif' }}
          >
            No Active Subscription
          </h2>
          <p className="text-gray-400 mb-6" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
            Choose a plan to get started with dAItaniverse
          </p>
          <Link
            href="/billing/plans"
            className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-medium transition-all"
            style={{ fontFamily: 'Josefin Sans, sans-serif' }}
          >
            View Plans
          </Link>
        </div>
      )}

      {/* All Subscriptions */}
      {subscriptions.length > 1 && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3
            className="text-xl font-bold mb-4"
            style={{ fontFamily: 'Supernova, sans-serif' }}
          >
            Subscription History
          </h3>
          <div className="space-y-4">
            {subscriptions
              .filter((sub) => sub.id !== activeSubscription?.id)
              .map((sub: any) => (
                <div
                  key={sub.id}
                  className="flex justify-between items-center p-4 bg-white/5 rounded-xl"
                >
                  <div>
                    <p className="font-medium">{sub.status}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      sub.status === 'CANCELED'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

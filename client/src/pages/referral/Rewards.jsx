import React, { useState, useEffect } from 'react';
import referralsService from '../../services/referrals';

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [totals, setTotals] = useState({ pending: 0, issued: 0, redeemed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const data = await referralsService.getRewards();
      setRewards(data.rewards || []);
      setTotals(data.totals);
    } catch (error) {
      console.error('Failed to load rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId) => {
    if (!window.confirm('Redeem this reward and apply it to your account?')) return;

    try {
      await referralsService.redeemReward(rewardId);
      alert('Reward redeemed successfully!');
      loadRewards();
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      issued: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ready to Redeem' },
      redeemed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Redeemed' }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Your Rewards</h1>
            <p className="text-2xl text-purple-100">
              Track and redeem your referral earnings
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Earned</div>
            <div className="text-4xl font-bold text-purple-600">
              £{totals.total?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-500 mt-1">All time</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Pending</div>
            <div className="text-4xl font-bold text-yellow-600">
              £{totals.pending?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Awaiting qualification</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Available</div>
            <div className="text-4xl font-bold text-green-600">
              £{totals.issued?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Ready to use</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Redeemed</div>
            <div className="text-4xl font-bold text-gray-600">
              £{totals.redeemed?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Already used</div>
          </div>
        </div>

        {/* Actions */}
        {totals.issued > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">You have £{totals.issued.toFixed(2)} ready to use!</h3>
                <p className="text-gray-700">
                  {totals.issued >= 50
                    ? 'You can apply it to your subscription or withdraw to PayPal'
                    : 'Apply it to your subscription to extend your free months'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => alert('Applied to subscription!')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Apply to Subscription
                </button>
                {totals.issued >= 50 && (
                  <button
                    onClick={() => alert('Withdrawal initiated - check email for PayPal details')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Withdraw to PayPal
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rewards List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-900">Reward History</h2>
          </div>

          {rewards.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No rewards yet</h3>
              <p className="text-gray-600 mb-6">Start referring to earn your first reward!</p>
              <button
                onClick={() => window.location.href = '/referrals'}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Go to Referral Dashboard
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rewards.map((reward) => (
                <div key={reward.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{reward.description}</h3>
                        {getStatusBadge(reward.status)}
                        {reward.milestone && (
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                            🎖️ Milestone Bonus
                          </span>
                        )}
                      </div>

                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {reward.rewardType === 'free_month' && `${Math.floor((reward.amount || 0) / 26)} Month${Math.floor((reward.amount || 0) / 26) > 1 ? 's' : ''} Free`}
                        {reward.rewardType === 'credit' && `£${reward.amount?.toFixed(2)} Credit`}
                        {reward.rewardType === 'cash' && `£${reward.amount?.toFixed(2)} Cash`}
                        {reward.rewardType === 'lifetime_free' && '🌟 Lifetime FREE'}
                      </div>

                      {reward.referral?.referred && (
                        <div className="text-sm text-gray-600">
                          From: <span className="font-medium">{reward.referral.referred.name}</span>
                        </div>
                      )}

                      <div className="flex gap-4 text-sm text-gray-500 mt-2">
                        <div>Earned: {new Date(reward.earnedAt).toLocaleDateString()}</div>
                        {reward.issuedAt && (
                          <div>Issued: {new Date(reward.issuedAt).toLocaleDateString()}</div>
                        )}
                        {reward.redeemedAt && (
                          <div>Redeemed: {new Date(reward.redeemedAt).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>

                    {reward.status === 'issued' && (
                      <button
                        onClick={() => handleRedeem(reward.id)}
                        className="ml-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Redeem
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

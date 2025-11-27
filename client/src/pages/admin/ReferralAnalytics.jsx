import React, { useState, useEffect } from 'react';
import referralsService from '../../services/referrals';

export default function ReferralAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await referralsService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Analytics</h1>
          <p className="text-gray-600">Monitor referral program performance</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Referrals</div>
            <div className="text-4xl font-bold text-purple-600">
              {analytics?.overview.totalReferrals || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">All time</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Qualified</div>
            <div className="text-4xl font-bold text-green-600">
              {analytics?.overview.qualifiedReferrals || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {analytics?.overview.conversionRate}% conversion
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Rewards Issued</div>
            <div className="text-4xl font-bold text-yellow-600">
              £{analytics?.overview.totalRewardsIssued?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Total value</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Avg per User</div>
            <div className="text-4xl font-bold text-blue-600">
              {analytics?.overview.avgReferralsPerUser?.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Referrals</div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Conversion Funnel</h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Link Clicks</span>
                <span className="text-2xl font-bold text-gray-900">
                  {analytics?.funnel.clicks?.toLocaleString() || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-blue-600 h-4 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Signups</span>
                <span className="text-2xl font-bold text-gray-900">
                  {analytics?.funnel.signups?.toLocaleString() || 0}
                  <span className="text-sm text-gray-500 ml-2">
                    ({analytics?.funnel.clicks > 0
                      ? ((analytics?.funnel.signups / analytics?.funnel.clicks) * 100).toFixed(1)
                      : 0}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-purple-600 h-4 rounded-full"
                  style={{
                    width: `${analytics?.funnel.clicks > 0
                      ? (analytics?.funnel.signups / analytics?.funnel.clicks) * 100
                      : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Conversions (Paid)</span>
                <span className="text-2xl font-bold text-green-600">
                  {analytics?.funnel.conversions?.toLocaleString() || 0}
                  <span className="text-sm text-gray-500 ml-2">
                    ({analytics?.funnel.signups > 0
                      ? ((analytics?.funnel.conversions / analytics?.funnel.signups) * 100).toFixed(1)
                      : 0}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full"
                  style={{
                    width: `${analytics?.funnel.signups > 0
                      ? (analytics?.funnel.conversions / analytics?.funnel.signups) * 100
                      : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Referrers */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-bold text-gray-900">Top 10 Referrers</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {analytics?.topReferrers?.map((referrer, index) => (
                <div key={referrer.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{referrer.user.name}</div>
                        <div className="text-sm text-gray-500">{referrer.user.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{referrer.conversions}</div>
                      <div className="text-xs text-gray-500">{referrer.clicks} clicks</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Referrals */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-bold text-gray-900">Recent Referrals</h2>
            </div>

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {analytics?.recentReferrals?.map((referral) => (
                <div key={referral.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">
                      {referral.referrer.name} → {referral.referred.name}
                    </div>
                    {referral.qualified ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                        Qualified
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(referral.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

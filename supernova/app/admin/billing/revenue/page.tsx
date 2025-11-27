'use client';

import { useState, useEffect } from 'react';
import { formatAmount } from '@/lib/stripe';

export default function AdminRevenuePage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/stripe/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: 'Supernova, sans-serif' }}
      >
        Revenue Dashboard
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="backdrop-blur-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl border border-white/10 p-6">
          <p className="text-sm text-gray-400 mb-2">Monthly Recurring Revenue</p>
          <p className="text-3xl font-bold" style={{ fontFamily: 'Supernova, sans-serif' }}>
            £{analytics.mrr.toFixed(2)}
          </p>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-white/10 p-6">
          <p className="text-sm text-gray-400 mb-2">Total Revenue</p>
          <p className="text-3xl font-bold" style={{ fontFamily: 'Supernova, sans-serif' }}>
            £{analytics.totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-white/10 p-6">
          <p className="text-sm text-gray-400 mb-2">This Month</p>
          <p className="text-3xl font-bold" style={{ fontFamily: 'Supernova, sans-serif' }}>
            £{analytics.revenueThisMonth.toFixed(2)}
          </p>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border border-white/10 p-6">
          <p className="text-sm text-gray-400 mb-2">Active Subscriptions</p>
          <p className="text-3xl font-bold" style={{ fontFamily: 'Supernova, sans-serif' }}>
            {analytics.activeSubscriptions}
          </p>
        </div>
      </div>

      {/* Subscription Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
          <h2
            className="text-xl font-bold mb-4"
            style={{ fontFamily: 'Supernova, sans-serif' }}
          >
            Subscription Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.subscriptionsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="font-medium">{status}</span>
                <span className="text-2xl font-bold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
          <h2
            className="text-xl font-bold mb-4"
            style={{ fontFamily: 'Supernova, sans-serif' }}
          >
            Key Metrics
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Churn Rate (30 days)</p>
              <p className="text-2xl font-bold">{analytics.churnRate}%</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Total Subscriptions</p>
              <p className="text-2xl font-bold">{analytics.totalSubscriptions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {analytics.topProducts && analytics.topProducts.length > 0 && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
          <h2
            className="text-xl font-bold mb-4"
            style={{ fontFamily: 'Supernova, sans-serif' }}
          >
            Top Products
          </h2>
          <div className="space-y-3">
            {analytics.topProducts.map((product: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-medium">{product.productName}</p>
                  <p className="text-sm text-gray-400">{product.subscribers} subscribers</p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                      style={{
                        width: `${(product.subscribers / analytics.activeSubscriptions) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

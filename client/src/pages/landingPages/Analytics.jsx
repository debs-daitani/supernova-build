/**
 * Phase 2BA: Landing Page System
 * Analytics Dashboard - Track page performance
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import landingPagesService from '../../services/landing-pages';

export default function LandingPageAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pageData, analyticsData] = await Promise.all([
        landingPagesService.getPage(id),
        landingPagesService.getAnalytics(id)
      ]);
      setPage(pageData.page);
      setAnalytics(analyticsData.analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      alert('Failed to load analytics');
      navigate('/landing-pages');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const { overview, deviceBreakdown, sources } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/landing-pages')}
          className="text-purple-600 hover:text-purple-700 mb-2"
        >
          ← Back to Landing Pages
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{page.title} - Analytics</h1>
        <p className="text-gray-600 mt-1">Track your landing page performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Views"
          value={overview.totalViews}
          icon="👁️"
          color="blue"
        />
        <StatCard
          label="Unique Visitors"
          value={overview.uniqueViews}
          icon="👥"
          color="green"
        />
        <StatCard
          label="Conversions"
          value={overview.totalConversions}
          icon="✅"
          color="purple"
        />
        <StatCard
          label="Conversion Rate"
          value={`${overview.conversionRate.toFixed(1)}%`}
          icon="📈"
          color="indigo"
        />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Engagement</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Avg. Time on Page</span>
                <span className="font-semibold">{Math.floor(overview.avgTimeOnPage / 60)}m {overview.avgTimeOnPage % 60}s</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Avg. Scroll Depth</span>
                <span className="font-semibold">{overview.avgScrollDepth}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${overview.avgScrollDepth}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Device Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(deviceBreakdown).map(([device, count]) => (
              <div key={device}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 capitalize">{device}</span>
                  <span className="text-sm font-semibold">{count} ({((count / overview.totalViews) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / overview.totalViews) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Traffic Sources</h3>
        <div className="space-y-3">
          {Object.entries(sources)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{source}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(count / overview.totalViews) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-16 text-right">{count} visits</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-3">💡 Optimization Tips</h3>
        <ul className="space-y-2 text-sm text-purple-800">
          {overview.avgScrollDepth < 50 && (
            <li>⚠️ Low scroll depth - consider moving your CTA higher on the page</li>
          )}
          {overview.avgTimeOnPage < 30 && (
            <li>⚠️ Short time on page - your content might not be engaging enough</li>
          )}
          {overview.conversionRate < 2 && (
            <li>⚠️ Low conversion rate - test different headlines or CTAs with A/B testing</li>
          )}
          {overview.conversionRate >= 5 && (
            <li>✅ Great conversion rate! Consider duplicating this page for other campaigns</li>
          )}
        </ul>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className={`text-2xl ${colorClasses[color]?.split(' ')[1] || ''}`}>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

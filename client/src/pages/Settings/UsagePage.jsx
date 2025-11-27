/**
 * UsagePage Component
 * Shows user their current usage vs limits in settings
 */

import { useState, useEffect } from 'react';

export default function UsagePage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/membership/my-tier');
      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }
      const data = await response.json();
      setUsage(data);
    } catch (err) {
      console.error('Error fetching usage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Usage</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const getPercentage = (current, limit) => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage < 50) return 'green';
    if (percentage < 80) return 'yellow';
    return 'red';
  };

  return (
    <div className="max-w-4xl mx-auto p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Usage & Limits</h1>
        <p className="text-gray-600">
          Current plan:{' '}
          <span className="font-bold text-orange-500">{usage.tier.name}</span>
          {usage.tier.priceMonthly > 0 && (
            <span className="text-gray-500 ml-2">
              (£{usage.tier.priceMonthly}/month)
            </span>
          )}
        </p>
      </div>

      {/* Usage meters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Current Usage</h2>

        <div className="space-y-6">
          {Object.entries(usage.limits).map(([metric, limit]) => (
            <UsageMeter
              key={metric}
              metric={metric}
              limit={limit}
              getPercentage={getPercentage}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      </div>

      {/* Add-ons */}
      {usage.addOns && usage.addOns.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Active Add-Ons</h2>
          <div className="space-y-3">
            {usage.addOns.map((addOn) => (
              <div
                key={addOn.id}
                className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <span className="text-green-500 text-xl">✓</span>
                <div className="flex-1">
                  <div className="font-medium">{addOn.name}</div>
                  {addOn.extraLimit && (
                    <div className="text-sm text-gray-600">
                      +{Object.values(addOn.extraLimit)[0]} extra{' '}
                      {Object.keys(addOn.extraLimit)[0].replace(/_/g, ' ')}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => window.location.href = '/settings/addons'}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Need More?</h3>
        <p className="mb-6">
          Upgrade your plan or add extra capacity with add-ons
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => window.location.href = '/upgrade'}
            className="bg-white text-orange-500 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all"
          >
            Upgrade Plan
          </button>
          <button
            onClick={() => window.location.href = '/settings/addons'}
            className="border-2 border-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition-all"
          >
            Browse Add-Ons
          </button>
        </div>
      </div>

    </div>
  );
}

/**
 * Individual Usage Meter
 */
function UsageMeter({ metric, limit, getPercentage, getStatusColor }) {
  // Format metric name for display
  const metricName = metric
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  if (limit.unlimited) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">{metricName}</span>
          <span className="text-green-500 font-bold flex items-center gap-1">
            <span className="text-2xl">∞</span> Unlimited
          </span>
        </div>
        <div className="w-full bg-green-100 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full w-full" />
        </div>
      </div>
    );
  }

  if (limit.blocked) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-400">{metricName}</span>
          <span className="text-gray-400 text-sm">Not available in your plan</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gray-400 h-2 rounded-full w-0" />
        </div>
      </div>
    );
  }

  const percentage = getPercentage(limit.current, limit.limit);
  const color = getStatusColor(percentage);

  const colorClasses = {
    green: { bg: 'bg-green-500', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600' },
    red: { bg: 'bg-red-500', text: 'text-red-600' }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{metricName}</span>
        <span className="text-sm text-gray-600">
          {limit.current.toLocaleString()} / {limit.limit.toLocaleString()}
          {percentage >= 80 && (
            <span className={`ml-2 font-bold ${colorClasses[color].text}`}>
              ({limit.remaining} remaining)
            </span>
          )}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[color].bg} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage >= 90 && (
        <div className="mt-2 text-sm text-red-600 flex items-start gap-2">
          <span>⚠️</span>
          <span>
            You're close to your limit. Consider upgrading or purchasing an add-on.
          </span>
        </div>
      )}
      {limit.extraLimit > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          (includes +{limit.extraLimit} from add-ons)
        </div>
      )}
    </div>
  );
}

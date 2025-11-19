/**
 * UpgradeModal Component
 * Shown when user hits a limit or tries to access a locked feature
 */

import { useState, useEffect } from 'react';

export default function UpgradeModal({ feature, currentTier, onClose, limitInfo }) {
  const [recommendedTier, setRecommendedTier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (feature) {
      fetchRecommendedTier();
    } else {
      setLoading(false);
    }
  }, [feature]);

  const fetchRecommendedTier = async () => {
    try {
      const response = await fetch(`/api/membership/recommended-upgrade?feature=${feature}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendedTier(data);
      }
    } catch (error) {
      console.error('Error fetching recommended tier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    const targetTier = recommendedTier?.slug || 'supernova-lte';
    window.location.href = `/upgrade?tier=${targetTier}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-slide-up">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">
            {limitInfo ? '⚠️' : '🚀'}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {limitInfo ? 'Limit Reached' : 'Upgrade to Unlock This Feature'}
          </h2>
          <p className="text-gray-600">
            {limitInfo
              ? `You've reached your ${limitInfo.metric?.replace(/_/g, ' ')} limit`
              : `${feature} is available in higher tiers`
            }
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Current vs Required */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Your Current Plan</div>
                  <div className="font-bold text-lg">{currentTier || 'Free'}</div>
                  {limitInfo && (
                    <div className="text-sm text-gray-600 mt-1">
                      {limitInfo.current} / {limitInfo.limit} used
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Upgrade To</div>
                  <div className="font-bold text-lg text-orange-500">
                    {recommendedTier?.name || 'SUPERNova-LTE'}
                  </div>
                  {recommendedTier && (
                    <div className="text-sm text-gray-600 mt-1">
                      {recommendedTier.limits?.[limitInfo?.metric] === -1
                        ? 'Unlimited'
                        : `${recommendedTier.limits?.[limitInfo?.metric] || 'Unlimited'} limit`
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h3 className="font-bold mb-4">What you'll get with an upgrade:</h3>
              <div className="space-y-2">
                {(recommendedTier?.features || [
                  { name: 'Unlimited websites and pages', included: true },
                  { name: 'Full ecommerce suite', included: true },
                  { name: 'Course platform', included: true },
                  { name: 'Email marketing (10k/mo)', included: true },
                  { name: 'SUPERNova AI unlimited', included: true }
                ]).filter(f => f.included).slice(0, 5).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            {recommendedTier && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  {recommendedTier.priceMonthly > 0 ? (
                    <>
                      <div className="text-4xl font-bold mb-2">
                        £{recommendedTier.priceMonthly}
                        <span className="text-xl text-gray-600">/month</span>
                      </div>
                      {recommendedTier.trialDays > 0 && (
                        <div className="text-sm text-gray-600">
                          {recommendedTier.trialDays}-day free trial • Cancel anytime
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-2xl font-bold">
                      Custom Pricing
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all"
              >
                Maybe Later
              </button>
              <button
                onClick={handleUpgrade}
                className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-all transform hover:scale-105"
              >
                Upgrade Now →
              </button>
            </div>

            {/* Additional info */}
            <div className="mt-4 text-center text-sm text-gray-500">
              <button
                onClick={() => window.location.href = '/pricing'}
                className="hover:text-gray-700 underline"
              >
                View all pricing options
              </button>
            </div>
          </>
        )}

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

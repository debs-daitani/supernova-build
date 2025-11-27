import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import referralsService from '../../services/referrals';
import useAuthStore from '../../stores/authStore';

export default function ReferralDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await referralsService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralUrl = () => {
    if (!dashboard?.code) return '';
    return `${window.location.origin}/join/${dashboard.code.code}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getReferralUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const referralUrl = getReferralUrl();
    const urls = referralsService.generateShareUrls(dashboard.code.code, referralUrl);

    if (platform === 'copy') {
      copyToClipboard();
    } else {
      window.open(urls[platform], '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your referral dashboard...</p>
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
            <h1 className="text-5xl font-bold mb-4">Give 1 Month Free, Get 1 Month Free</h1>
            <p className="text-2xl text-purple-100 mb-8">
              Share The dAItaniverse with friends and earn rewards
            </p>

            {/* Referral Link */}
            {dashboard?.code && (
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 max-w-2xl mx-auto">
                <label className="block text-purple-100 text-sm font-semibold mb-2">
                  Your Unique Referral Link:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={getReferralUrl()}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 font-mono text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-purple-100 text-sm mt-3">
                  Share this link and earn 1 month free for every friend who subscribes!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">People Invited</div>
            <div className="text-4xl font-bold text-purple-600">{dashboard?.stats.clicks || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Link clicks</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Successful Signups</div>
            <div className="text-4xl font-bold text-blue-600">{dashboard?.stats.signups || 0}</div>
            <div className="text-sm text-gray-500 mt-1">New accounts created</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Active Subscribers</div>
            <div className="text-4xl font-bold text-green-600">{dashboard?.stats.conversions || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Qualified referrals</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Rewards Earned</div>
            <div className="text-4xl font-bold text-yellow-600">£{dashboard?.stats.totalRewards?.toFixed(2) || '0.00'}</div>
            <div className="text-sm text-gray-500 mt-1">
              {dashboard?.issuedRewards || 0} rewards issued
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Share Tools */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Your Link</h2>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => handleShare('email')}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all group"
                >
                  <svg className="w-12 h-12 text-gray-400 group-hover:text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="font-semibold text-gray-900">Email</span>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <svg className="w-12 h-12 text-gray-400 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                  <span className="font-semibold text-gray-900">Twitter/X</span>
                </button>

                <button
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <svg className="w-12 h-12 text-gray-400 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="font-semibold text-gray-900">Facebook</span>
                </button>

                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-700 hover:bg-blue-50 transition-all group"
                >
                  <svg className="w-12 h-12 text-gray-400 group-hover:text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="font-semibold text-gray-900">LinkedIn</span>
                </button>

                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <svg className="w-12 h-12 text-gray-400 group-hover:text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span className="font-semibold text-gray-900">WhatsApp</span>
                </button>

                <button
                  onClick={() => handleShare('copy')}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all"
                >
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-purple-600">
                    {copied ? '✓ Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/referrals/how-it-works')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => navigate('/referrals/rewards')}
                  className="flex-1 bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  View My Rewards
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>

              {dashboard?.recentReferrals && dashboard.recentReferrals.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentReferrals.slice(0, 5).map((referral) => (
                    <div key={referral.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-semibold">
                          {referral.referred.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {referral.referred.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {referral.qualified ? (
                            <span className="text-green-600 font-medium">✓ Subscribed</span>
                          ) : (
                            <span className="text-yellow-600">Signed up</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-sm">No referrals yet</p>
                  <p className="text-xs">Start sharing your link!</p>
                </div>
              )}
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Leaderboard</h3>
              <div className="text-center py-4">
                <div className="text-5xl font-bold mb-2">#</div>
                <div className="text-purple-100 mb-4">See your ranking</div>
                <button
                  onClick={() => navigate('/referrals/leaderboard')}
                  className="bg-white hover:bg-gray-100 text-purple-600 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

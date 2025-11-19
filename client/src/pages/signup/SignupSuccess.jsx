/**
 * Phase 2BF: Signup Success
 * Confirmation page after signup completion
 */

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SignupSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'trial';

  const isTrial = plan === 'trial';

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="text-6xl mb-6">🎉</div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isTrial ? "You're In!" : "Welcome Aboard!"}
          </h1>

          {isTrial && (
            <p className="text-xl text-gray-600 mb-6">
              Welcome to The dAItaniverse!
            </p>
          )}

          {!isTrial && (
            <p className="text-xl text-gray-600 mb-6">
              Payment successful!
            </p>
          )}

          {/* Status Box */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8">
            {isTrial && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <span className="text-green-600">✅</span>
                  <span>Account created</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <span className="text-green-600">✅</span>
                  <span>Confirmation sent to email</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <span className="text-green-600">✅</span>
                  <span>All 40+ tools unlocked</span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-sm text-gray-600">
                    Trial ends: <span className="font-semibold">7 days from now</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    We'll remind you before it expires
                  </p>
                </div>
              </div>
            )}

            {!isTrial && (
              <div className="space-y-3">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  Pro Plan - £26/month
                </div>
                <div className="text-lg text-gray-700 mb-4">
                  Charged: <span className="font-bold">£26.00</span>
                </div>
                <p className="text-sm text-gray-600">
                  Receipt sent to your email
                </p>
                <p className="text-sm text-gray-600">
                  Next billing: <span className="font-semibold">1 month from now</span>
                </p>
              </div>
            )}
          </div>

          {/* What's Next */}
          <div className="text-left bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">WHAT'S NEXT?</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="font-semibold text-gray-900">Check your email</p>
                  <p className="text-sm text-gray-600">
                    Login details sent to your inbox
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="font-semibold text-gray-900">Complete Quick Setup</p>
                  <p className="text-sm text-gray-600">
                    Takes just 2 minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="font-semibold text-gray-900">Build your first project</p>
                  <p className="text-sm text-gray-600">
                    Website, store, course - you choose!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold text-lg"
          >
            GO TO DASHBOARD →
          </button>

          {!isTrial && (
            <div className="mt-6 space-y-2">
              <h3 className="font-bold text-gray-900 mb-3">WHAT YOU GET:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✅</span>
                  40+ business tools
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✅</span>
                  Unlimited everything
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✅</span>
                  Priority support
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✅</span>
                  SUPERNova AI coaching
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✅</span>
                  Cancel anytime
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✅</span>
                  30-day money-back
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Questions? Email{' '}
          <a
            href="mailto:debs@daitaniverse.com"
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            debs@daitaniverse.com
          </a>
        </p>
      </div>
    </div>
  );
}

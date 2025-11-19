/**
 * Phase 2BF: Email Verification
 * Verify email address with token
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import signupService from '../../services/signup';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      setStatus('verifying');
      const result = await signupService.verifyEmail(token);

      setStatus('success');
      setMessage('Email verified successfully!');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage(
        error.response?.data?.error ||
        'Verification failed. The link may have expired.'
      );
    }
  };

  const handleResendVerification = async () => {
    const email = prompt('Enter your email address:');
    if (!email) return;

    try {
      setResending(true);
      await signupService.resendVerification(email);
      alert('Verification email sent! Check your inbox.');
    } catch (error) {
      console.error('Resend error:', error);
      alert(error.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">The dAItaniverse</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          {/* Verifying */}
          {status === 'verifying' && (
            <div className="space-y-6">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Verifying Your Email...
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address.
              </p>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="space-y-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Email Verified!
              </h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting you to the dashboard...
              </p>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="space-y-6">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Verification Failed
              </h2>
              <p className="text-gray-600">{message}</p>

              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold disabled:bg-gray-300"
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-semibold"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Need help?{' '}
          <a
            href="mailto:debs@daitaniverse.com"
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

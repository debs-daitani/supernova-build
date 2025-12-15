'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatAmount } from '@/lib/stripe';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(
        `/api/stripe/checkout/success?session_id=${sessionId}`
      );
      if (!response.ok) throw new Error('Failed to fetch session');
      const data = await response.json();
      setSession(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 max-w-lg text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Supernova, sans-serif' }}>
            Something went wrong
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/billing"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-medium transition-all"
          >
            Go to Billing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 max-w-2xl w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Supernova, sans-serif' }}>
          Welcome to dAItaniverse!
        </h1>
        <p className="text-xl text-gray-300 mb-8" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
          Your subscription is now active
        </p>

        {session?.session && (
          <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6 mb-8 text-left">
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Supernova, sans-serif' }}>
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Status</span>
                <span className="text-green-400 font-medium capitalize">
                  {session.session.payment_status}
                </span>
              </div>
              {session.session.amount_total && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-medium">
                    {formatAmount(session.session.amount_total, session.session.currency)}
                  </span>
                </div>
              )}
              {session.session.customer_email && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="font-medium">{session.session.customer_email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Link
            href="/supernova"
            className="block w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-medium transition-all"
            style={{ fontFamily: 'Josefin Sans, sans-serif' }}
          >
            Go to SUPERNova
          </Link>
          <Link
            href="/billing"
            className="block w-full px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
            style={{ fontFamily: 'Josefin Sans, sans-serif' }}
          >
            View Subscription Details
          </Link>
        </div>
      </div>
    </div>
  );
}

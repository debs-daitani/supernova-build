'use client';

import { useState, useEffect } from 'react';

export default function PaymentMethodsPage() {
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/stripe/payment-methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data.paymentMethods);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/stripe/payment-methods/${id}`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to set default payment method');
      await fetchPaymentMethods();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;

    try {
      const response = await fetch(`/api/stripe/payment-methods/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove payment method');
      await fetchPaymentMethods();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleManageWithStripe = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      if (!response.ok) throw new Error('Failed to create portal session');
      const data = await response.json();
      window.location.href = data.url;
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: 'Supernova, sans-serif' }}
          >
            Payment Methods
          </h2>
          <button
            onClick={handleManageWithStripe}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-medium transition-all"
            style={{ fontFamily: 'Josefin Sans, sans-serif' }}
          >
            Add Payment Method
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
              No payment methods saved
            </p>
            <button
              onClick={handleManageWithStripe}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-medium transition-all"
              style={{ fontFamily: 'Josefin Sans, sans-serif' }}
            >
              Add Your First Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((pm: any) => (
              <div
                key={pm.id}
                className="p-4 bg-white/5 rounded-xl"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">
                        {pm.card?.brand?.toUpperCase()} •••• {pm.card?.last4}
                      </p>
                      <p className="text-sm text-gray-400">
                        Expires {pm.card?.exp_month}/{pm.card?.exp_year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!pm.isDefault && (
                      <button
                        onClick={() => handleSetDefault(pm.id)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all"
                      >
                        Set as Default
                      </button>
                    )}
                    {pm.isDefault && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                        Default
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(pm.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

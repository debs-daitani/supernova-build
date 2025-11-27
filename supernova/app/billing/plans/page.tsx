'use client';

import { useState, useEffect } from 'react';
import { formatAmount } from '@/lib/stripe';

export default function PlansPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [interval, setInterval] = useState<'MONTH' | 'YEAR'>('MONTH');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/stripe/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      if (!response.ok) throw new Error('Failed to create checkout session');
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

      {/* Interval Toggle */}
      <div className="flex justify-center mb-8">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-2 inline-flex">
          <button
            onClick={() => setInterval('MONTH')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              interval === 'MONTH'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
            style={{ fontFamily: 'Josefin Sans, sans-serif' }}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('YEAR')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              interval === 'YEAR'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
            style={{ fontFamily: 'Josefin Sans, sans-serif' }}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => {
          const price = product.prices.find((p: any) => p.interval === interval);
          if (!price) return null;

          return (
            <div
              key={product.id}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 hover:border-pink-500/50 transition-all"
            >
              <h3
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'Supernova, sans-serif' }}
              >
                {product.name}
              </h3>
              <p className="text-gray-400 mb-6" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
                {product.description}
              </p>

              <div className="mb-6">
                <span className="text-5xl font-bold" style={{ fontFamily: 'Supernova, sans-serif' }}>
                  {formatAmount(price.amount, price.currency)}
                </span>
                <span className="text-gray-400 ml-2">
                  / {interval === 'MONTH' ? 'month' : 'year'}
                </span>
              </div>

              {product.features && product.features.length > 0 && (
                <ul className="space-y-3 mb-8">
                  {product.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => handleSubscribe(price.stripePriceId)}
                className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-medium transition-all"
                style={{ fontFamily: 'Josefin Sans, sans-serif' }}
              >
                Subscribe Now
              </button>
            </div>
          );
        })}
      </div>

      {products.length === 0 && !loading && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
          <p className="text-gray-400" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
            No plans available at the moment. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
}

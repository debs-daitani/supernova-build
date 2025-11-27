'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatAmount } from '@/lib/stripe';

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/stripe/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data.invoices);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-500/20 text-green-400';
      case 'OPEN':
        return 'bg-blue-500/20 text-blue-400';
      case 'DRAFT':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-red-500/20 text-red-400';
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
        <h2
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: 'Supernova, sans-serif' }}
        >
          Invoice History
        </h2>

        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
              No invoices yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/billing/invoices/${invoice.id}`}
                className="block p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">
                      {formatAmount(invoice.amountPaid, invoice.currency)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
                {invoice.hostedInvoiceUrl && (
                  <p className="text-sm text-pink-400 hover:text-pink-300">
                    View Invoice →
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

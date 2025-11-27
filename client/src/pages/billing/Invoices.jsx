/**
 * Phase 2BG: Invoices & Payment History
 * View and download invoices and receipts
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import billingService from '../../services/billing';

export default function Invoices() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' or 'payments'
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'open', 'void'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [invoiceData, paymentData] = await Promise.all([
        billingService.getInvoices(),
        billingService.getPayments()
      ]);

      setInvoices(invoiceData.invoices || []);
      setPayments(paymentData.payments || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-100 text-green-800',
      open: 'bg-yellow-100 text-yellow-800',
      void: 'bg-gray-100 text-gray-800',
      uncollectible: 'bg-red-100 text-red-800',
      draft: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      succeeded: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
      partially_refunded: 'bg-yellow-100 text-yellow-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices & Payments</h1>
              <p className="mt-1 text-gray-600">View and download your billing history</p>
            </div>
            <button
              onClick={() => navigate('/billing')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              ← Back to Billing
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'invoices'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'payments'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payment History ({payments.length})
            </button>
          </div>

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div>
              {/* Filter */}
              {invoices.length > 0 && (
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Filter:</span>
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                        filter === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('paid')}
                      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                        filter === 'paid'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => setFilter('open')}
                      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                        filter === 'open'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Open
                    </button>
                  </div>
                </div>
              )}

              {/* Invoices List */}
              <div className="divide-y">
                {filteredInvoices.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-5xl mb-4">📄</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {filter === 'all' ? 'No invoices yet' : `No ${filter} invoices`}
                    </h3>
                    <p className="text-gray-600">
                      {filter === 'all'
                        ? 'Invoices will appear here once you have billing activity'
                        : `Try changing the filter to see other invoices`}
                    </p>
                  </div>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {billingService.formatCurrency(invoice.total, invoice.currency)}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <strong>Invoice:</strong> {invoice.invoiceNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Date:</strong> {billingService.formatDate(invoice.createdAt)}
                            </p>
                            {invoice.periodStart && invoice.periodEnd && (
                              <p className="text-sm text-gray-600">
                                <strong>Period:</strong> {billingService.formatDate(invoice.periodStart)} - {billingService.formatDate(invoice.periodEnd)}
                              </p>
                            )}
                            {invoice.paidAt && (
                              <p className="text-sm text-gray-600">
                                <strong>Paid:</strong> {billingService.formatDate(invoice.paidAt)}
                              </p>
                            )}
                          </div>

                          {/* Breakdown */}
                          {(invoice.amount !== invoice.total || invoice.tax > 0) && (
                            <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{billingService.formatCurrency(invoice.amount, invoice.currency)}</span>
                              </div>
                              {invoice.tax > 0 && (
                                <div className="flex justify-between">
                                  <span>Tax:</span>
                                  <span>{billingService.formatCurrency(invoice.tax, invoice.currency)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t">
                                <span>Total:</span>
                                <span>{billingService.formatCurrency(invoice.total, invoice.currency)}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="ml-6">
                          {invoice.invoicePdf && (
                            <a
                              href={invoice.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-sm"
                            >
                              <span>📥</span>
                              Download PDF
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="divide-y">
              {payments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-5xl mb-4">💳</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No payments yet</h3>
                  <p className="text-gray-600">
                    Your payment history will appear here once you make your first payment
                  </p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {billingService.formatCurrency(payment.amount, payment.currency)}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <strong>Date:</strong> {billingService.formatDate(payment.createdAt)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Type:</strong> {payment.type}
                          </p>
                          {payment.description && (
                            <p className="text-sm text-gray-600">
                              <strong>Description:</strong> {payment.description}
                            </p>
                          )}
                          {payment.stripePaymentIntentId && (
                            <p className="text-xs text-gray-500 font-mono">
                              ID: {payment.stripePaymentIntentId}
                            </p>
                          )}
                        </div>

                        {/* Refund Info */}
                        {payment.refundedAmount > 0 && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-800">
                              <strong>Refunded:</strong> {billingService.formatCurrency(payment.refundedAmount, payment.currency)}
                              {payment.refundReason && (
                                <span className="block mt-1 text-xs">
                                  Reason: {payment.refundReason}
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Payment Icon */}
                      <div className="ml-6">
                        <div className="text-4xl">
                          {payment.status === 'succeeded' ? '✅' :
                           payment.status === 'failed' ? '❌' :
                           payment.status === 'refunded' ? '↩️' : '💳'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Summary Card */}
        {(invoices.length > 0 || payments.length > 0) && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Billing Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Paid Invoices</p>
                <p className="text-2xl font-bold text-green-600">
                  {invoices.filter(i => i.status === 'paid').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Can't find an invoice?{' '}
            <a
              href="mailto:debs@daitaniverse.com"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

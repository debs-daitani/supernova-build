/**
 * Phase 2BG: Billing Overview
 * Main billing dashboard showing subscription, payment methods, and invoices
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import billingService from '../../services/billing';

export default function BillingOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);

      const [subData, pmData, invData] = await Promise.all([
        billingService.getSubscription(),
        billingService.getPaymentMethods(),
        billingService.getInvoices()
      ]);

      setSubscription(subData);
      setPaymentMethods(pmData.paymentMethods || []);
      setInvoices(invData.invoices || []);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await billingService.createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  const statusInfo = billingService.getStatusLabel(subscription?.planStatus);
  const daysUntilRenewal = billingService.getDaysUntilRenewal(subscription?.currentPeriodEnd);
  const isTrial = subscription?.planType === 'trial';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
              <p className="mt-1 text-gray-600">Manage your subscription, payment methods, and invoices</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Back to Dashboard
              </button>
              {isTrial && (
                <button
                  onClick={handleUpgrade}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Upgrade Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Subscription Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Current Subscription</h2>
                  <p className="text-sm text-gray-600 mt-1">Your active plan and billing details</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                  {statusInfo.text}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold text-gray-900">
                    {billingService.getPlanDisplayName(subscription?.planType)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-gray-900">
                    {billingService.getPlanPriceDisplay(subscription?.planType)}
                  </span>
                </div>

                {subscription?.currentPeriodEnd && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">
                      {subscription?.cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {billingService.formatDate(subscription.currentPeriodEnd)}
                      {daysUntilRenewal !== null && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({daysUntilRenewal} days)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {subscription?.trialEndDate && isTrial && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">Trial ends</span>
                    <span className="font-semibold text-gray-900">
                      {billingService.formatDate(subscription.trialEndDate)}
                      {subscription.trialDaysRemaining !== undefined && (
                        <span className="text-sm text-orange-600 ml-2 font-semibold">
                          ({subscription.trialDaysRemaining} days left)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {subscription?.cancelAtPeriodEnd && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Subscription ending:</strong> Your subscription will cancel on{' '}
                      {billingService.formatDate(subscription.currentPeriodEnd)}. You'll keep access until then.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                {isTrial ? (
                  <button
                    onClick={handleUpgrade}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Upgrade to PRO
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleManageSubscription}
                      className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Manage Subscription
                    </button>
                    <button
                      onClick={() => navigate('/billing/change-plan')}
                      className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
                    >
                      Change Plan
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Payment Methods Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your payment methods</p>
                </div>
                <button
                  onClick={() => navigate('/billing/payment-methods')}
                  className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                >
                  + Add New
                </button>
              </div>

              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💳</div>
                  <p className="text-gray-600 mb-4">No payment methods added yet</p>
                  <button
                    onClick={() => navigate('/billing/payment-methods')}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Add Payment Method
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.slice(0, 2).map((pm) => (
                    <div
                      key={pm.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {billingService.getCardBrandIcon(pm.card?.brand)}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {billingService.formatCardDisplay(pm.card?.last4, pm.card?.brand)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires {pm.card?.exp_month}/{pm.card?.exp_year}
                          </p>
                        </div>
                      </div>
                      {pm.id === subscription?.defaultPaymentMethod && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                  {paymentMethods.length > 2 && (
                    <button
                      onClick={() => navigate('/billing/payment-methods')}
                      className="w-full text-center text-purple-600 hover:text-purple-700 font-semibold text-sm py-2"
                    >
                      View all {paymentMethods.length} payment methods
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Recent Invoices Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
                  <p className="text-sm text-gray-600 mt-1">Your billing history and receipts</p>
                </div>
                <button
                  onClick={() => navigate('/billing/invoices')}
                  className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                >
                  View All
                </button>
              </div>

              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-gray-600">No invoices yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-purple-300 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {billingService.formatCurrency(invoice.total, invoice.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {billingService.formatDate(invoice.createdAt)} • {invoice.invoiceNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                        {invoice.invoicePdf && (
                          <a
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/billing/invoices')}
                  className="w-full px-4 py-3 text-left border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-semibold text-gray-900">View Invoices</p>
                      <p className="text-sm text-gray-600">Download receipts</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/billing/payment-methods')}
                  className="w-full px-4 py-3 text-left border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-semibold text-gray-900">Payment Methods</p>
                      <p className="text-sm text-gray-600">Add or remove cards</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleManageSubscription}
                  className="w-full px-4 py-3 text-left border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚙️</span>
                    <div>
                      <p className="font-semibold text-gray-900">Billing Portal</p>
                      <p className="text-sm text-gray-600">Full billing management</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Have questions about billing or your subscription? We're here to help!
              </p>
              <a
                href="mailto:debs@daitaniverse.com"
                className="inline-block w-full text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

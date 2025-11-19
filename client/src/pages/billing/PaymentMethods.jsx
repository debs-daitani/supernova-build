/**
 * Phase 2BG: Payment Methods Management
 * Manage credit cards and payment methods
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import billingService from '../../services/billing';

export default function PaymentMethods() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const { paymentMethods: methods } = await billingService.getPaymentMethods();
      setPaymentMethods(methods || []);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    setShowAddCard(true);
  };

  const handleCancelAdd = () => {
    setShowAddCard(false);
    setError(null);
  };

  const handleSubmitCard = async (e) => {
    e.preventDefault();

    try {
      setError(null);

      // Note: In production, you would:
      // 1. Load Stripe.js and Elements
      // 2. Create payment method with Stripe
      // 3. Call billingService.addPaymentMethod()

      console.log('Adding payment method...');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert('Payment method would be added here (Stripe integration required)');
      setShowAddCard(false);
      loadPaymentMethods();

    } catch (err) {
      console.error('Add payment method error:', err);
      setError(err.response?.data?.error || 'Failed to add payment method');
    }
  };

  const handleRemoveCard = async (methodId) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      setRemoving(methodId);
      setError(null);

      await billingService.removePaymentMethod(methodId);

      // Reload payment methods
      await loadPaymentMethods();

    } catch (err) {
      console.error('Remove payment method error:', err);
      setError(err.response?.data?.error || 'Failed to remove payment method');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
              <p className="mt-1 text-gray-600">Manage your credit cards and payment methods</p>
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Payment Methods List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Saved Cards</h2>
              <p className="text-sm text-gray-600 mt-1">
                {paymentMethods.length} payment method{paymentMethods.length !== 1 ? 's' : ''} on file
              </p>
            </div>
            {!showAddCard && (
              <button
                onClick={handleAddCard}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                + Add Card
              </button>
            )}
          </div>

          {/* Add Card Form */}
          {showAddCard && (
            <div className="p-6 border-b bg-purple-50">
              <h3 className="font-bold text-gray-900 mb-4">Add New Payment Method</h3>

              <form onSubmit={handleSubmitCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Card Information
                  </label>
                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                    <p className="text-sm text-gray-600 mb-3">
                      Note: Stripe Elements integration would go here in production
                    </p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Card number"
                        className="w-full px-4 py-2 border rounded-lg"
                        disabled
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM / YY"
                          className="px-4 py-2 border rounded-lg"
                          disabled
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          className="px-4 py-2 border rounded-lg"
                          disabled
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Cardholder name"
                        className="w-full px-4 py-2 border rounded-lg"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="setDefault" className="rounded" disabled />
                  <label htmlFor="setDefault" className="text-sm text-gray-700">
                    Set as default payment method
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancelAdd}
                    className="flex-1 px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Add Payment Method
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment Methods List */}
          <div className="divide-y">
            {paymentMethods.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">💳</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No payment methods yet</h3>
                <p className="text-gray-600 mb-6">Add a payment method to manage your subscription</p>
                {!showAddCard && (
                  <button
                    onClick={handleAddCard}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Add Your First Card
                  </button>
                )}
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div key={method.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {billingService.getCardBrandIcon(method.card?.brand)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {billingService.formatCardDisplay(method.card?.last4, method.card?.brand)}
                          </p>
                          {method.default && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Expires {method.card?.exp_month}/{method.card?.exp_year}
                        </p>
                        {method.billing_details?.name && (
                          <p className="text-xs text-gray-500 mt-1">
                            {method.billing_details.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!method.default && (
                        <button
                          onClick={() => {
                            alert('Set as default functionality would go here');
                          }}
                          className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveCard(method.id)}
                        disabled={removing === method.id}
                        className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50"
                      >
                        {removing === method.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>

                  {/* Card Details (Optional) */}
                  {method.card?.funding && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex gap-6 text-xs text-gray-600">
                        <div>
                          <span className="font-semibold">Type:</span> {method.card.funding}
                        </div>
                        {method.card.country && (
                          <div>
                            <span className="font-semibold">Country:</span> {method.card.country}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Your payment information is secure</h3>
              <p className="text-sm text-gray-700">
                We use Stripe to process payments securely. Your card information is encrypted and we never store your full card details on our servers.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                All transactions are PCI-DSS compliant and protected by industry-leading security measures.
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Having trouble with payments?{' '}
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

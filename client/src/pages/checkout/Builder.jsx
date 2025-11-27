/**
 * Phase 2BC: Checkout Pages
 * Builder - Create/edit checkout page
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import checkoutService from '../../services/checkout';

export default function CheckoutBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (!isNew) {
      loadPage();
    } else {
      // Initialize new page with defaults
      setPage({
        name: '',
        productType: 'product',
        basePrice: 97,
        currency: 'GBP',
        allowOneTime: true,
        allowSubscription: false,
        allowPaymentPlan: false,
        allowCoupons: true,
        showGuarantee: true,
        guaranteeText: '30-Day Money-Back Guarantee',
        showSecurity: true,
        showTestimonials: false,
        orderBumps: [],
        testimonials: [],
        sections: []
      });
    }
  }, [id]);

  const loadPage = async () => {
    try {
      setLoading(true);
      const data = await checkoutService.getPage(id);
      setPage(data.page);
    } catch (error) {
      console.error('Failed to load checkout page:', error);
      alert('Failed to load checkout page');
      navigate('/checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page.name) {
      alert('Please enter a page name');
      return;
    }

    if (!page.basePrice || page.basePrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      setSaving(true);
      if (isNew) {
        const result = await checkoutService.createPage(page);
        navigate(`/checkout/${result.page.id}/builder`);
      } else {
        await checkoutService.updatePage(id, page);
        alert('Checkout page saved!');
      }
    } catch (error) {
      console.error('Failed to save checkout page:', error);
      alert('Failed to save checkout page');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOrderBump = () => {
    setPage({
      ...page,
      orderBumps: [
        ...(page.orderBumps || []),
        {
          productId: `bump_${Date.now()}`,
          price: 27,
          label: 'Add bonus item for just £27',
          checked: false
        }
      ]
    });
  };

  const handleRemoveOrderBump = (index) => {
    const newBumps = page.orderBumps.filter((_, i) => i !== index);
    setPage({ ...page, orderBumps: newBumps });
  };

  const handleUpdateOrderBump = (index, updates) => {
    const newBumps = [...page.orderBumps];
    newBumps[index] = { ...newBumps[index], ...updates };
    setPage({ ...page, orderBumps: newBumps });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/checkout')}
            className="text-purple-600 hover:text-purple-700 mb-2"
          >
            ← Back to Checkout Pages
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'New Checkout Page' : page.name}
          </h1>
        </div>
        <div className="flex gap-3">
          {!isNew && page.isPublished && (
            <a
              href={`/checkout/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
            >
              View Live →
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:bg-gray-300"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {['basic', 'pricing', 'upsells', 'trust'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Basic Info */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Page Name *
              </label>
              <input
                type="text"
                value={page.name}
                onChange={(e) => setPage({ ...page, name: e.target.value })}
                placeholder="e.g., Main Product Checkout"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Product Type
              </label>
              <select
                value={page.productType}
                onChange={(e) => setPage({ ...page, productType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                {checkoutService.getProductTypes().map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Currency
              </label>
              <select
                value={page.currency}
                onChange={(e) => setPage({ ...page, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                <option value="GBP">£ GBP</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>
        )}

        {/* Pricing */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Pricing Options</h2>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Base Price *
              </label>
              <input
                type="number"
                value={page.basePrice}
                onChange={(e) => setPage({ ...page, basePrice: parseFloat(e.target.value) })}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={page.allowOneTime}
                  onChange={(e) => setPage({ ...page, allowOneTime: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Allow one-time payment</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={page.allowSubscription}
                  onChange={(e) => setPage({ ...page, allowSubscription: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Allow subscription</span>
              </label>

              {page.allowSubscription && (
                <div className="ml-7">
                  <select
                    value={page.subscriptionInterval || 'monthly'}
                    onChange={(e) => setPage({ ...page, subscriptionInterval: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={page.allowPaymentPlan}
                  onChange={(e) => setPage({ ...page, allowPaymentPlan: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Allow payment plans</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={page.allowCoupons}
                  onChange={(e) => setPage({ ...page, allowCoupons: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Allow coupon codes</span>
              </label>
            </div>
          </div>
        )}

        {/* Upsells & Order Bumps */}
        {activeTab === 'upsells' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Upsells & Order Bumps</h2>

            {/* Order Bumps */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Order Bumps</h3>
                <button
                  onClick={handleAddOrderBump}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                >
                  + Add Order Bump
                </button>
              </div>

              {page.orderBumps && page.orderBumps.length > 0 ? (
                <div className="space-y-4">
                  {page.orderBumps.map((bump, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Label
                          </label>
                          <input
                            type="text"
                            value={bump.label}
                            onChange={(e) => handleUpdateOrderBump(index, { label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price
                          </label>
                          <input
                            type="number"
                            value={bump.price}
                            onChange={(e) => handleUpdateOrderBump(index, { price: parseFloat(e.target.value) })}
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveOrderBump(index)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">
                  No order bumps yet. Add one to increase average order value!
                </p>
              )}
            </div>

            {/* Upsell */}
            <div>
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={page.hasUpsell}
                  onChange={(e) => setPage({ ...page, hasUpsell: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Enable post-purchase upsell</span>
              </label>

              <p className="text-sm text-gray-600 italic">
                Advanced upsell configuration coming soon!
              </p>
            </div>
          </div>
        )}

        {/* Trust Elements */}
        {activeTab === 'trust' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Trust Elements</h2>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={page.showSecurity}
                onChange={(e) => setPage({ ...page, showSecurity: e.target.checked })}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <span className="text-sm font-medium text-gray-900">Show security badges</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={page.showGuarantee}
                onChange={(e) => setPage({ ...page, showGuarantee: e.target.checked })}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <span className="text-sm font-medium text-gray-900">Show money-back guarantee</span>
            </label>

            {page.showGuarantee && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Guarantee Text
                </label>
                <input
                  type="text"
                  value={page.guaranteeText || ''}
                  onChange={(e) => setPage({ ...page, guaranteeText: e.target.value })}
                  placeholder="30-Day Money-Back Guarantee"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={page.showTestimonials}
                onChange={(e) => setPage({ ...page, showTestimonials: e.target.checked })}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <span className="text-sm font-medium text-gray-900">Show testimonials</span>
            </label>

            {page.showTestimonials && (
              <p className="text-sm text-gray-600 italic">
                Advanced testimonial management coming soon!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

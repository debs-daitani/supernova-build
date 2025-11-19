/**
 * Phase 2BC: Checkout Pages
 * Dashboard - View and manage checkout pages
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import checkoutService from '../../services/checkout';

export default function CheckoutDashboard() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await checkoutService.getAllPages();
      setPages(data.pages || []);
    } catch (error) {
      console.error('Failed to load checkout pages:', error);
      alert('Failed to load checkout pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await checkoutService.deletePage(id);
      await loadPages();
    } catch (error) {
      console.error('Failed to delete page:', error);
      alert('Failed to delete checkout page');
    }
  };

  const handlePublishToggle = async (page) => {
    try {
      if (page.isPublished) {
        await checkoutService.unpublishPage(page.id);
      } else {
        await checkoutService.publishPage(page.id);
      }
      await loadPages();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      alert('Failed to update publish status');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const result = await checkoutService.duplicatePage(id);
      await loadPages();
      navigate(`/checkout/${result.page.id}/builder`);
    } catch (error) {
      console.error('Failed to duplicate page:', error);
      alert('Failed to duplicate checkout page');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout Pages</h1>
          <p className="text-gray-600 mt-1">Create beautiful checkout pages that convert</p>
        </div>
        <button
          onClick={() => navigate('/checkout/new')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
        >
          + New Checkout Page
        </button>
      </div>

      {/* Pages Grid */}
      {pages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">💳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No checkout pages yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first checkout page to start accepting payments
          </p>
          <button
            onClick={() => navigate('/checkout/new')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
          >
            Create Your First Checkout Page
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pages.map(page => (
            <div key={page.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{page.name}</h3>
                    {page.isPublished ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        Published
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                        Draft
                      </span>
                    )}
                  </div>

                  {page.isPublished && (
                    <a
                      href={`/checkout/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-700 mb-4 inline-block"
                    >
                      /checkout/{page.slug} →
                    </a>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-5 gap-6 mt-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{page.views.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Views</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{page.checkouts.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Checkouts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{page.completedOrders.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Orders</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {checkoutService.formatCurrency(page.revenue, page.currency)}
                      </div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {page.conversionRate ? page.conversionRate.toFixed(1) : '0'}%
                      </div>
                      <div className="text-sm text-gray-600">Conversion</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-6">
                  <button
                    onClick={() => navigate(`/checkout/${page.id}/builder`)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/checkout/${page.id}/analytics`)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => handlePublishToggle(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page.isPublished
                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                        : 'bg-green-100 hover:bg-green-200 text-green-800'
                    }`}
                  >
                    {page.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDuplicate(page.id)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(page.id, page.name)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      {pages.length > 0 && (
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-purple-900 mb-2">📊 View All Orders</h3>
            <p className="text-purple-700 text-sm mb-4">
              Manage customer orders and process refunds
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              Go to Orders →
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">🎫 Manage Coupons</h3>
            <p className="text-blue-700 text-sm mb-4">
              Create discount codes to boost sales
            </p>
            <button
              onClick={() => navigate('/coupons')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              Go to Coupons →
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-900 mb-2">💰 Revenue Report</h3>
            <p className="text-green-700 text-sm mb-4">
              Track your total revenue and conversions
            </p>
            <div className="text-2xl font-bold text-green-600">
              {checkoutService.formatCurrency(
                pages.reduce((sum, page) => sum + page.revenue, 0),
                'GBP'
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

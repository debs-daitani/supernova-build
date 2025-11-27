/**
 * Phase 2BD: Thank You Pages
 * Dashboard - View and manage thank you pages
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import thankYouPagesService from '../../services/thank-you-pages';

export default function ThankYouPagesDashboard() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await thankYouPagesService.getAllPages();
      setPages(data.pages || []);
    } catch (error) {
      console.error('Failed to load thank you pages:', error);
      alert('Failed to load thank you pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;

    try {
      await thankYouPagesService.deletePage(id);
      await loadPages();
    } catch (error) {
      console.error('Failed to delete page:', error);
      alert('Failed to delete thank you page');
    }
  };

  const handlePublishToggle = async (page) => {
    try {
      if (page.isPublished) {
        await thankYouPagesService.unpublishPage(page.id);
      } else {
        await thankYouPagesService.publishPage(page.id);
      }
      await loadPages();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      alert('Failed to update publish status');
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
          <h1 className="text-3xl font-bold text-gray-900">Thank You Pages</h1>
          <p className="text-gray-600 mt-1">Maximize post-purchase engagement and revenue</p>
        </div>
        <button
          onClick={() => navigate('/thank-you-pages/new')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
        >
          + New Thank You Page
        </button>
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No thank you pages yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first thank you page to increase customer lifetime value
          </p>
          <button
            onClick={() => navigate('/thank-you-pages/new')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
          >
            Create Your First Page
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pages.map(page => (
            <div key={page.id} className="bg-white rounded-xl border border-gray-200 p-6">
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

                  {page.checkoutPage && (
                    <p className="text-sm text-gray-600 mb-4">
                      Linked to: <span className="font-medium">{page.checkoutPage.name}</span>
                    </p>
                  )}

                  {page.isPublished && (
                    <a
                      href={`/thank-you/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-700 mb-4 inline-block"
                    >
                      /thank-you/{page.slug} →
                    </a>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{page._count?.views || 0}</div>
                      <div className="text-sm text-gray-600">Views</div>
                    </div>
                    {page.hasUpsell && (
                      <div>
                        <div className="text-sm font-medium text-purple-600">Upsell Enabled</div>
                      </div>
                    )}
                    {page.enableSharing && (
                      <div>
                        <div className="text-sm font-medium text-blue-600">Social Sharing On</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-6">
                  <button
                    onClick={() => navigate(`/thank-you-pages/${page.id}/builder`)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/thank-you-pages/${page.id}/analytics`)}
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
    </div>
  );
}

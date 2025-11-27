/**
 * Phase 2BA: Landing Page System
 * Dashboard - View and manage all landing pages
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import landingPagesService from '../../services/landing-pages';

export default function LandingPagesDashboard() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await landingPagesService.getAllPages();
      setPages(data.pages || []);
    } catch (err) {
      console.error('Failed to load landing pages:', err);
      setError('Failed to load landing pages');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id, isPublished) => {
    try {
      if (isPublished) {
        await landingPagesService.unpublishPage(id);
      } else {
        await landingPagesService.publishPage(id);
      }
      await loadPages();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
      alert('Failed to update page');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await landingPagesService.duplicatePage(id);
      await loadPages();
    } catch (err) {
      console.error('Failed to duplicate page:', err);
      alert('Failed to duplicate page');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will delete the page and all analytics.')) {
      return;
    }

    try {
      await landingPagesService.deletePage(id);
      await loadPages();
    } catch (err) {
      console.error('Failed to delete page:', err);
      alert('Failed to delete page');
    }
  };

  const getTemplateIcon = (type) => {
    const icons = {
      sales: '💰',
      product: '🚀',
      webinar: '📹',
      waitlist: '📝',
      launch: '🎉'
    };
    return icons[type] || '📄';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Landing Pages</h1>
          <p className="text-gray-600 mt-1">Create conversion-optimized sales pages</p>
        </div>
        <button
          onClick={() => navigate('/landing-pages/templates')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          + Create Landing Page
        </button>
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No landing pages yet</h3>
          <p className="text-gray-600 mb-6">Create your first high-converting landing page</p>
          <button
            onClick={() => navigate('/landing-pages/templates')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Choose Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => {
            const conversionRate = page.conversionRate || 0;
            const hasStats = page.views > 0;

            return (
              <div key={page.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Preview Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-6xl">{getTemplateIcon(page.templateType)}</span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{page.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">{page.templateType} Page</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      page.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {page.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  {/* Stats */}
                  {hasStats ? (
                    <div className="mb-4 py-3 border-t border-b border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{page.views}</div>
                          <div className="text-xs text-gray-600">Views</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{page.conversions}</div>
                          <div className="text-xs text-gray-600">Conversions</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{conversionRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-600">Conv. Rate</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 py-3 border-t border-b border-gray-200 text-center">
                      <p className="text-sm text-gray-600">No visitors yet</p>
                    </div>
                  )}

                  {/* URL */}
                  {page.isPublished && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">URL:</span>
                        <a
                          href={`/lp/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 truncate flex-1"
                        >
                          /lp/{page.slug}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/landing-pages/${page.id}/builder`)}
                      className="flex-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    {hasStats && (
                      <button
                        onClick={() => navigate(`/landing-pages/${page.id}/analytics`)}
                        className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors text-sm font-medium"
                      >
                        📊
                      </button>
                    )}
                    <button
                      onClick={() => handlePublish(page.id, page.isPublished)}
                      className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        page.isPublished
                          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                          : 'bg-green-100 hover:bg-green-200 text-green-800'
                      }`}
                      title={page.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {page.isPublished ? '👁️' : '🚀'}
                    </button>
                    <button
                      onClick={() => handleDuplicate(page.id)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm font-medium"
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors text-sm font-medium"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-3">💡 Landing Page Tips</h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>✅ Use clear, benefit-focused headlines</li>
          <li>✅ Add social proof (testimonials, logos, stats)</li>
          <li>✅ Create urgency with limited-time offers</li>
          <li>✅ Test different headlines with A/B testing</li>
          <li>✅ Make your CTA button stand out</li>
        </ul>
      </div>
    </div>
  );
}

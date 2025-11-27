/**
 * Phase 2BD: Thank You Pages
 * Builder - Create/edit thank you page
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import thankYouPagesService from '../../services/thank-you-pages';

export default function ThankYouPageBuilder() {
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
      // Initialize with default template
      const template = thankYouPagesService.getDefaultTemplate('course');
      setPage(template);
    }
  }, [id]);

  const loadPage = async () => {
    try {
      setLoading(true);
      const data = await thankYouPagesService.getPage(id);
      setPage(data.page);
    } catch (error) {
      console.error('Failed to load thank you page:', error);
      alert('Failed to load thank you page');
      navigate('/thank-you-pages');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page.name) {
      alert('Please enter a page name');
      return;
    }

    try {
      setSaving(true);
      if (isNew) {
        const result = await thankYouPagesService.createPage(page);
        navigate(`/thank-you-pages/${result.page.id}/builder`);
      } else {
        await thankYouPagesService.updatePage(id, page);
        alert('Thank you page saved!');
      }
    } catch (error) {
      console.error('Failed to save thank you page:', error);
      alert('Failed to save thank you page');
    } finally {
      setSaving(false);
    }
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
            onClick={() => navigate('/thank-you-pages')}
            className="text-purple-600 hover:text-purple-700 mb-2"
          >
            ← Back to Thank You Pages
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'New Thank You Page' : page.name}
          </h1>
        </div>
        <div className="flex gap-3">
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
          {['basic', 'upsell', 'engagement', 'tracking'].map(tab => (
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
        {/* Basic */}
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
                placeholder="e.g., Course Purchase Thank You"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Theme
              </label>
              <select
                value={page.theme}
                onChange={(e) => setPage({ ...page, theme: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                <option value="celebration">🎉 Celebration</option>
                <option value="professional">💼 Professional</option>
                <option value="minimal">✨ Minimal</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={page.showNextSteps}
                  onChange={(e) => setPage({ ...page, showNextSteps: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Show next steps guide</span>
              </label>
            </div>
          </div>
        )}

        {/* Upsell */}
        {activeTab === 'upsell' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Post-Purchase Offers</h2>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={page.hasUpsell}
                onChange={(e) => setPage({ ...page, hasUpsell: e.target.checked })}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <span className="text-sm font-medium text-gray-900">Enable upsell offer</span>
            </label>

            {page.hasUpsell && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <p className="text-sm text-gray-600">
                  Upsell details (product selection, pricing) configured here
                </p>
                <p className="text-sm text-gray-600 italic">
                  Advanced upsell configuration coming soon!
                </p>
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={page.hasDownsell}
                onChange={(e) => setPage({ ...page, hasDownsell: e.target.checked })}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <span className="text-sm font-medium text-gray-900">Enable downsell (if upsell declined)</span>
            </label>
          </div>
        )}

        {/* Engagement */}
        {activeTab === 'engagement' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Engagement Features</h2>

            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={page.enableSharing}
                  onChange={(e) => setPage({ ...page, enableSharing: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Enable social sharing</span>
              </label>

              {page.enableSharing && (
                <div className="ml-7 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Share Message
                    </label>
                    <input
                      type="text"
                      value={page.shareMessage || ''}
                      onChange={(e) => setPage({ ...page, shareMessage: e.target.value })}
                      placeholder="I just got this amazing course!"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Share Incentive
                    </label>
                    <input
                      type="text"
                      value={page.shareIncentive || ''}
                      onChange={(e) => setPage({ ...page, shareIncentive: e.target.value })}
                      placeholder="Share and get 10% off your next order"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={page.showCommunityJoin}
                  onChange={(e) => setPage({ ...page, showCommunityJoin: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Show community join</span>
              </label>

              {page.showCommunityJoin && (
                <div className="ml-7 space-y-3">
                  <div>
                    <input
                      type="text"
                      value={page.communityName || ''}
                      onChange={(e) => setPage({ ...page, communityName: e.target.value })}
                      placeholder="Community Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={page.communityUrl || ''}
                      onChange={(e) => setPage({ ...page, communityUrl: e.target.value })}
                      placeholder="Facebook Group URL or Discord Invite"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={page.enableCalendar}
                  onChange={(e) => setPage({ ...page, enableCalendar: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Enable calendar booking</span>
              </label>

              {page.enableCalendar && (
                <div className="ml-7">
                  <input
                    type="text"
                    value={page.calendlyUrl || ''}
                    onChange={(e) => setPage({ ...page, calendlyUrl: e.target.value })}
                    placeholder="Calendly URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={page.enableSurvey}
                  onChange={(e) => setPage({ ...page, enableSurvey: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Enable post-purchase survey</span>
              </label>
            </div>
          </div>
        )}

        {/* Tracking */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Tracking & Analytics</h2>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Facebook Pixel ID
              </label>
              <input
                type="text"
                value={page.facebookPixelId || ''}
                onChange={(e) => setPage({ ...page, facebookPixelId: e.target.value })}
                placeholder="123456789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={page.googleAnalyticsId || ''}
                onChange={(e) => setPage({ ...page, googleAnalyticsId: e.target.value })}
                placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Custom Tracking Code
              </label>
              <textarea
                value={page.customTrackingCode || ''}
                onChange={(e) => setPage({ ...page, customTrackingCode: e.target.value })}
                rows={4}
                placeholder="<script>/* Your tracking code */</script>"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 font-mono text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

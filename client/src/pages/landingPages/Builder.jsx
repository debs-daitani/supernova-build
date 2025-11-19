/**
 * Phase 2BA: Landing Page System
 * Page Builder - Edit landing page content
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import landingPagesService from '../../services/landing-pages';

export default function LandingPageBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    loadPage();
  }, [id]);

  const loadPage = async () => {
    try {
      setLoading(true);
      const data = await landingPagesService.getPage(id);
      setPage(data.page);
      setSections(data.page.sections || []);
    } catch (error) {
      console.error('Failed to load page:', error);
      alert('Failed to load page');
      navigate('/landing-pages');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await landingPagesService.updatePage(id, {
        sections,
        title: page.title
      });
      alert('Page saved!');
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSection = (index, updates) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updates };
    setSections(newSections);
  };

  const handleDeleteSection = (index) => {
    if (confirm('Delete this section?')) {
      const newSections = sections.filter((_, i) => i !== index);
      setSections(newSections);
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
          <button
            onClick={() => navigate('/landing-pages')}
            className="text-purple-600 hover:text-purple-700 mb-2"
          >
            ← Back to Landing Pages
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
        </div>
        <div className="flex gap-3">
          {page.isPublished && (
            <a
              href={`/lp/${page.slug}`}
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
            {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'content'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Page Sections</h2>
            <p className="text-sm text-gray-600">{sections.length} sections</p>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <SectionEditor
                key={index}
                section={section}
                index={index}
                onUpdate={(updates) => handleUpdateSection(index, updates)}
                onDelete={() => handleDeleteSection(index)}
              />
            ))}
          </div>

          {sections.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-600">No sections yet. Add sections to build your page.</p>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Page Title
              </label>
              <input
                type="text"
                value={page.title}
                onChange={(e) => setPage({ ...page, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Meta Title (SEO)
              </label>
              <input
                type="text"
                value={page.metaTitle || ''}
                onChange={(e) => setPage({ ...page, metaTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Meta Description (SEO)
              </label>
              <textarea
                value={page.metaDescription || ''}
                onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Primary CTA Text
              </label>
              <input
                type="text"
                value={page.primaryCTA}
                onChange={(e) => setPage({ ...page, primaryCTA: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                CTA URL
              </label>
              <input
                type="text"
                value={page.ctaUrl}
                onChange={(e) => setPage({ ...page, ctaUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Section Editor Component
function SectionEditor({ section, index, onUpdate, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSectionIcon = (type) => {
    const icons = {
      hero: '🎯',
      socialProof: '⭐',
      problem: '❓',
      solution: '✨',
      features: '⚡',
      pricing: '💰',
      testimonials: '💬',
      faq: '❓',
      cta: '🎯',
      finalCTA: '🚀'
    };
    return icons[type] || '📄';
  };

  const getSectionName = (type) => {
    const names = {
      hero: 'Hero Section',
      socialProof: 'Social Proof',
      problem: 'Problem Statement',
      solution: 'Solution',
      features: 'Features',
      pricing: 'Pricing Table',
      testimonials: 'Testimonials',
      faq: 'FAQ',
      cta: 'Call to Action',
      finalCTA: 'Final CTA'
    };
    return names[type] || type;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getSectionIcon(section.type)}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{getSectionName(section.type)}</h3>
            <p className="text-sm text-gray-600">Section #{index + 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
          >
            Delete
          </button>
          <button className="text-gray-600">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-4">
            {section.content && section.content.headline && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  value={section.content.headline}
                  onChange={(e) => onUpdate({
                    content: { ...section.content, headline: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>
            )}

            {section.content && section.content.subheadline && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Subheadline
                </label>
                <textarea
                  value={section.content.subheadline}
                  onChange={(e) => onUpdate({
                    content: { ...section.content, subheadline: e.target.value }
                  })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>
            )}

            {section.content && section.content.ctaText && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={section.content.ctaText}
                    onChange={(e) => onUpdate({
                      content: { ...section.content, ctaText: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    CTA URL
                  </label>
                  <input
                    type="text"
                    value={section.content.ctaUrl || ''}
                    onChange={(e) => onUpdate({
                      content: { ...section.content, ctaUrl: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 italic">
              More advanced section editing features coming soon!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

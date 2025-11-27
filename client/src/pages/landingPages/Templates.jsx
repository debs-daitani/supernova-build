/**
 * Phase 2BA: Landing Page System
 * Template Selector - Choose from pre-built templates
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import landingPagesService from '../../services/landing-pages';

export default function LandingPageTemplates() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const templates = landingPagesService.getTemplateTypes();

  const handleSelectTemplate = async (type) => {
    try {
      setCreating(true);
      const template = landingPagesService.getTemplateConfig(type);

      const pageData = {
        title: template.name,
        templateType: type,
        sections: template.sections,
        primaryCTA: 'Get Started',
        ctaUrl: '/signup'
      };

      const result = await landingPagesService.createPage(pageData);
      navigate(`/landing-pages/${result.page.id}/builder`);
    } catch (error) {
      console.error('Failed to create page:', error);
      alert('Failed to create landing page');
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/landing-pages')}
          className="text-purple-600 hover:text-purple-700 mb-4"
        >
          ← Back to Landing Pages
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Choose a Template</h1>
        <p className="text-gray-600 mt-1">Start with a conversion-optimized template</p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.type}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Preview */}
            <div className="h-64 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {template.type === 'sales' && '💰'}
                  {template.type === 'product' && '🚀'}
                  {template.type === 'webinar' && '📹'}
                  {template.type === 'waitlist' && '📝'}
                </div>
                <div className="text-sm text-gray-600 px-6">
                  Preview: {template.name}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-gray-600 mb-4">{template.description}</p>

              <button
                onClick={() => handleSelectTemplate(template.type)}
                disabled={creating}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:bg-gray-300"
              >
                {creating ? 'Creating...' : 'Use This Template'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Template Option */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Start from Scratch</h3>
            <p className="text-sm text-gray-600">Build your own custom landing page</p>
          </div>
          <button
            onClick={() => handleSelectTemplate('sales')}
            disabled={creating}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors disabled:bg-gray-100"
          >
            Create Blank Page
          </button>
        </div>
      </div>
    </div>
  );
}

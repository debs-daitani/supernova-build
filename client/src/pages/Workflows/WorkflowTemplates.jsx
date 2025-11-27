/**
 * Workflow Templates
 * Browse and install pre-built workflow templates
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { value: 'all', label: 'All Templates' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'courses', label: 'Courses' },
  { value: 'crm', label: 'CRM & Contacts' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'support', label: 'Support' }
];

export default function WorkflowTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, [category]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);

      const response = await fetch(`/api/workflow-templates?${params}`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const installTemplate = async (templateId) => {
    try {
      const response = await fetch(`/api/workflow-templates/${templateId}/install`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/workflows/${data.workflow.id}/edit`);
      }
    } catch (error) {
      console.error('Error installing template:', error);
      alert('Failed to install template');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/workflows')}
            className="text-gray-400 hover:text-white mb-2"
          >
            ← Back to Workflows
          </button>
          <h1 className="text-3xl font-bold">Workflow Templates</h1>
          <p className="text-gray-400 mt-1">Pre-built workflows you can install and customize</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                category === cat.value ? 'bg-orange-500' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-12">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2">No Templates Found</h2>
            <p className="text-gray-400">Check back later for new templates</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => setSelectedTemplate(template)}
                onInstall={() => installTemplate(template.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onInstall={() => installTemplate(selectedTemplate.id)}
        />
      )}
    </div>
  );
}

function TemplateCard({ template, onPreview, onInstall }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-gray-600 transition-all">
      {/* Badge */}
      {template.isOfficial && (
        <div className="inline-block px-3 py-1 bg-blue-500 rounded text-xs font-bold mb-3">
          Official Template
        </div>
      )}
      {template.isFeatured && (
        <div className="inline-block px-3 py-1 bg-purple-500 rounded text-xs font-bold mb-3 ml-2">
          ⭐ Featured
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold mb-2">{template.name}</h3>
      <p className="text-sm text-gray-400 mb-4 line-clamp-3">{template.description}</p>

      {/* Category */}
      <div className="inline-block px-3 py-1 bg-gray-700 rounded text-xs mb-4 capitalize">
        {template.category}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
        <span>🚀 {template.usageCount} installs</span>
      </div>

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-900 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onPreview}
          className="flex-1 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
        >
          Preview
        </button>
        <button
          onClick={onInstall}
          className="flex-1 px-4 py-2 bg-orange-500 rounded hover:bg-orange-600 text-sm font-bold"
        >
          Install
        </button>
      </div>
    </div>
  );
}

function TemplatePreviewModal({ template, onClose, onInstall }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
              <div className="flex items-center gap-2">
                {template.isOfficial && (
                  <span className="px-3 py-1 bg-blue-500 rounded text-xs font-bold">
                    Official
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-700 rounded text-xs capitalize">
                  {template.category}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Description</h3>
            <p className="text-gray-400">{template.description}</p>
          </div>

          {/* Workflow Preview */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Workflow Preview</h3>
            <div className="bg-gray-900 rounded p-4">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(template.workflow, null, 2)}
              </pre>
            </div>
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-700 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mb-6">
            <div className="text-sm text-gray-400">
              🚀 {template.usageCount} people have installed this template
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onInstall}
              className="flex-1 bg-orange-500 py-3 rounded font-bold hover:bg-orange-600"
            >
              Install Template
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-gray-700 py-3 rounded font-bold hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

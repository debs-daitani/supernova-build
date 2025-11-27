/**
 * Phase 2BB: Signup Flow Builder
 * Dashboard - View and manage signup flows
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import signupFlowsService from '../../services/signup-flows';

export default function SignupFlowsDashboard() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    try {
      setLoading(true);
      const data = await signupFlowsService.getAllFlows();
      setFlows(data.flows || []);
    } catch (err) {
      console.error('Failed to load signup flows:', err);
      setError('Failed to load signup flows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateType) => {
    try {
      setCreating(true);
      const template = signupFlowsService.getTemplateConfig(templateType);

      const flowData = {
        name: template.name,
        flowType: template.flowType,
        steps: template.steps,
        confirmationMessage: template.confirmationMessage,
        leadMagnetName: template.leadMagnetName
      };

      const result = await signupFlowsService.createFlow(flowData);
      setShowTemplates(false);
      await loadFlows();
      navigate(`/signup-flows/${result.flow.id}/builder`);
    } catch (error) {
      console.error('Failed to create flow:', error);
      alert('Failed to create signup flow');
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (id, isPublished) => {
    try {
      if (isPublished) {
        await signupFlowsService.unpublishFlow(id);
      } else {
        await signupFlowsService.publishFlow(id);
      }
      await loadFlows();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
      alert('Failed to update flow');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await signupFlowsService.duplicateFlow(id);
      await loadFlows();
    } catch (err) {
      console.error('Failed to duplicate flow:', err);
      alert('Failed to duplicate flow');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will delete all submissions.')) {
      return;
    }

    try {
      await signupFlowsService.deleteFlow(id);
      await loadFlows();
    } catch (err) {
      console.error('Failed to delete flow:', err);
      alert('Failed to delete flow');
    }
  };

  const getFlowIcon = (type) => {
    const icons = {
      lead_magnet: '📚',
      waitlist: '📝',
      trial: '🚀',
      newsletter: '📧',
      event: '📹',
      quiz: '❓'
    };
    return icons[type] || '📄';
  };

  const flowTypes = signupFlowsService.getFlowTypes();

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
          <h1 className="text-3xl font-bold text-gray-900">Signup Flows</h1>
          <p className="text-gray-600 mt-1">Create multi-step forms and lead magnets</p>
        </div>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          + Create Signup Flow
        </button>
      </div>

      {/* Template Selector */}
      {showTemplates && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Choose a Template</h2>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flowTypes.map((flowType) => (
              <button
                key={flowType.type}
                onClick={() => handleCreateFromTemplate(flowType.type)}
                disabled={creating}
                className="text-left p-6 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
              >
                <div className="text-4xl mb-3">{flowType.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{flowType.name}</h3>
                <p className="text-sm text-gray-600">{flowType.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flows List */}
      {flows.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No signup flows yet</h3>
          <p className="text-gray-600 mb-6">Create your first signup flow to capture leads</p>
          <button
            onClick={() => setShowTemplates(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Choose Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map((flow) => {
            const conversionRate = flow.conversionRate || 0;
            const hasStats = flow.starts > 0;

            return (
              <div key={flow.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 flex items-center gap-4">
                  <div className="text-4xl">{getFlowIcon(flow.flowType)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{flow.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{flow.flowType.replace('_', ' ')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    flow.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {flow.isPublished ? 'Live' : 'Draft'}
                  </span>
                </div>

                {/* Stats */}
                <div className="p-6">
                  {hasStats ? (
                    <>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{flow.starts}</div>
                          <div className="text-xs text-gray-600">Starts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{flow.completions}</div>
                          <div className="text-xs text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{conversionRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-600">Conv. Rate</div>
                        </div>
                      </div>

                      {/* URL */}
                      {flow.isPublished && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">URL:</div>
                          <a
                            href={`/signup/${flow.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:text-purple-700 truncate block"
                          >
                            /signup/{flow.slug}
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mb-4 py-4 text-center text-sm text-gray-600">
                      No submissions yet
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/signup-flows/${flow.id}/builder`)}
                      className="flex-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    {hasStats && (
                      <>
                        <button
                          onClick={() => navigate(`/signup-flows/${flow.id}/submissions`)}
                          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors text-sm font-medium"
                          title="Submissions"
                        >
                          📊
                        </button>
                        <button
                          onClick={() => navigate(`/signup-flows/${flow.id}/analytics`)}
                          className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors text-sm font-medium"
                          title="Analytics"
                        >
                          📈
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handlePublish(flow.id, flow.isPublished)}
                      className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        flow.isPublished
                          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                          : 'bg-green-100 hover:bg-green-200 text-green-800'
                      }`}
                      title={flow.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {flow.isPublished ? '👁️' : '🚀'}
                    </button>
                    <button
                      onClick={() => handleDuplicate(flow.id)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm font-medium"
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDelete(flow.id)}
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
        <h3 className="font-semibold text-purple-900 mb-3">💡 Signup Flow Tips</h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>✅ Keep forms short - fewer fields = higher completion rates</li>
          <li>✅ Use multi-step for longer forms to reduce overwhelming users</li>
          <li>✅ Add progress indicators so users know how many steps remain</li>
          <li>✅ Test your flow before publishing to catch any issues</li>
          <li>✅ Track analytics to see where people drop off</li>
        </ul>
      </div>
    </div>
  );
}

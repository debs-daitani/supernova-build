/**
 * Phase 2BB: Signup Flow Builder
 * Builder - Edit signup flow steps and settings
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import signupFlowsService from '../../services/signup-flows';

export default function SignupFlowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('steps');

  useEffect(() => {
    loadFlow();
  }, [id]);

  const loadFlow = async () => {
    try {
      setLoading(true);
      const data = await signupFlowsService.getFlow(id);
      setFlow(data.flow);
      setSteps(data.flow.steps || []);
    } catch (error) {
      console.error('Failed to load flow:', error);
      alert('Failed to load flow');
      navigate('/signup-flows');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await signupFlowsService.updateFlow(id, {
        name: flow.name,
        steps,
        confirmationMessage: flow.confirmationMessage,
        showProgress: flow.showProgress,
        allowBack: flow.allowBack
      });
      alert('Flow saved!');
    } catch (error) {
      console.error('Failed to save flow:', error);
      alert('Failed to save flow');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStep = (index, updates) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSteps(newSteps);
  };

  const handleDeleteStep = (index) => {
    if (confirm('Delete this step?')) {
      const newSteps = steps.filter((_, i) => i !== index);
      setSteps(newSteps);
    }
  };

  const handleAddStep = () => {
    const newSteps = [...steps, {
      title: 'New Step',
      fields: [],
      buttonText: 'Continue'
    }];
    setSteps(newSteps);
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
            onClick={() => navigate('/signup-flows')}
            className="text-purple-600 hover:text-purple-700 mb-2"
          >
            ← Back to Signup Flows
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{flow.name}</h1>
        </div>
        <div className="flex gap-3">
          {flow.isPublished && (
            <a
              href={`/signup/${flow.slug}`}
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
            {saving ? 'Saving...' : 'Save Flow'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('steps')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'steps'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Steps ({steps.length})
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

      {/* Steps Tab */}
      {activeTab === 'steps' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Form Steps</h2>
            <button
              onClick={handleAddStep}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              + Add Step
            </button>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <StepEditor
                key={index}
                step={step}
                index={index}
                onUpdate={(updates) => handleUpdateStep(index, updates)}
                onDelete={() => handleDeleteStep(index)}
              />
            ))}
          </div>

          {steps.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-600 mb-4">No steps yet. Add a step to start building your form.</p>
              <button
                onClick={handleAddStep}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Add First Step
              </button>
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
                Flow Name
              </label>
              <input
                type="text"
                value={flow.name}
                onChange={(e) => setFlow({ ...flow, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Confirmation Message
              </label>
              <textarea
                value={flow.confirmationMessage || ''}
                onChange={(e) => setFlow({ ...flow, confirmationMessage: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="🎉 Thanks for signing up! Check your email."
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={flow.showProgress}
                  onChange={(e) => setFlow({ ...flow, showProgress: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Show Progress Indicator</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={flow.allowBack}
                  onChange={(e) => setFlow({ ...flow, allowBack: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Allow Back Button</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step Editor Component
function StepEditor({ step, index, onUpdate, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-600">Step {index + 1}</span>
          <h3 className="font-semibold text-gray-900">{step.title}</h3>
          <span className="text-sm text-gray-600">({step.fields?.length || 0} fields)</span>
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
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Step Title
            </label>
            <input
              type="text"
              value={step.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={step.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              placeholder="Additional information for this step"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={step.buttonText || 'Continue'}
              onChange={(e) => onUpdate({ buttonText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">
                Fields
              </label>
              <p className="text-xs text-gray-500 italic">
                Advanced field editing coming soon!
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              {step.fields && step.fields.length > 0 ? (
                <div className="space-y-2">
                  {step.fields.map((field, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-900">{field.label}</span>
                      <span className="text-xs text-gray-600 capitalize">{field.type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center">No fields yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

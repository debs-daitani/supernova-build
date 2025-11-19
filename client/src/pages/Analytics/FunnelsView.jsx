/**
 * Funnels View
 * Create and track conversion funnels
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FunnelsView() {
  const navigate = useNavigate();
  const [funnels, setFunnels] = useState([]);
  const [selectedFunnel, setSelectedFunnel] = useState(null);
  const [funnelStats, setFunnelStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadFunnels();
  }, []);

  useEffect(() => {
    if (selectedFunnel) {
      loadFunnelStats(selectedFunnel.id);
    }
  }, [selectedFunnel]);

  const loadFunnels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/funnels');
      const data = await response.json();
      setFunnels(data.funnels || []);

      if (data.funnels && data.funnels.length > 0) {
        setSelectedFunnel(data.funnels[0]);
      }
    } catch (error) {
      console.error('Error loading funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFunnelStats = async (funnelId) => {
    try {
      const response = await fetch(`/api/analytics/funnels/${funnelId}/stats`);
      const data = await response.json();
      setFunnelStats(data.stats);
    } catch (error) {
      console.error('Error loading funnel stats:', error);
    }
  };

  const deleteFunnel = async (funnelId) => {
    if (!confirm('Delete this funnel?')) return;

    try {
      await fetch(`/api/analytics/funnels/${funnelId}`, {
        method: 'DELETE'
      });
      loadFunnels();
    } catch (error) {
      console.error('Error deleting funnel:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-gray-400 hover:text-white mb-2"
            >
              ← Back to Analytics
            </button>
            <h1 className="text-3xl font-bold">Conversion Funnels</h1>
            <p className="text-gray-400 mt-1">Track multi-step conversions</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 px-6 py-3 rounded hover:bg-orange-600"
          >
            Create Funnel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {funnels.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">No Funnels Yet</h2>
            <p className="text-gray-400 mb-6">Create your first conversion funnel to track multi-step processes</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 px-6 py-3 rounded hover:bg-orange-600"
            >
              Create Funnel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funnel List */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="font-bold mb-4">Your Funnels</h2>
              <div className="space-y-2">
                {funnels.map(funnel => (
                  <div
                    key={funnel.id}
                    onClick={() => setSelectedFunnel(funnel)}
                    className={`p-4 rounded cursor-pointer border-2 ${
                      selectedFunnel?.id === funnel.id
                        ? 'border-orange-500 bg-gray-700'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">{funnel.name}</div>
                        <div className="text-sm text-gray-400">{funnel.steps.length} steps</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFunnel(funnel.id);
                        }}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Funnel Visualization */}
            <div className="lg:col-span-2">
              {selectedFunnel && funnelStats && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">{selectedFunnel.name}</h2>
                    {selectedFunnel.description && (
                      <p className="text-gray-400">{selectedFunnel.description}</p>
                    )}
                  </div>

                  {/* Overall Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-700 rounded p-4">
                      <div className="text-sm text-gray-400">Started</div>
                      <div className="text-2xl font-bold">{funnelStats.totalStarted}</div>
                    </div>
                    <div className="bg-gray-700 rounded p-4">
                      <div className="text-sm text-gray-400">Completed</div>
                      <div className="text-2xl font-bold">{funnelStats.totalCompleted}</div>
                    </div>
                    <div className="bg-gray-700 rounded p-4">
                      <div className="text-sm text-gray-400">Conversion Rate</div>
                      <div className="text-2xl font-bold text-green-400">
                        {funnelStats.conversionRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Funnel Steps Visualization */}
                  <div className="space-y-4">
                    {funnelStats.stepStats.map((stepStat, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <span className="font-bold">{stepStat.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{stepStat.reached}</div>
                            <div className="text-sm text-gray-400">
                              {stepStat.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-8">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ width: `${stepStat.percentage}%` }}
                          >
                            {stepStat.percentage > 10 && `${stepStat.percentage.toFixed(1)}%`}
                          </div>
                        </div>

                        {/* Drop-off indicator */}
                        {index < funnelStats.stepStats.length - 1 && (
                          <div className="text-center py-2">
                            <div className="text-sm text-red-400">
                              ↓ {(stepStat.percentage - funnelStats.stepStats[index + 1].percentage).toFixed(1)}% drop-off
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Funnel Modal */}
      {showCreateModal && (
        <CreateFunnelModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadFunnels();
          }}
        />
      )}
    </div>
  );
}

function CreateFunnelModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([
    { name: '', event: '' },
    { name: '', event: '' }
  ]);
  const [saving, setSaving] = useState(false);

  const addStep = () => {
    setSteps([...steps, { name: '', event: '' }]);
  };

  const removeStep = (index) => {
    if (steps.length > 2) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await fetch('/api/analytics/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          steps
        })
      });

      const data = await response.json();

      if (data.success) {
        onCreated();
      }
    } catch (error) {
      console.error('Error creating funnel:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Create Conversion Funnel</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Funnel Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Signup Flow, Checkout Process"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this funnel tracks..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                rows="3"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold">Funnel Steps</label>
                <button
                  type="button"
                  onClick={addStep}
                  className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                >
                  + Add Step
                </button>
              </div>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="bg-gray-700 rounded p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold">Step {index + 1}</span>
                      {steps.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => updateStep(index, 'name', e.target.value)}
                        placeholder="Step name (e.g., Landing Page)"
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2"
                        required
                      />
                      <input
                        type="text"
                        value={step.event}
                        onChange={(e) => updateStep(index, 'event', e.target.value)}
                        placeholder="Event trigger (e.g., page_view:/signup)"
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-orange-500 py-3 rounded font-bold hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Funnel'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 bg-gray-700 py-3 rounded font-bold hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

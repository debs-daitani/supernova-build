/**
 * Phase 2AZ: Email Automation Sequences
 * Admin Dashboard - View and manage all email sequences
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emailSequencesService from '../../services/email-sequences';

export default function EmailSequences() {
  const navigate = useNavigate();
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [processingQueue, setProcessingQueue] = useState(false);

  useEffect(() => {
    loadSequences();
  }, []);

  const loadSequences = async () => {
    try {
      setLoading(true);
      const data = await emailSequencesService.getAllSequences();
      setSequences(data.sequences || []);
    } catch (err) {
      console.error('Failed to load sequences:', err);
      setError('Failed to load email sequences');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSequence = async (id) => {
    try {
      await emailSequencesService.pauseSequence(id);
      await loadSequences();
    } catch (err) {
      console.error('Failed to pause sequence:', err);
      alert('Failed to pause sequence');
    }
  };

  const handleActivateSequence = async (id) => {
    try {
      await emailSequencesService.activateSequence(id);
      await loadSequences();
    } catch (err) {
      console.error('Failed to activate sequence:', err);
      alert('Failed to activate sequence');
    }
  };

  const handleDeleteSequence = async (id) => {
    if (!confirm('Are you sure? This will delete the sequence and all enrollments.')) {
      return;
    }

    try {
      await emailSequencesService.deleteSequence(id);
      await loadSequences();
    } catch (err) {
      console.error('Failed to delete sequence:', err);
      alert('Failed to delete sequence');
    }
  };

  const handleCreateFromTemplate = async (templateType) => {
    try {
      const template = emailSequencesService.getSequenceTemplate(templateType);
      if (!template) return;

      const { emails, ...sequenceData } = template;

      // Create sequence
      const result = await emailSequencesService.createSequence(sequenceData);

      // Add emails to sequence
      for (const email of emails) {
        await emailSequencesService.addEmail(result.sequence.id, email);
      }

      setShowTemplates(false);
      await loadSequences();
      navigate(`/admin/email-sequences/${result.sequence.id}`);
    } catch (err) {
      console.error('Failed to create sequence from template:', err);
      alert('Failed to create sequence');
    }
  };

  const handleProcessQueue = async () => {
    try {
      setProcessingQueue(true);
      const result = await emailSequencesService.processQueue();
      alert(`Queue processed: ${result.sent} sent, ${result.failed} failed, ${result.completed} completed`);
    } catch (err) {
      console.error('Failed to process queue:', err);
      alert('Failed to process email queue');
    } finally {
      setProcessingQueue(false);
    }
  };

  const getSequenceTypeColor = (type) => {
    const colors = {
      welcome: 'bg-blue-100 text-blue-800',
      onboarding: 'bg-green-100 text-green-800',
      upgrade: 'bg-purple-100 text-purple-800',
      engagement: 'bg-yellow-100 text-yellow-800',
      launch: 'bg-red-100 text-red-800',
      milestone: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Email Sequences</h1>
          <p className="text-gray-600 mt-1">Automated email campaigns for every customer journey stage</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleProcessQueue}
            disabled={processingQueue}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:bg-gray-300"
          >
            {processingQueue ? 'Processing...' : 'Process Queue'}
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Create from Template
          </button>
          <button
            onClick={() => navigate('/admin/email-sequences/new')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            + New Sequence
          </button>
        </div>
      </div>

      {/* Template Picker */}
      {showTemplates && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-4">Choose a Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['welcome', 'onboarding', 'upgrade', 'reengagement', 'milestone', 'launch'].map((type) => {
              const template = emailSequencesService.getSequenceTemplate(type);
              return (
                <button
                  key={type}
                  onClick={() => handleCreateFromTemplate(type)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{template.emails.length} emails</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sequences List */}
      {sequences.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No sequences yet</h3>
          <p className="text-gray-600 mb-6">Create your first email sequence to start automating customer communications</p>
          <button
            onClick={() => setShowTemplates(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Create from Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sequences.map((sequence) => (
            <div key={sequence.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{sequence.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSequenceTypeColor(sequence.sequenceType)}`}>
                      {sequence.sequenceType}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sequence.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sequence.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  {sequence.description && (
                    <p className="text-gray-600 mb-3">{sequence.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>📧 {sequence._count?.emails || 0} emails</span>
                    <span>👥 {sequence._count?.enrollments || 0} enrollments</span>
                    <span>📨 {sequence.recipientsCount} sent</span>
                    <span>Trigger: <span className="font-medium">{sequence.triggerEvent}</span></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {sequence.isActive ? (
                    <button
                      onClick={() => handlePauseSequence(sequence.id)}
                      className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivateSequence(sequence.id)}
                      className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                    >
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/admin/email-sequences/${sequence.id}`)}
                    className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSequence(sequence.id)}
                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Stats */}
              {sequence.recipientsCount > 0 && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {sequence.openRate ? `${sequence.openRate.toFixed(1)}%` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Click Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {sequence.clickRate ? `${sequence.clickRate.toFixed(1)}%` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {sequence.conversionRate ? `${sequence.conversionRate.toFixed(1)}%` : '-'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

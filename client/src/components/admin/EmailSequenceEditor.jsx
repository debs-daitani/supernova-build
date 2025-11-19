/**
 * Phase 2AZ: Email Automation Sequences
 * Sequence Editor - Create and edit email sequences
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import emailSequencesService from '../../services/email-sequences';

export default function EmailSequenceEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [sequence, setSequence] = useState({
    name: '',
    description: '',
    sequenceType: 'welcome',
    triggerEvent: 'user_signup',
    triggerDelay: 0,
    isActive: true,
    conditions: {}
  });
  const [emails, setEmails] = useState([]);
  const [editingEmail, setEditingEmail] = useState(null);

  useEffect(() => {
    if (!isNew) {
      loadSequence();
    }
  }, [id]);

  const loadSequence = async () => {
    try {
      setLoading(true);
      const data = await emailSequencesService.getSequence(id);
      setSequence(data.sequence);
      setEmails(data.sequence.emails || []);
    } catch (err) {
      console.error('Failed to load sequence:', err);
      alert('Failed to load sequence');
      navigate('/admin/email-sequences');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSequence = async () => {
    try {
      setSaving(true);

      if (isNew) {
        const result = await emailSequencesService.createSequence(sequence);
        navigate(`/admin/email-sequences/${result.sequence.id}`);
      } else {
        await emailSequencesService.updateSequence(id, sequence);
        alert('Sequence updated!');
      }
    } catch (err) {
      console.error('Failed to save sequence:', err);
      alert('Failed to save sequence');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmail = () => {
    setEditingEmail({
      order: emails.length,
      delayDays: 0,
      delayHours: 0,
      subject: '',
      previewText: '',
      htmlContent: '',
      textContent: '',
      ctaText: '',
      ctaUrl: ''
    });
  };

  const handleSaveEmail = async (emailData) => {
    try {
      if (editingEmail.id) {
        // Update existing email
        await emailSequencesService.updateEmail(editingEmail.id, emailData);
      } else {
        // Add new email
        await emailSequencesService.addEmail(id, emailData);
      }

      await loadSequence();
      setEditingEmail(null);
    } catch (err) {
      console.error('Failed to save email:', err);
      alert('Failed to save email');
    }
  };

  const handleDeleteEmail = async (emailId) => {
    if (!confirm('Delete this email?')) return;

    try {
      await emailSequencesService.deleteEmail(emailId);
      await loadSequence();
    } catch (err) {
      console.error('Failed to delete email:', err);
      alert('Failed to delete email');
    }
  };

  const sequenceTypes = [
    { value: 'welcome', label: 'Welcome Series' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'upgrade', label: 'Upgrade Campaign' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'launch', label: 'Launch' },
    { value: 'milestone', label: 'Milestone' }
  ];

  const triggerEvents = [
    { value: 'user_signup', label: 'User Signup' },
    { value: 'trial_start', label: 'Trial Start' },
    { value: 'upgrade', label: 'User Upgraded' },
    { value: 'inactive_7days', label: 'Inactive 7 Days' },
    { value: 'inactive_30days', label: 'Inactive 30 Days' },
    { value: 'milestone_reached', label: 'Milestone Reached' },
    { value: 'launch_announced', label: 'Launch Announced' }
  ];

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
            onClick={() => navigate('/admin/email-sequences')}
            className="text-purple-600 hover:text-purple-700 mb-2"
          >
            ← Back to Sequences
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'New Email Sequence' : sequence.name}
          </h1>
        </div>
        <button
          onClick={handleSaveSequence}
          disabled={saving}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:bg-gray-300"
        >
          {saving ? 'Saving...' : 'Save Sequence'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Sequence Details
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            disabled={isNew}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'emails'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            } ${isNew ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Emails ({emails.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            disabled={isNew}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            } ${isNew ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Sequence Name *
              </label>
              <input
                type="text"
                value={sequence.name}
                onChange={(e) => setSequence({ ...sequence, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="e.g. Welcome Series"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={sequence.description || ''}
                onChange={(e) => setSequence({ ...sequence, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="What is this sequence for?"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sequence Type *
                </label>
                <select
                  value={sequence.sequenceType}
                  onChange={(e) => setSequence({ ...sequence, sequenceType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  {sequenceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Trigger Event *
                </label>
                <select
                  value={sequence.triggerEvent}
                  onChange={(e) => setSequence({ ...sequence, triggerEvent: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  {triggerEvents.map((event) => (
                    <option key={event.value} value={event.value}>
                      {event.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Trigger Delay (minutes)
              </label>
              <input
                type="number"
                value={sequence.triggerDelay || 0}
                onChange={(e) => setSequence({ ...sequence, triggerDelay: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                min="0"
              />
              <p className="text-sm text-gray-600 mt-1">How long to wait after trigger event before starting sequence</p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sequence.isActive}
                  onChange={(e) => setSequence({ ...sequence, isActive: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-gray-900">Active</span>
              </label>
              <p className="text-sm text-gray-600 mt-1 ml-7">
                When active, new users matching the trigger will be automatically enrolled
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emails Tab */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Email Sequence</h2>
            <button
              onClick={handleAddEmail}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              + Add Email
            </button>
          </div>

          {emails.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No emails yet</h3>
              <p className="text-gray-600 mb-6">Add your first email to start building the sequence</p>
              <button
                onClick={handleAddEmail}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Add First Email
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {emails.map((email, index) => (
                <div key={email.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-600">Email #{index + 1}</span>
                        <span className="text-sm text-gray-600">
                          Delay: {email.delayDays}d {email.delayHours}h
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{email.subject}</h3>
                      {email.previewText && (
                        <p className="text-sm text-gray-600 mb-3">{email.previewText}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📨 {email.sentCount} sent</span>
                        <span>👀 {email.openCount} opens</span>
                        <span>🖱️ {email.clickCount} clicks</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingEmail(email)}
                        className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEmail(email.id)}
                        className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
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
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sequence Performance</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Open Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {sequence.openRate ? `${sequence.openRate.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Click Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {sequence.clickRate ? `${sequence.clickRate.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {sequence.conversionRate ? `${sequence.conversionRate.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Editor Modal */}
      {editingEmail && (
        <EmailEditorModal
          email={editingEmail}
          onSave={handleSaveEmail}
          onCancel={() => setEditingEmail(null)}
        />
      )}
    </div>
  );
}

// Email Editor Modal Component
function EmailEditorModal({ email, onSave, onCancel }) {
  const [emailData, setEmailData] = useState(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(emailData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {email.id ? 'Edit Email' : 'Add Email'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Delay (Days) *
              </label>
              <input
                type="number"
                value={emailData.delayDays}
                onChange={(e) => setEmailData({ ...emailData, delayDays: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Delay (Hours)
              </label>
              <input
                type="number"
                value={emailData.delayHours}
                onChange={(e) => setEmailData({ ...emailData, delayHours: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                min="0"
                max="23"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Subject Line *
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              placeholder="e.g. Welcome to The dAItaniverse, {{preferredName}}!"
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              Available variables: {'{'}{'{'} name{'}'}{'}'}, {'{'}{'{'} preferredName{'}'}{'}'}, {'{'}{'{'} pronouns{'}'}{'}'}, {'{'}{'{'} businessGoal{'}'}{'}'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Preview Text
            </label>
            <input
              type="text"
              value={emailData.previewText || ''}
              onChange={(e) => setEmailData({ ...emailData, previewText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              placeholder="Short preview text shown in inbox"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Text Content *
            </label>
            <textarea
              value={emailData.textContent}
              onChange={(e) => setEmailData({ ...emailData, textContent: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 font-mono text-sm"
              placeholder="Plain text version of the email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              HTML Content *
            </label>
            <textarea
              value={emailData.htmlContent}
              onChange={(e) => setEmailData({ ...emailData, htmlContent: e.target.value })}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 font-mono text-sm"
              placeholder="<p>HTML version of the email</p>"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={emailData.ctaText || ''}
                onChange={(e) => setEmailData({ ...emailData, ctaText: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="e.g. Get Started"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                CTA Button URL
              </label>
              <input
                type="text"
                value={emailData.ctaUrl || ''}
                onChange={(e) => setEmailData({ ...emailData, ctaUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="/dashboard"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Save Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

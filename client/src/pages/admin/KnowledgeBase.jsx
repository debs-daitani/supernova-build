import React, { useState, useEffect } from 'react';
import supernovaService from '../../services/supernova';

export default function KnowledgeBase() {
  const [knowledge, setKnowledge] = useState([]);
  const [activeKnowledge, setActiveKnowledge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    version: '',
    content: '',
    description: '',
    frameworks: '',
    pillars: '',
    methodologies: '',
    voiceTone: '',
    firstContactProtocol: ''
  });

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      setLoading(true);
      const [allData, activeData] = await Promise.all([
        supernovaService.getAllKnowledge(),
        supernovaService.getActiveKnowledge().catch(() => null)
      ]);

      setKnowledge(allData);
      setActiveKnowledge(activeData);
    } catch (error) {
      console.error('Failed to load knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!formData.version || !formData.content) {
      alert('Version and content are required');
      return;
    }

    try {
      setUploading(true);

      // Parse JSON fields if provided
      const data = {
        version: formData.version,
        content: formData.content,
        description: formData.description || null,
        tokenCount: formData.content.split(/\s+/).length // Approximate token count
      };

      // Try to parse JSON fields
      try {
        if (formData.frameworks) data.frameworks = JSON.parse(formData.frameworks);
      } catch (e) {
        data.frameworks = { raw: formData.frameworks };
      }

      try {
        if (formData.pillars) data.pillars = JSON.parse(formData.pillars);
      } catch (e) {
        data.pillars = { raw: formData.pillars };
      }

      try {
        if (formData.methodologies) data.methodologies = JSON.parse(formData.methodologies);
      } catch (e) {
        data.methodologies = { raw: formData.methodologies };
      }

      try {
        if (formData.voiceTone) data.voiceTone = JSON.parse(formData.voiceTone);
      } catch (e) {
        data.voiceTone = { raw: formData.voiceTone };
      }

      try {
        if (formData.firstContactProtocol) data.firstContactProtocol = JSON.parse(formData.firstContactProtocol);
      } catch (e) {
        data.firstContactProtocol = { raw: formData.firstContactProtocol };
      }

      await supernovaService.uploadKnowledge(data);
      alert('Knowledge base uploaded successfully!');
      setShowUploadForm(false);
      setFormData({
        version: '',
        content: '',
        description: '',
        frameworks: '',
        pillars: '',
        methodologies: '',
        voiceTone: '',
        firstContactProtocol: ''
      });
      loadKnowledge();
    } catch (error) {
      console.error('Failed to upload knowledge:', error);
      alert('Failed to upload knowledge base. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (id) => {
    if (!window.confirm('Activate this knowledge base version? This will deactivate the current version.')) return;

    try {
      await supernovaService.activateKnowledge(id);
      alert('Knowledge base activated! All AI will now use this version.');
      loadKnowledge();
    } catch (error) {
      console.error('Failed to activate knowledge:', error);
      alert('Failed to activate knowledge base.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this knowledge base version? This cannot be undone.')) return;

    try {
      await supernovaService.deleteKnowledge(id);
      alert('Knowledge base deleted successfully.');
      loadKnowledge();
    } catch (error) {
      console.error('Failed to delete knowledge:', error);
      alert(error.response?.data?.error || 'Failed to delete knowledge base.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SUPERNova Knowledge Base</h1>
          <p className="text-lg text-gray-600">
            Manage your AI brain - frameworks, voice, and coaching expertise
          </p>
        </div>

        {/* Active knowledge card */}
        {activeKnowledge && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                    ✅ ACTIVE
                  </span>
                  <h3 className="text-2xl font-bold">Version {activeKnowledge.version}</h3>
                </div>
                <p className="text-purple-100 mb-4">{activeKnowledge.description || 'No description'}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-purple-200">Activated</div>
                    <div className="font-semibold">
                      {new Date(activeKnowledge.activatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-200">Token Count</div>
                    <div className="font-semibold">
                      {activeKnowledge.tokenCount?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-200">Last Updated</div>
                    <div className="font-semibold">
                      {new Date(activeKnowledge.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-6xl">🧠</div>
            </div>
          </div>
        )}

        {/* Upload button */}
        <div className="mb-6">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          >
            {showUploadForm ? '✖ Cancel' : '+ Upload New Version'}
          </button>
        </div>

        {/* Upload form */}
        {showUploadForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Knowledge Base</h2>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Version *
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="e.g., v1.0, v1.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What's in this version?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Brain Content * <span className="font-normal text-gray-600">(Paste your full brain document)</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Paste your complete knowledge base here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono text-sm"
                  rows={12}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Words: {formData.content.split(/\s+/).filter(w => w).length.toLocaleString()}
                </p>
              </div>

              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  Optional: Structured Data (Advanced)
                </summary>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frameworks (JSON)
                    </label>
                    <textarea
                      value={formData.frameworks}
                      onChange={(e) => setFormData({ ...formData, frameworks: e.target.value })}
                      placeholder='{"messaging": "...", "content": "..."}'
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      3 Pillars (JSON)
                    </label>
                    <textarea
                      value={formData.pillars}
                      onChange={(e) => setFormData({ ...formData, pillars: e.target.value })}
                      placeholder='{"body": "...", "brain": "...", "business": "..."}'
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Voice & Tone (JSON)
                    </label>
                    <textarea
                      value={formData.voiceTone}
                      onChange={(e) => setFormData({ ...formData, voiceTone: e.target.value })}
                      placeholder='{"style": "direct", "profanity": true, ...}'
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              </details>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-300"
                >
                  {uploading ? 'Uploading...' : 'Upload Knowledge Base'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Knowledge versions list */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-900">All Versions</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading knowledge bases...</p>
            </div>
          ) : knowledge.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No knowledge bases yet</h3>
              <p className="text-gray-600">Upload your first version to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {knowledge.map((kb) => (
                <div key={kb.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Version {kb.version}
                        </h3>
                        {kb.isActive && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {kb.description && (
                        <p className="text-gray-600 mb-3">{kb.description}</p>
                      )}

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Created</div>
                          <div className="font-medium text-gray-900">
                            {new Date(kb.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Token Count</div>
                          <div className="font-medium text-gray-900">
                            {kb.tokenCount?.toLocaleString() || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Frameworks</div>
                          <div className="font-medium text-gray-900">
                            {kb.frameworks ? '✓ Yes' : '✗ No'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Voice/Tone</div>
                          <div className="font-medium text-gray-900">
                            {kb.voiceTone ? '✓ Yes' : '✗ No'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      {!kb.isActive && (
                        <button
                          onClick={() => handleActivate(kb.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(kb.id)}
                        disabled={kb.isActive}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
}

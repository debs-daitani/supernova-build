import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documents, documentFolders, documentTemplates } from '../../services/api';

export default function DocumentsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [folders, setFolders] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filter, setFilter] = useState('all'); // 'all', 'shared', 'recent'
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = [
    { id: '1', name: 'Business Proposal', category: 'business', icon: '💼', description: 'Professional proposal template' },
    { id: '2', name: 'Project Report', category: 'business', icon: '📊', description: 'Detailed project report' },
    { id: '3', name: 'Essay', category: 'academic', icon: '📝', description: 'Academic essay template' },
    { id: '4', name: 'Research Paper', category: 'academic', icon: '🔬', description: 'Research paper with citations' },
    { id: '5', name: 'Resume', category: 'personal', icon: '👤', description: 'Professional resume' },
    { id: '6', name: 'Cover Letter', category: 'personal', icon: '✉️', description: 'Job cover letter' },
    { id: '7', name: 'Meeting Notes', category: 'business', icon: '📋', description: 'Meeting notes template' },
    { id: '8', name: 'Creative Writing', category: 'creative', icon: '✍️', description: 'Story/novel template' },
  ];

  useEffect(() => {
    loadDocuments();
    loadFolders();
  }, [filter]);

  const loadDocuments = async () => {
    try {
      const params = {};
      if (filter === 'shared') params.shared = 'true';
      if (filter === 'recent') params.recent = 'true';

      const data = await documents.list(params);
      setDocs(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const data = await documentFolders.list();
      setFolders(data);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const handleCreateDocument = async (title = 'Untitled Document') => {
    try {
      const doc = await documents.create({ title });
      // TODO: Navigate to document editor when built
      alert('Document editor coming soon! Document created successfully.');
      loadDocuments();
    } catch (error) {
      console.error('Failed to create document:', error);
      alert('Failed to create document.');
    }
  };

  const handleCreateFromTemplate = async (templateId) => {
    try {
      // TODO: Create from template
      alert('Template-based document creation coming soon!');
      setShowTemplates(false);
    } catch (error) {
      console.error('Failed to create from template:', error);
      alert('Failed to create document from template.');
    }
  };

  const handleOpenDocument = (docId) => {
    // TODO: Navigate to document editor when built
    alert('Document editor coming soon!');
  };

  const handleDeleteDocument = async (e, docId) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documents.delete(docId);
      loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document.');
    }
  };

  const handleShareDocument = (e, docId) => {
    e.stopPropagation();
    // TODO: Open share modal
    alert('Sharing functionality coming soon!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">📝</div>
            <p className="text-blue-300">Loading your documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📝 Documents</h1>
              <p className="text-blue-200">Write and collaborate in real-time</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                📋 Templates
              </button>
              <button
                onClick={() => handleCreateDocument()}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg"
              >
                + New Document
              </button>
            </div>
          </div>

          {/* Filters & View Mode */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                }`}
              >
                All Documents
              </button>
              <button
                onClick={() => setFilter('recent')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'recent'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setFilter('shared')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'shared'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                }`}
              >
                Shared with me
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                }`}
                title="Grid view"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                }`}
                title="List view"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Template Selection Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl max-w-4xl w-full p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Choose Template</h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleCreateFromTemplate(template.id)}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-blue-400/50 transition-all text-left group"
                  >
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <h3 className="text-white font-bold mb-1 group-hover:text-blue-300 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-blue-300 text-xs mb-2">{template.description}</p>
                    <span className="text-blue-400 text-xs capitalize">{template.category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        {docs.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <p className="text-6xl mb-4">📄</p>
            <h3 className="text-white text-2xl font-bold mb-2">No documents yet</h3>
            <p className="text-blue-300 mb-6">
              Create your first document to get started!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleCreateDocument()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Create Document
              </button>
              <button
                onClick={() => setShowTemplates(true)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Use Template
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {docs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleOpenDocument(doc.id)}
                className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-blue-400/50 transition-all cursor-pointer group"
              >
                {/* Document Preview */}
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-900/50 to-indigo-900/50 flex items-center justify-center">
                  <div className="text-6xl opacity-50">📄</div>
                </div>

                {/* Document Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-blue-300 transition-colors">
                    {doc.title}
                  </h3>

                  <div className="flex items-center gap-2 text-blue-300 text-sm mb-2">
                    {doc.wordCount > 0 && (
                      <>
                        <span>{doc.wordCount} words</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formatDate(doc.updatedAt)}</span>
                  </div>

                  {doc.collaborators && doc.collaborators.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-blue-400 text-xs">👥 Shared</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleShareDocument(e, doc.id)}
                      className="text-blue-300 hover:text-blue-200 text-sm"
                      title="Share"
                    >
                      🔗
                    </button>
                    <button
                      onClick={(e) => handleDeleteDocument(e, doc.id)}
                      className="text-red-300 hover:text-red-200 text-sm"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            {docs.map((doc, index) => (
              <div
                key={doc.id}
                onClick={() => handleOpenDocument(doc.id)}
                className={`p-4 hover:bg-white/5 cursor-pointer transition-all ${
                  index > 0 ? 'border-t border-white/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">📄</div>
                    <div>
                      <h3 className="text-white font-bold">{doc.title}</h3>
                      <div className="flex items-center gap-2 text-blue-300 text-sm">
                        {doc.wordCount > 0 && (
                          <>
                            <span>{doc.wordCount} words</span>
                            <span>•</span>
                          </>
                        )}
                        <span>Edited {formatDate(doc.updatedAt)}</span>
                        {doc.collaborators && doc.collaborators.length > 0 && (
                          <>
                            <span>•</span>
                            <span>👥 Shared</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => handleShareDocument(e, doc.id)}
                      className="text-blue-300 hover:text-blue-200 px-3 py-1"
                      title="Share"
                    >
                      🔗 Share
                    </button>
                    <button
                      onClick={(e) => handleDeleteDocument(e, doc.id)}
                      className="text-red-300 hover:text-red-200 px-3 py-1"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Features */}
        <div className="mt-12 bg-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-400/20">
          <h3 className="text-white font-bold mb-3">📝 Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-200 text-sm">
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Rich text editor (Quill.js/TipTap)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Real-time collaboration with WebSockets</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>See collaborators' cursors & selections</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Comments & suggestions</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Version history & restore</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Share & permissions (view/comment/edit)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Export to PDF, DOCX, TXT</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Import DOCX files</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Folders & organization</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Document templates (business, academic)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>AI writing assistant integration</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

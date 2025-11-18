import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forms, formFolders, formTemplates } from '../../services/api';

export default function FormsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formsList, setFormsList] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = [
    { id: '1', name: 'Contact Form', category: 'contact', icon: '📧', description: 'Name, email, message' },
    { id: '2', name: 'Event Registration', category: 'registration', icon: '🎫', description: 'Event sign-up form' },
    { id: '3', name: 'Customer Satisfaction', category: 'survey', icon: '⭐', description: 'Feedback survey' },
    { id: '4', name: 'Job Application', category: 'registration', icon: '💼', description: 'Application form' },
    { id: '5', name: 'Feedback Form', category: 'feedback', icon: '💬', description: 'General feedback' },
    { id: '6', name: 'Quiz', category: 'quiz', icon: '📝', description: 'Multiple choice quiz' },
    { id: '7', name: 'Order Form', category: 'contact', icon: '🛒', description: 'Product orders' },
    { id: '8', name: 'RSVP', category: 'registration', icon: '✅', description: 'Event RSVP' },
    { id: '9', name: 'Volunteer Signup', category: 'registration', icon: '🙋', description: 'Volunteer form' },
    { id: '10', name: 'Newsletter Signup', category: 'contact', icon: '📰', description: 'Email signup' },
  ];

  useEffect(() => {
    loadForms();
  }, [filter]);

  const loadForms = async () => {
    try {
      const params = {};
      if (filter === 'published') params.published = 'true';
      if (filter === 'draft') params.published = 'false';

      const data = await forms.list(params);
      setFormsList(data);
    } catch (error) {
      console.error('Failed to load forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async () => {
    try {
      const form = await forms.create({ title: 'Untitled Form' });
      alert('Form builder coming soon! Form created successfully.');
      loadForms();
    } catch (error) {
      console.error('Failed to create form:', error);
      alert('Failed to create form.');
    }
  };

  const handleCreateFromTemplate = async (templateId) => {
    alert('Template-based form creation coming soon!');
    setShowTemplates(false);
  };

  const handleOpenForm = (id) => {
    alert('Form builder coming soon!');
  };

  const handleViewResponses = (e, id) => {
    e.stopPropagation();
    alert('Response viewer coming soon!');
  };

  const handleShareForm = (e, form) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/forms/public/${form.shareLink}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Form link copied to clipboard!\n\n${shareUrl}`);
  };

  const handleCopyForm = async (e, id) => {
    e.stopPropagation();
    try {
      await forms.copy(id);
      loadForms();
      alert('Form duplicated successfully!');
    } catch (error) {
      console.error('Failed to copy form:', error);
      alert('Failed to copy form.');
    }
  };

  const handleDeleteForm = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this form? All responses will be lost.')) return;

    try {
      await forms.delete(id);
      loadForms();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete form.');
    }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="text-6xl mb-4 animate-pulse">📋</div>
          <p className="text-indigo-300">Loading your forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📋 Forms</h1>
              <p className="text-indigo-200">Create surveys, quizzes, and collect data</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowTemplates(true)} className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg">
                📋 Templates
              </button>
              <button onClick={handleCreateForm} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg">
                + New Form
              </button>
            </div>
          </div>

          {/* Filters & View Mode */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}>
                All Forms
              </button>
              <button onClick={() => setFilter('published')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'published' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}>
                Published
              </button>
              <button onClick={() => setFilter('draft')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'draft' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}>
                Drafts
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}>
                ⊞
              </button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}>
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Template Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl max-w-4xl w-full p-6 border border-white/20 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Choose Template</h2>
                <button onClick={() => setShowTemplates(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <button key={template.id} onClick={() => handleCreateFromTemplate(template.id)} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-indigo-400/50 transition-all text-left group">
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <h3 className="text-white font-bold mb-1 group-hover:text-indigo-300">{template.name}</h3>
                    <p className="text-indigo-300 text-xs mb-2">{template.description}</p>
                    <span className="text-indigo-400 text-xs capitalize">{template.category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Forms Grid/List */}
        {formsList.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <p className="text-6xl mb-4">📋</p>
            <h3 className="text-white text-2xl font-bold mb-2">No forms yet</h3>
            <p className="text-indigo-300 mb-6">Create your first form to start collecting data!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleCreateForm} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                Create Form
              </button>
              <button onClick={() => setShowTemplates(true)} className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                Use Template
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formsList.map((form) => (
              <div key={form.id} onClick={() => handleOpenForm(form.id)} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 hover:border-indigo-400/50 transition-all cursor-pointer group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-2 group-hover:text-indigo-300">{form.title}</h3>
                      {form.description && (
                        <p className="text-indigo-300 text-sm mb-3 line-clamp-2">{form.description}</p>
                      )}
                    </div>
                    <div className="text-2xl ml-2">📋</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-indigo-400">Responses</span>
                      <span className="text-white font-semibold">{form._count?.responses || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-indigo-400">Status</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${form.isPublished ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                        {form.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-indigo-400">Updated</span>
                      <span className="text-indigo-300">{formatDate(form.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <button onClick={(e) => handleViewResponses(e, form.id)} className="flex-1 text-indigo-300 hover:text-indigo-200 text-sm py-1">
                      📊 Responses
                    </button>
                    <button onClick={(e) => handleShareForm(e, form)} className="flex-1 text-purple-300 hover:text-purple-200 text-sm py-1">
                      🔗 Share
                    </button>
                    <button onClick={(e) => handleCopyForm(e, form.id)} className="flex-1 text-blue-300 hover:text-blue-200 text-sm py-1">
                      📋 Copy
                    </button>
                    <button onClick={(e) => handleDeleteForm(e, form.id)} className="text-red-300 hover:text-red-200 text-sm py-1 px-2">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            {formsList.map((form, index) => (
              <div key={form.id} onClick={() => handleOpenForm(form.id)} className={`p-4 hover:bg-white/5 cursor-pointer transition-all ${index > 0 ? 'border-t border-white/10' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">📋</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-bold">{form.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${form.isPublished ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                          {form.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-indigo-300 text-sm">
                        <span>{form._count?.responses || 0} responses</span>
                        <span>•</span>
                        <span>Updated {formatDate(form.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={(e) => handleViewResponses(e, form.id)} className="text-indigo-300 hover:text-indigo-200 px-3 py-1">📊 Responses</button>
                    <button onClick={(e) => handleShareForm(e, form)} className="text-purple-300 hover:text-purple-200 px-3 py-1">🔗 Share</button>
                    <button onClick={(e) => handleCopyForm(e, form.id)} className="text-blue-300 hover:text-blue-200 px-3 py-1">📋 Copy</button>
                    <button onClick={(e) => handleDeleteForm(e, form.id)} className="text-red-300 hover:text-red-200 px-3 py-1">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon */}
        <div className="mt-12 bg-indigo-500/10 backdrop-blur-lg rounded-xl p-6 border border-indigo-400/20">
          <h3 className="text-white font-bold mb-3">📋 Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-indigo-200 text-sm">
            <div className="flex items-start gap-2"><span>✓</span><span>Drag-and-drop form builder</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>15+ question types</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Conditional logic & branching</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Response analytics & charts</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Export CSV, Excel, PDF</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Email notifications</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Embed forms on websites</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Quiz mode with scoring</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>File upload questions</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>CRM & Sheets integration</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Custom themes & branding</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Response validation</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

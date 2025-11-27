import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { presentations, presentationFolders, presentationTemplates } from '../../services/api';

export default function PresentationsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = [
    { id: '1', name: 'Startup Pitch Deck', category: 'pitch', icon: '🚀', description: 'Investor pitch template' },
    { id: '2', name: 'Business Plan', category: 'business', icon: '📊', description: 'Comprehensive plan' },
    { id: '3', name: 'Marketing Plan', category: 'marketing', icon: '📈', description: 'Strategy & tactics' },
    { id: '4', name: 'Sales Presentation', category: 'business', icon: '💼', description: 'Product showcase' },
    { id: '5', name: 'Training Session', category: 'education', icon: '🎓', description: 'Educational deck' },
    { id: '6', name: 'Portfolio Showcase', category: 'creative', icon: '🎨', description: 'Creative portfolio' },
    { id: '7', name: 'Annual Report', category: 'business', icon: '📑', description: 'Year in review' },
    { id: '8', name: 'Product Launch', category: 'marketing', icon: '🎯', description: 'Launch strategy' },
  ];

  useEffect(() => {
    loadPresentations();
  }, [filter]);

  const loadPresentations = async () => {
    try {
      const params = {};
      if (filter === 'shared') params.shared = 'true';
      if (filter === 'recent') params.recent = 'true';

      const data = await presentations.list(params);
      setDecks(data);
    } catch (error) {
      console.error('Failed to load presentations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePresentation = async () => {
    try {
      const presentation = await presentations.create({ title: 'Untitled Presentation' });
      alert('Presentation editor coming soon! Presentation created successfully.');
      loadPresentations();
    } catch (error) {
      console.error('Failed to create presentation:', error);
      alert('Failed to create presentation.');
    }
  };

  const handleCreateFromTemplate = async (templateId) => {
    alert('Template-based presentation creation coming soon!');
    setShowTemplates(false);
  };

  const handleOpenPresentation = (id) => {
    alert('Presentation editor coming soon!');
  };

  const handleDeletePresentation = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this presentation?')) return;

    try {
      await presentations.delete(id);
      loadPresentations();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete presentation.');
    }
  };

  const handleSharePresentation = (e, id) => {
    e.stopPropagation();
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="text-6xl mb-4 animate-pulse">🎬</div>
          <p className="text-purple-300">Loading your presentations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🎬 Presentations</h1>
              <p className="text-purple-200">Create stunning slide decks</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowTemplates(true)} className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg">
                📋 Templates
              </button>
              <button onClick={handleCreatePresentation} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg">
                + New Presentation
              </button>
            </div>
          </div>

          {/* Filters & View Mode */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all' ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}>
                All Presentations
              </button>
              <button onClick={() => setFilter('recent')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'recent' ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}>
                Recent
              </button>
              <button onClick={() => setFilter('shared')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'shared' ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}>
                Shared with me
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}>
                ⊞
              </button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}>
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Template Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl max-w-4xl w-full p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Choose Template</h2>
                <button onClick={() => setShowTemplates(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <button key={template.id} onClick={() => handleCreateFromTemplate(template.id)} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-purple-400/50 transition-all text-left group">
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <h3 className="text-white font-bold mb-1 group-hover:text-purple-300">{template.name}</h3>
                    <p className="text-purple-300 text-xs mb-2">{template.description}</p>
                    <span className="text-purple-400 text-xs capitalize">{template.category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Presentations Grid/List */}
        {decks.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <p className="text-6xl mb-4">🎬</p>
            <h3 className="text-white text-2xl font-bold mb-2">No presentations yet</h3>
            <p className="text-purple-300 mb-6">Create your first presentation to get started!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleCreatePresentation} className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                Create Presentation
              </button>
              <button onClick={() => setShowTemplates(true)} className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                Use Template
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {decks.map((deck) => (
              <div key={deck.id} onClick={() => handleOpenPresentation(deck.id)} className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-purple-400/50 transition-all cursor-pointer group">
                <div className="aspect-[16/9] bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                  <div className="text-6xl opacity-50">🎬</div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-purple-300">{deck.title}</h3>
                  <div className="flex items-center gap-2 text-purple-300 text-sm mb-2">
                    <span>{formatDate(deck.updatedAt)}</span>
                  </div>
                  {deck.collaborators && deck.collaborators.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-purple-400 text-xs">👥 Shared</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={(e) => handleSharePresentation(e, deck.id)} className="text-purple-300 hover:text-purple-200 text-sm">🔗</button>
                    <button onClick={(e) => handleDeletePresentation(e, deck.id)} className="text-red-300 hover:text-red-200 text-sm">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            {decks.map((deck, index) => (
              <div key={deck.id} onClick={() => handleOpenPresentation(deck.id)} className={`p-4 hover:bg-white/5 cursor-pointer transition-all ${index > 0 ? 'border-t border-white/10' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">🎬</div>
                    <div>
                      <h3 className="text-white font-bold">{deck.title}</h3>
                      <div className="flex items-center gap-2 text-purple-300 text-sm">
                        <span>Edited {formatDate(deck.updatedAt)}</span>
                        {deck.collaborators && deck.collaborators.length > 0 && (
                          <>
                            <span>•</span>
                            <span>👥 Shared</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={(e) => handleSharePresentation(e, deck.id)} className="text-purple-300 hover:text-purple-200 px-3 py-1">🔗 Share</button>
                    <button onClick={(e) => handleDeletePresentation(e, deck.id)} className="text-red-300 hover:text-red-200 px-3 py-1">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon */}
        <div className="mt-12 bg-purple-500/10 backdrop-blur-lg rounded-xl p-6 border border-purple-400/20">
          <h3 className="text-white font-bold mb-3">🎬 Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-purple-200 text-sm">
            <div className="flex items-start gap-2"><span>✓</span><span>Slide editor with drag-and-drop</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Beautiful themes & templates</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Text, images, shapes & charts</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Animations & transitions</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Presenter view & speaker notes</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Real-time collaboration</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Export PDF, PPTX, images</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Master slides & layouts</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Media library integration</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Version history & comments</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Custom fonts & colors</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Smart guides & alignment</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { spreadsheets, spreadsheetFolders, spreadsheetTemplates } from '../../services/api';

export default function SpreadsheetsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sheets, setSheets] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = [
    { id: '1', name: 'Budget Tracker', category: 'budget', icon: '💰', description: 'Personal/business budget' },
    { id: '2', name: 'Invoice', category: 'invoice', icon: '🧾', description: 'Professional invoice' },
    { id: '3', name: 'Expense Tracker', category: 'tracker', icon: '📊', description: 'Track expenses by category' },
    { id: '4', name: 'Sales Dashboard', category: 'dashboard', icon: '📈', description: 'Charts and KPIs' },
    { id: '5', name: 'Project Timeline', category: 'schedule', icon: '📅', description: 'Gantt-style timeline' },
    { id: '6', name: 'Inventory Tracker', category: 'tracker', icon: '📦', description: 'Stock levels & alerts' },
    { id: '7', name: 'Grade Book', category: 'tracker', icon: '🎓', description: 'Student grades' },
    { id: '8', name: 'Event Schedule', category: 'schedule', icon: '🗓️', description: 'Timetable planner' },
  ];

  useEffect(() => {
    loadSpreadsheets();
  }, [filter]);

  const loadSpreadsheets = async () => {
    try {
      const params = {};
      if (filter === 'shared') params.shared = 'true';
      if (filter === 'recent') params.recent = 'true';

      const data = await spreadsheets.list(params);
      setSheets(data);
    } catch (error) {
      console.error('Failed to load spreadsheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    try {
      const sheet = await spreadsheets.create({ title: 'Untitled Spreadsheet' });
      alert('Spreadsheet editor coming soon! Spreadsheet created successfully.');
      loadSpreadsheets();
    } catch (error) {
      console.error('Failed to create spreadsheet:', error);
      alert('Failed to create spreadsheet.');
    }
  };

  const handleCreateFromTemplate = async (templateId) => {
    alert('Template-based spreadsheet creation coming soon!');
    setShowTemplates(false);
  };

  const handleOpenSpreadsheet = (id) => {
    alert('Spreadsheet editor coming soon!');
  };

  const handleDeleteSpreadsheet = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this spreadsheet?')) return;

    try {
      await spreadsheets.delete(id);
      loadSpreadsheets();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete spreadsheet.');
    }
  };

  const handleShareSpreadsheet = (e, id) => {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="text-6xl mb-4 animate-pulse">📊</div>
          <p className="text-green-300">Loading your spreadsheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📊 Spreadsheets</h1>
              <p className="text-green-200">Analyze data with formulas & charts</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowTemplates(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg">
                📋 Templates
              </button>
              <button onClick={handleCreateSpreadsheet} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg">
                + New Spreadsheet
              </button>
            </div>
          </div>

          {/* Filters & View Mode */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all' ? 'bg-green-500 text-white' : 'bg-white/10 text-green-200 hover:bg-white/20'}`}>
                All Spreadsheets
              </button>
              <button onClick={() => setFilter('recent')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'recent' ? 'bg-green-500 text-white' : 'bg-white/10 text-green-200 hover:bg-white/20'}`}>
                Recent
              </button>
              <button onClick={() => setFilter('shared')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'shared' ? 'bg-green-500 text-white' : 'bg-white/10 text-green-200 hover:bg-white/20'}`}>
                Shared with me
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-white/10 text-green-200 hover:bg-white/20'}`}>
                ⊞
              </button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-white/10 text-green-200 hover:bg-white/20'}`}>
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
                  <button key={template.id} onClick={() => handleCreateFromTemplate(template.id)} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-green-400/50 transition-all text-left group">
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <h3 className="text-white font-bold mb-1 group-hover:text-green-300">{template.name}</h3>
                    <p className="text-green-300 text-xs mb-2">{template.description}</p>
                    <span className="text-green-400 text-xs capitalize">{template.category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Spreadsheets Grid/List */}
        {sheets.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <p className="text-6xl mb-4">📊</p>
            <h3 className="text-white text-2xl font-bold mb-2">No spreadsheets yet</h3>
            <p className="text-green-300 mb-6">Create your first spreadsheet to get started!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleCreateSpreadsheet} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                Create Spreadsheet
              </button>
              <button onClick={() => setShowTemplates(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                Use Template
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sheets.map((sheet) => (
              <div key={sheet.id} onClick={() => handleOpenSpreadsheet(sheet.id)} className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-green-400/50 transition-all cursor-pointer group">
                <div className="aspect-[3/4] bg-gradient-to-br from-green-900/50 to-emerald-900/50 flex items-center justify-center">
                  <div className="text-6xl opacity-50">📊</div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-green-300">{sheet.title}</h3>
                  <div className="flex items-center gap-2 text-green-300 text-sm mb-2">
                    <span>{formatDate(sheet.updatedAt)}</span>
                  </div>
                  {sheet.collaborators && sheet.collaborators.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-green-400 text-xs">👥 Shared</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={(e) => handleShareSpreadsheet(e, sheet.id)} className="text-green-300 hover:text-green-200 text-sm">🔗</button>
                    <button onClick={(e) => handleDeleteSpreadsheet(e, sheet.id)} className="text-red-300 hover:text-red-200 text-sm">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            {sheets.map((sheet, index) => (
              <div key={sheet.id} onClick={() => handleOpenSpreadsheet(sheet.id)} className={`p-4 hover:bg-white/5 cursor-pointer transition-all ${index > 0 ? 'border-t border-white/10' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">📊</div>
                    <div>
                      <h3 className="text-white font-bold">{sheet.title}</h3>
                      <div className="flex items-center gap-2 text-green-300 text-sm">
                        <span>Edited {formatDate(sheet.updatedAt)}</span>
                        {sheet.collaborators && sheet.collaborators.length > 0 && (
                          <>
                            <span>•</span>
                            <span>👥 Shared</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={(e) => handleShareSpreadsheet(e, sheet.id)} className="text-green-300 hover:text-green-200 px-3 py-1">🔗 Share</button>
                    <button onClick={(e) => handleDeleteSpreadsheet(e, sheet.id)} className="text-red-300 hover:text-red-200 px-3 py-1">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon */}
        <div className="mt-12 bg-green-500/10 backdrop-blur-lg rounded-xl p-6 border border-green-400/20">
          <h3 className="text-white font-bold mb-3">📊 Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-green-200 text-sm">
            <div className="flex items-start gap-2"><span>✓</span><span>Spreadsheet grid (rows, columns, cells)</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Formulas & 100+ functions (SUM, AVERAGE, IF, VLOOKUP)</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Charts & graphs (column, line, pie, scatter)</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Data analysis (sort, filter, pivot tables)</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Conditional formatting (rules, color scales)</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Real-time collaboration</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Import/export CSV, XLSX, PDF</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Cell formatting (numbers, dates, currency)</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Data validation & dropdowns</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Freeze panes & split view</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Templates (budget, invoice, tracker)</span></div>
            <div className="flex items-start gap-2"><span>✓</span><span>Keyboard shortcuts (Excel-style)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

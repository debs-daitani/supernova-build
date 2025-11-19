/**
 * Canned Responses Manager
 * Create and manage quick reply templates
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'General',
  'Support',
  'Sales',
  'Technical',
  'Billing',
  'Other'
];

export default function CannedResponses() {
  const navigate = useNavigate();

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingResponse, setEditingResponse] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/canned-responses');
      const data = await response.json();

      if (data.success) {
        setResponses(data.responses);
      }
    } catch (error) {
      console.error('Error loading canned responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingResponse(null);
    setTitle('');
    setMessage('');
    setCategory('General');
    setShowCreateModal(true);
  };

  const openEditModal = (response) => {
    setEditingResponse(response);
    setTitle(response.title);
    setMessage(response.message);
    setCategory(response.category || 'General');
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingResponse(null);
    setTitle('');
    setMessage('');
    setCategory('General');
  };

  const saveResponse = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Title and message are required');
      return;
    }

    try {
      const url = editingResponse
        ? `/api/chat/canned-responses/${editingResponse.id}`
        : '/api/chat/canned-responses';

      const method = editingResponse ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          category
        })
      });

      const data = await response.json();

      if (data.success) {
        loadResponses();
        closeModal();
      } else {
        alert('Error saving response: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving response:', error);
      alert('Error saving response');
    }
  };

  const deleteResponse = async (id) => {
    if (!confirm('Are you sure you want to delete this canned response?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chat/canned-responses/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        loadResponses();
      } else {
        alert('Error deleting response: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting response:', error);
      alert('Error deleting response');
    }
  };

  const filteredResponses = responses.filter(response => {
    const matchesSearch = !searchQuery ||
      response.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !filterCategory || response.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const groupedResponses = filteredResponses.reduce((acc, response) => {
    const cat = response.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(response);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/chat')}
            className="text-gray-400 hover:text-white mb-2"
          >
            ← Back to Chat
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Canned Responses</h1>
              <p className="text-gray-400 mt-1">Quick reply templates for your team</p>
            </div>

            <button
              onClick={openCreateModal}
              className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600"
            >
              + New Response
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search responses..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : responses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold mb-2">No Canned Responses</h2>
            <p className="text-gray-400 mb-4">
              Create quick reply templates to speed up your conversations
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600"
            >
              Create Your First Response
            </button>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No Results</h2>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedResponses).map(([cat, catResponses]) => (
              <div key={cat}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>{cat}</span>
                  <span className="text-sm text-gray-400">({catResponses.length})</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catResponses.map(response => (
                    <ResponseCard
                      key={response.id}
                      response={response}
                      onEdit={() => openEditModal(response)}
                      onDelete={() => deleteResponse(response.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {editingResponse ? 'Edit Response' : 'New Canned Response'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Welcome Message"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message template here..."
                  rows={6}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {message.length} characters
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveResponse}
                className="flex-1 px-6 py-2 bg-orange-500 rounded hover:bg-orange-600"
              >
                {editingResponse ? 'Save Changes' : 'Create Response'}
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResponseCard({ response, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-lg">{response.title}</h3>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-white text-sm"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-400 text-sm"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-300 mb-3">
        {expanded ? (
          <div className="whitespace-pre-wrap">{response.message}</div>
        ) : (
          <div className="line-clamp-2">{response.message}</div>
        )}
      </div>

      {response.message.length > 100 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-orange-500 hover:text-orange-400"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          <span className="font-bold">{response.usageCount || 0}</span> uses
        </div>
        {response.category && (
          <div className="text-xs bg-gray-700 px-2 py-1 rounded">
            {response.category}
          </div>
        )}
      </div>
    </div>
  );
}

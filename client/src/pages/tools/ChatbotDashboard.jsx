import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatbots } from '../../services/api';
import toast from 'react-hot-toast';

export default function ChatbotDashboard() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      const response = await chatbots.list();
      setBots(response.data);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      toast.error('Failed to load chatbots');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async (e) => {
    e.preventDefault();
    if (!newBotName.trim()) {
      toast.error('Please enter a chatbot name');
      return;
    }

    setCreating(true);
    try {
      const response = await chatbots.create({
        name: newBotName,
        welcomeMessage: 'Hi! 👋 How can I help you today?'
      });

      toast.success('Chatbot created!');
      setShowCreateModal(false);
      setNewBotName('');
      fetchChatbots();
    } catch (error) {
      console.error('Error creating chatbot:', error);
      toast.error('Failed to create chatbot');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleEnabled = async (bot) => {
    try {
      await chatbots.update(bot.id, { enabled: !bot.enabled });
      toast.success(bot.enabled ? 'Chatbot disabled' : 'Chatbot enabled');
      fetchChatbots();
    } catch (error) {
      console.error('Error toggling chatbot:', error);
      toast.error('Failed to update chatbot');
    }
  };

  const handleDeleteBot = async (botId) => {
    if (!confirm('Are you sure you want to delete this chatbot? This cannot be undone.')) {
      return;
    }

    try {
      await chatbots.delete(botId);
      toast.success('Chatbot deleted');
      fetchChatbots();
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      toast.error('Failed to delete chatbot');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot Builder</h1>
          <p className="text-gray-600 mt-1">Create automated conversations for your website</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Create Chatbot
        </button>
      </div>

      {/* Stats Overview */}
      {bots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600">Total Chatbots</div>
            <div className="text-2xl font-bold text-pink-600">{bots.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {bots.filter(b => b.enabled).length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Total Conversations</div>
            <div className="text-2xl font-bold text-blue-600">
              {bots.reduce((sum, b) => sum + (b._count?.conversations || 0), 0)}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Total Flows</div>
            <div className="text-2xl font-bold text-purple-600">
              {bots.reduce((sum, b) => sum + (b._count?.flows || 0), 0)}
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Cards */}
      {bots.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No chatbots yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first chatbot to automate conversations on your website
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Your First Chatbot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map(bot => (
            <div key={bot.id} className="card hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{bot.name}</h3>
                  {bot.description && (
                    <p className="text-sm text-gray-600">{bot.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleToggleEnabled(bot)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bot.enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {bot.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {bot._count?.conversations || 0}
                  </div>
                  <div className="text-xs text-gray-600">Chats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {bot._count?.flows || 0}
                  </div>
                  <div className="text-xs text-gray-600">Flows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {bot.aiHandoffEnabled ? '✓' : '—'}
                  </div>
                  <div className="text-xs text-gray-600">AI</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/tools/chatbot-builder/${bot.id}`}
                  className="btn-primary flex-1 text-center text-sm"
                >
                  Edit Flows
                </Link>
                <Link
                  to={`/tools/chatbot-analytics/${bot.id}`}
                  className="btn-secondary flex-1 text-center text-sm"
                >
                  Analytics
                </Link>
                <Link
                  to={`/tools/chatbot-settings/${bot.id}`}
                  className="btn-secondary px-3 text-sm"
                  title="Settings"
                >
                  ⚙️
                </Link>
                <button
                  onClick={() => handleDeleteBot(bot.id)}
                  className="btn-secondary px-3 text-sm hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Chatbot</h2>

              <form onSubmit={handleCreateBot}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chatbot Name
                  </label>
                  <input
                    type="text"
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    placeholder="e.g., Customer Support Bot"
                    className="input"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewBotName('');
                    }}
                    className="btn-secondary flex-1"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create Chatbot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chatbots } from '../../services/api';
import toast from 'react-hot-toast';

export default function ChatbotAnalytics() {
  const { id } = useParams();
  const [chatbot, setChatbot] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [botRes, analyticsRes, convsRes] = await Promise.all([
        chatbots.get(id),
        chatbots.getAnalytics(id),
        chatbots.getConversations(id)
      ]);

      setChatbot(botRes.data);
      setAnalytics(analyticsRes.data);
      setConversations(convsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleViewConversation = async (convId) => {
    try {
      const response = await chatbots.getConversation(id, convId);
      setSelectedConversation(response.data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!chatbot || !analytics) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-gray-600">Chatbot not found</p>
          <Link to="/tools/chatbot-dashboard" className="btn-primary mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">{chatbot.name}</p>
        </div>
        <Link to="/tools/chatbot-dashboard" className="btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-gray-600">Total Conversations</div>
          <div className="text-3xl font-bold text-pink-600">
            {analytics.totalConversations}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-3xl font-bold text-blue-600">
            {analytics.activeConversations}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600">Completion Rate</div>
          <div className="text-3xl font-bold text-green-600">
            {analytics.completionRate}%
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600">Avg Duration</div>
          <div className="text-3xl font-bold text-purple-600">
            {formatDuration(analytics.avgDurationSeconds)}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.completedConversations}
              </div>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Abandoned</div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.abandonedConversations}
              </div>
            </div>
            <div className="text-4xl">👻</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">AI Handoffs</div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.aiHandoffConversations}
              </div>
            </div>
            <div className="text-4xl">🤖</div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Conversations</h2>

        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-600">No conversations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Visitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversations.map(conv => (
                  <tr key={conv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {conv.visitorEmail || conv.visitorName || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {conv.visitorId.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        conv.status === 'completed' ? 'bg-green-100 text-green-700' :
                        conv.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        conv.status === 'abandoned' ? 'bg-gray-100 text-gray-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {conv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {conv._count?.messages || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(conv.startedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewConversation(conv.id)}
                        className="text-pink-600 hover:text-pink-800"
                      >
                        View Transcript
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conversation Transcript Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Conversation Transcript</h2>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.visitorEmail || selectedConversation.visitorName || 'Anonymous Visitor'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {selectedConversation.messages?.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="text-sm">{msg.content}</div>
                      <div className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-pink-200' : 'text-gray-500'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Captured Variables */}
              {selectedConversation.variables && Object.keys(selectedConversation.variables).length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-sm text-gray-700 mb-2">Captured Data:</h4>
                  <div className="space-y-1">
                    {Object.entries(selectedConversation.variables).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-gray-700">{key}:</span>{' '}
                        <span className="text-gray-600">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t">
              <button
                onClick={() => setSelectedConversation(null)}
                className="btn-primary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

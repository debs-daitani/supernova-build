import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chatbots } from '../../services/api';
import toast from 'react-hot-toast';

export default function ChatbotBuilder() {
  const { id } = useParams();
  const [chatbot, setChatbot] = useState(null);
  const [flows, setFlows] = useState([]);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchChatbot();
      fetchFlows();
    }
  }, [id]);

  const fetchChatbot = async () => {
    try {
      const response = await chatbots.get(id);
      setChatbot(response.data);
    } catch (error) {
      console.error('Error fetching chatbot:', error);
      toast.error('Failed to load chatbot');
    }
  };

  const fetchFlows = async () => {
    try {
      const response = await chatbots.listFlows(id);
      setFlows(response.data);

      // If no flows, create a default one
      if (response.data.length === 0) {
        await createDefaultFlow();
      } else {
        setCurrentFlow(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching flows:', error);
      toast.error('Failed to load flows');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultFlow = async () => {
    try {
      const response = await chatbots.createFlow(id, {
        name: 'Main Flow',
        description: 'Default conversation flow',
        flowData: {
          nodes: [
            {
              id: 'start',
              type: 'text_message',
              data: {
                content: 'Hi! How can I help you today?'
              },
              position: { x: 100, y: 100 }
            }
          ],
          edges: []
        }
      });

      setFlows([response.data]);
      setCurrentFlow(response.data);
      toast.success('Default flow created');
    } catch (error) {
      console.error('Error creating flow:', error);
      toast.error('Failed to create flow');
    }
  };

  const handleSaveFlow = async () => {
    if (!currentFlow) return;

    setSaving(true);
    try {
      await chatbots.updateFlow(id, currentFlow.id, {
        flowData: currentFlow.flowData
      });
      toast.success('Flow saved!');
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save flow');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!chatbot || !currentFlow) {
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/tools/chatbot-dashboard" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
          <div className="border-l h-6 border-gray-300"></div>
          <div>
            <h1 className="font-bold text-lg">{chatbot.name}</h1>
            <p className="text-sm text-gray-600">{currentFlow.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTestModal(true)}
            className="btn-secondary text-sm"
          >
            🧪 Test
          </button>
          <button
            onClick={handleSaveFlow}
            className="btn-primary text-sm"
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save'}
          </button>
          <Link
            to={`/tools/chatbot-settings/${id}`}
            className="btn-secondary text-sm"
          >
            ⚙️ Settings
          </Link>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <h3 className="font-bold text-sm text-gray-700 mb-3">NODES</h3>

          <div className="space-y-2">
            {/* Message Nodes */}
            <div className="text-xs font-medium text-gray-500 mb-2">Messages</div>
            <NodePaletteItem icon="💬" label="Text Message" />
            <NodePaletteItem icon="🔘" label="Quick Reply Buttons" />
            <NodePaletteItem icon="🖼️" label="Image" />
            <NodePaletteItem icon="⏱️" label="Delay" />

            {/* Question Nodes */}
            <div className="text-xs font-medium text-gray-500 mt-4 mb-2">Questions</div>
            <NodePaletteItem icon="✍️" label="Ask for Text" />
            <NodePaletteItem icon="📧" label="Ask for Email" />
            <NodePaletteItem icon="📱" label="Ask for Phone" />
            <NodePaletteItem icon="✅" label="Multiple Choice" />

            {/* Logic Nodes */}
            <div className="text-xs font-medium text-gray-500 mt-4 mb-2">Logic</div>
            <NodePaletteItem icon="🔀" label="Condition" />
            <NodePaletteItem icon="🎲" label="Random Path" />
            <NodePaletteItem icon="↪️" label="Go to Flow" />

            {/* Action Nodes */}
            <div className="text-xs font-medium text-gray-500 mt-4 mb-2">Actions</div>
            <NodePaletteItem icon="👤" label="Add to CRM" />
            <NodePaletteItem icon="📨" label="Send Email" />
            <NodePaletteItem icon="🏷️" label="Tag User" />
            <NodePaletteItem icon="🤖" label="Hand off to AI" />

            {/* End Nodes */}
            <div className="text-xs font-medium text-gray-500 mt-4 mb-2">End</div>
            <NodePaletteItem icon="🏁" label="End Conversation" />
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-gray-50 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="card">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Visual Flow Builder
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  The drag-and-drop flow builder will be enhanced in the next iteration.
                  For now, flows can be configured via the API.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto text-left">
                  <h4 className="font-bold text-sm mb-3">Current Flow Structure:</h4>
                  <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
                    {JSON.stringify(currentFlow.flowData, null, 2)}
                  </pre>
                </div>

                <div className="mt-6 text-sm text-gray-600">
                  <p className="mb-2"><strong>Planned Features:</strong></p>
                  <ul className="text-left inline-block">
                    <li>✅ Backend API complete</li>
                    <li>✅ Flow data storage ready</li>
                    <li>✅ Chatbot engine functional</li>
                    <li>🚧 Drag-and-drop interface (coming soon)</li>
                    <li>🚧 Visual node connections (coming soon)</li>
                    <li>🚧 Live testing interface (coming soon)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Node Properties */}
        <div className="w-80 bg-white border-l p-4 overflow-y-auto">
          <h3 className="font-bold text-sm text-gray-700 mb-3">PROPERTIES</h3>
          <div className="text-sm text-gray-600">
            Select a node to edit its properties
          </div>
        </div>
      </div>

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Chatbot</h2>
              <p className="text-gray-600 mb-6">
                The test interface will allow you to simulate conversations and see how your
                chatbot responds to different inputs.
              </p>
              <div className="text-center text-6xl mb-4">🧪</div>
              <p className="text-sm text-gray-500 mb-6">Coming soon in next iteration!</p>
              <button
                onClick={() => setShowTestModal(false)}
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

// Helper component for node palette items
function NodePaletteItem({ icon, label }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer border border-transparent hover:border-pink-200 transition-colors">
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

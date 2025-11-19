import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chatbots } from '../../services/api';
import toast from 'react-hot-toast';

export default function ChatbotSettings() {
  const { id } = useParams();
  const [chatbot, setChatbot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#FF1493');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [aiHandoffEnabled, setAiHandoffEnabled] = useState(false);

  useEffect(() => {
    if (id) {
      fetchChatbot();
    }
  }, [id]);

  const fetchChatbot = async () => {
    try {
      const response = await chatbots.get(id);
      const bot = response.data;
      setChatbot(bot);

      // Populate form
      setName(bot.name || '');
      setDescription(bot.description || '');
      setWelcomeMessage(bot.welcomeMessage || '');
      setPrimaryColor(bot.primaryColor || '#FF1493');
      setWebsiteUrl(bot.websiteUrl || '');
      setEnabled(bot.enabled || false);
      setAiHandoffEnabled(bot.aiHandoffEnabled || false);
    } catch (error) {
      console.error('Error fetching chatbot:', error);
      toast.error('Failed to load chatbot');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await chatbots.update(id, {
        name,
        description,
        welcomeMessage,
        primaryColor,
        websiteUrl,
        enabled,
        aiHandoffEnabled
      });

      toast.success('Settings saved!');
      fetchChatbot();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!chatbot) {
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

  const embedCode = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://daitaniverse.space/widget/chatbot.js';
    script.dataset.chatbotId = '${chatbot.id}';
    document.body.appendChild(script);
  })();
</script>`;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot Settings</h1>
          <p className="text-gray-600 mt-1">{chatbot.name}</p>
        </div>
        <Link to="/tools/chatbot-dashboard" className="btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">General Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chatbot Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                rows={3}
                placeholder="Brief description of what this chatbot does"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message *
              </label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="input"
                rows={3}
                placeholder="Hi! 👋 How can I help you today?"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the first message visitors see when they open the chat
              </p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Appearance</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="input flex-1"
                  placeholder="#FF1493"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This color will be used for the chat widget and buttons
              </p>
            </div>
          </div>
        </div>

        {/* Deployment */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Deployment</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="input"
                placeholder="https://yourwebsite.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                The website where this chatbot will be deployed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Embed Code
              </label>
              <div className="relative">
                <pre className="text-xs bg-gray-50 p-4 rounded border overflow-auto">
                  {embedCode}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(embedCode);
                    toast.success('Copied to clipboard!');
                  }}
                  className="absolute top-2 right-2 btn-secondary text-xs"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Paste this code before the closing &lt;/body&gt; tag on your website
              </p>
            </div>
          </div>
        </div>

        {/* Behavior */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Behavior</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-gray-900">Enable Chatbot</div>
                <div className="text-sm text-gray-600">
                  When enabled, the chatbot will be active on your website
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-gray-900">AI Handoff</div>
                <div className="text-sm text-gray-600">
                  Allow chatbot to hand off complex questions to SUPERNova AI
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiHandoffEnabled}
                  onChange={(e) => setAiHandoffEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/tools/chatbot-dashboard" className="btn-secondary flex-1">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

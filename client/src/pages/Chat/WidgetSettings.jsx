/**
 * Widget Settings
 * Customize chat widget appearance, behavior, and notifications
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const POSITIONS = [
  { value: 'BOTTOM_RIGHT', label: 'Bottom Right' },
  { value: 'BOTTOM_LEFT', label: 'Bottom Left' },
  { value: 'TOP_RIGHT', label: 'Top Right' },
  { value: 'TOP_LEFT', label: 'Top Left' }
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' }
];

export default function WidgetSettings() {
  const { widgetId } = useParams();
  const navigate = useNavigate();

  const [widget, setWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');

  // Appearance settings
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [position, setPosition] = useState('BOTTOM_RIGHT');
  const [primaryColor, setPrimaryColor] = useState('#FF6B35');
  const [avatar, setAvatar] = useState('');
  const [greeting, setGreeting] = useState('Hi! How can we help?');
  const [offlineMessage, setOfflineMessage] = useState("We're currently away. Leave a message!");
  const [language, setLanguage] = useState('en');

  // Behavior settings
  const [autoOpen, setAutoOpen] = useState(false);
  const [autoOpenDelay, setAutoOpenDelay] = useState(5);
  const [specificPages, setSpecificPages] = useState('');
  const [hideForReturning, setHideForReturning] = useState(false);
  const [proactiveMessages, setProactiveMessages] = useState(true);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);

  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (widgetId) {
      loadWidget();
    }
  }, [widgetId]);

  const loadWidget = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/widgets/${widgetId}`);
      const data = await response.json();

      if (data.success) {
        const w = data.widget;
        setWidget(w);
        setName(w.name || '');
        setWebsiteUrl(w.websiteUrl || '');
        setPosition(w.position || 'BOTTOM_RIGHT');
        setPrimaryColor(w.primaryColor || '#FF6B35');
        setAvatar(w.avatar || '');
        setGreeting(w.greeting || 'Hi! How can we help?');
        setOfflineMessage(w.offlineMessage || "We're currently away. Leave a message!");
        setIsActive(w.isActive ?? true);

        // Load settings from JSON
        const settings = w.settings || {};
        setLanguage(settings.language || 'en');
        setAutoOpen(settings.autoOpen || false);
        setAutoOpenDelay(settings.autoOpenDelay || 5);
        setSpecificPages(settings.specificPages || '');
        setHideForReturning(settings.hideForReturning || false);
        setProactiveMessages(settings.proactiveMessages ?? true);
        setEmailNotifications(settings.emailNotifications ?? true);
        setSoundNotifications(settings.soundNotifications ?? true);
        setDesktopNotifications(settings.desktopNotifications || false);
      }
    } catch (error) {
      console.error('Error loading widget:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const settings = {
        language,
        autoOpen,
        autoOpenDelay,
        specificPages,
        hideForReturning,
        proactiveMessages,
        emailNotifications,
        soundNotifications,
        desktopNotifications
      };

      const response = await fetch(`/api/chat/widgets/${widgetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          websiteUrl,
          position,
          primaryColor,
          avatar,
          greeting,
          offlineMessage,
          settings,
          isActive
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Settings saved successfully!');
        setWidget(data.widget);
      } else {
        alert('Error saving settings: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const getEmbedCode = () => {
    if (!widget) return '';
    return `<script src="${window.location.origin}/chat-widget.js" data-widget-id="${widget.embedCode}"></script>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    alert('Embed code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (!widget) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Widget Not Found</h2>
          <button
            onClick={() => navigate('/chat/widgets')}
            className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 mt-4"
          >
            Back to Widgets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/chat/widgets')}
            className="text-gray-400 hover:text-white mb-2"
          >
            ← Back to Widgets
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{widget.name}</h1>
              <p className="text-gray-400 mt-1">Customize your chat widget</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5"
                />
                <span>Active</span>
              </label>

              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-6">
            {['appearance', 'behavior', 'notifications', 'install'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-orange-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'appearance' && (
              <>
                {/* Basic Info */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Basic Information</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Widget Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Website Chat"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Website URL</label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Appearance */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Appearance</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Primary Color</label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-16 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Position</label>
                      <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                      >
                        {POSITIONS.map(pos => (
                          <option key={pos.value} value={pos.value}>
                            {pos.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Avatar URL (optional)</label>
                      <input
                        type="url"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Messages</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Greeting Message</label>
                      <textarea
                        value={greeting}
                        onChange={(e) => setGreeting(e.target.value)}
                        rows={2}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Shown when visitors open the chat
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Offline Message</label>
                      <textarea
                        value={offlineMessage}
                        onChange={(e) => setOfflineMessage(e.target.value)}
                        rows={2}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Shown when no agents are online
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'behavior' && (
              <>
                {/* Auto-open */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Auto-open Settings</h2>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={autoOpen}
                        onChange={(e) => setAutoOpen(e.target.checked)}
                        className="mt-1 w-5 h-5"
                      />
                      <div>
                        <div className="font-bold">Auto-open chat widget</div>
                        <div className="text-sm text-gray-400">
                          Automatically open the chat after a delay
                        </div>
                      </div>
                    </label>

                    {autoOpen && (
                      <div>
                        <label className="block text-sm font-bold mb-2">Delay (seconds)</label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={autoOpenDelay}
                          onChange={(e) => setAutoOpenDelay(parseInt(e.target.value) || 0)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Page Targeting */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Page Targeting</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Show on specific pages (optional)
                      </label>
                      <textarea
                        value={specificPages}
                        onChange={(e) => setSpecificPages(e.target.value)}
                        rows={3}
                        placeholder="/pricing&#10;/contact&#10;/product/*"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        One path per line. Leave empty to show on all pages. Use * as wildcard.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visitor Behavior */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Visitor Behavior</h2>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={hideForReturning}
                        onChange={(e) => setHideForReturning(e.target.checked)}
                        className="mt-1 w-5 h-5"
                      />
                      <div>
                        <div className="font-bold">Hide for returning visitors</div>
                        <div className="text-sm text-gray-400">
                          Don't auto-open if visitor has already chatted
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={proactiveMessages}
                        onChange={(e) => setProactiveMessages(e.target.checked)}
                        className="mt-1 w-5 h-5"
                      />
                      <div>
                        <div className="font-bold">Proactive messages</div>
                        <div className="text-sm text-gray-400">
                          Send automated messages based on visitor behavior
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Notification Settings</h2>

                <div className="space-y-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="mt-1 w-5 h-5"
                    />
                    <div>
                      <div className="font-bold">Email notifications</div>
                      <div className="text-sm text-gray-400">
                        Receive email when new messages arrive
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={soundNotifications}
                      onChange={(e) => setSoundNotifications(e.target.checked)}
                      className="mt-1 w-5 h-5"
                    />
                    <div>
                      <div className="font-bold">Sound notifications</div>
                      <div className="text-sm text-gray-400">
                        Play sound when new messages arrive
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={desktopNotifications}
                      onChange={(e) => setDesktopNotifications(e.target.checked)}
                      className="mt-1 w-5 h-5"
                    />
                    <div>
                      <div className="font-bold">Desktop notifications</div>
                      <div className="text-sm text-gray-400">
                        Show browser notifications for new messages
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'install' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Installation</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-300 mb-4">
                      Copy and paste this code before the closing &lt;/body&gt; tag on every page where you want the chat widget to appear.
                    </p>

                    <div className="bg-gray-900 rounded p-4 font-mono text-sm relative">
                      <button
                        onClick={copyEmbedCode}
                        className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                      >
                        Copy
                      </button>
                      <pre className="overflow-x-auto pr-20">
                        <code>{getEmbedCode()}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-bold mb-2">Widget ID</h3>
                    <div className="bg-gray-900 rounded p-3 font-mono text-sm">
                      {widget.embedCode}
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-bold mb-2">Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900 rounded p-4">
                        <div className="text-3xl font-bold text-orange-500">
                          {widget.totalConversations || 0}
                        </div>
                        <div className="text-sm text-gray-400">Total Conversations</div>
                      </div>
                      <div className="bg-gray-900 rounded p-4">
                        <div className="text-3xl font-bold text-orange-500">
                          {widget.totalMessages || 0}
                        </div>
                        <div className="text-sm text-gray-400">Total Messages</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Preview</h2>

              <div className="bg-gray-700 rounded-lg p-4 relative h-96">
                <div className="text-xs text-gray-400 text-center mb-4">
                  Widget Preview
                </div>

                {/* Mock browser window */}
                <div className="absolute inset-0 m-4 bg-white rounded overflow-hidden">
                  {/* Mock widget bubble */}
                  <div
                    className="absolute w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                    style={{
                      backgroundColor: primaryColor,
                      ...(position === 'BOTTOM_RIGHT' && { bottom: '16px', right: '16px' }),
                      ...(position === 'BOTTOM_LEFT' && { bottom: '16px', left: '16px' }),
                      ...(position === 'TOP_RIGHT' && { top: '16px', right: '16px' }),
                      ...(position === 'TOP_LEFT' && { top: '16px', left: '16px' })
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </div>
                </div>

                <div className="mt-80 text-xs text-gray-400 space-y-1">
                  <div><strong>Color:</strong> {primaryColor}</div>
                  <div><strong>Position:</strong> {POSITIONS.find(p => p.value === position)?.label}</div>
                  <div><strong>Language:</strong> {LANGUAGES.find(l => l.value === language)?.label}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

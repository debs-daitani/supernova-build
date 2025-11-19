import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { socialAccounts, socialAutomations, socialAnalytics } from '../../services/api';
import toast from 'react-hot-toast';

export default function SocialAutomation() {
  const [accounts, setAccounts] = useState([]);
  const [automationsList, setAutomationsList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' or 'automations'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, automationsRes, analyticsRes] = await Promise.all([
        socialAccounts.list(),
        socialAutomations.list(),
        socialAnalytics.get()
      ]);

      setAccounts(accountsRes.data);
      setAutomationsList(automationsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (accountId) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      await socialAccounts.disconnect(accountId);
      toast.success('Account disconnected');
      fetchData();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect account');
    }
  };

  const handleToggleAutomation = async (automation) => {
    try {
      await socialAutomations.update(automation.id, { active: !automation.active });
      toast.success(automation.active ? 'Automation disabled' : 'Automation enabled');
      fetchData();
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast.error('Failed to update automation');
    }
  };

  const handleDeleteAutomation = async (id) => {
    if (!confirm('Delete this automation?')) return;

    try {
      await socialAutomations.delete(id);
      toast.success('Automation deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete automation');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Social Media Automation</h1>
        <p className="text-gray-600 mt-1">
          Automate Instagram & Facebook DMs, comments, and lead capture
        </p>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600">Total Conversations</div>
            <div className="text-3xl font-bold text-pink-600">{analytics.totalConversations}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Active Automations</div>
            <div className="text-3xl font-bold text-blue-600">{analytics.activeAutomations}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Leads Captured</div>
            <div className="text-3xl font-bold text-green-600">{analytics.leadsCapture}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Conversion Rate</div>
            <div className="text-3xl font-bold text-purple-600">{analytics.conversionRate}%</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'accounts'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Connected Accounts ({accounts.length})
          </button>
          <button
            onClick={() => setActiveTab('automations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'automations'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Automations ({automationsList.length})
          </button>
        </nav>
      </div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Connected Accounts</h2>
          </div>

          {accounts.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Accounts Connected</h3>
              <p className="text-gray-600 mb-6">
                Connect your Instagram and Facebook accounts to start automating
              </p>
              <div className="flex gap-4 justify-center">
                <button className="btn-primary">Connect Instagram</button>
                <button className="btn-secondary">Connect Facebook</button>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                <p><strong>Note:</strong> OAuth integration ready - requires Meta App credentials</p>
                <p>Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in environment variables</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map(account => (
                <div key={account.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">
                        {account.platform === 'instagram' ? '📸' : '📘'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{account.accountName}</div>
                        <div className="text-sm text-gray-600 capitalize">{account.platform}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {account.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {account._count?.automations || 0} automations
                    </div>
                    <button
                      onClick={() => handleDisconnect(account.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Automations Tab */}
      {activeTab === 'automations' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Automations</h2>
            <button className="btn-primary">Create Automation</button>
          </div>

          {automationsList.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Automations Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first automation to start capturing leads from social media
              </p>
              <button className="btn-primary">Create Your First Automation</button>
            </div>
          ) : (
            <div className="space-y-4">
              {automationsList.map(automation => (
                <div key={automation.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-gray-900">{automation.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          automation.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {automation.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="capitalize">{automation.account?.platform}</span>
                        <span>•</span>
                        <span className="capitalize">{automation.triggerType.replace('_', ' ')}</span>
                        {automation.keywords && automation.keywords.length > 0 && (
                          <>
                            <span>•</span>
                            <span>Keywords: {automation.keywords.join(', ')}</span>
                          </>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {automation._count?.conversations || 0} conversations started
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAutomation(automation)}
                        className="btn-secondary text-sm"
                      >
                        {automation.active ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn-secondary text-sm">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAutomation(automation.id)}
                        className="btn-secondary text-sm hover:bg-red-50 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feature Description Card */}
      <div className="card bg-gradient-to-r from-pink-50 to-purple-50 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 ManyChat Killer Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">✅ Infrastructure Ready:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Complete backend API for Instagram + Facebook</li>
              <li>• Webhook handling for comments & DMs</li>
              <li>• Automation engine with flow processing</li>
              <li>• Lead capture & CRM integration</li>
              <li>• Analytics tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🔧 Ready for Enhancement:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• OAuth connection flow UI</li>
              <li>• Visual automation builder (drag-and-drop)</li>
              <li>• Unified social inbox</li>
              <li>• Advanced analytics dashboard</li>
              <li>• Multi-step DM sequence editor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Real-Time Analytics View
 * See what's happening on your platform right now
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RealTimeView() {
  const navigate = useNavigate();
  const [activeUsers, setActiveUsers] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadRealTimeData();

    // Poll every 5 seconds for updates
    intervalRef.current = setInterval(loadRealTimeData, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadRealTimeData = async () => {
    try {
      const response = await fetch('/api/analytics/active-users');
      const data = await response.json();

      if (data.success) {
        setActiveUsers(data.users || []);
        // In a real implementation, we'd also fetch recent events
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading real-time data:', error);
      setLoading(false);
    }
  };

  // Group active users by page
  const usersByPage = activeUsers.reduce((acc, user) => {
    const page = user.currentPage || '/';
    if (!acc[page]) {
      acc[page] = [];
    }
    acc[page].push(user);
    return acc;
  }, {});

  // Group active users by country
  const usersByCountry = activeUsers.reduce((acc, user) => {
    const country = user.country || 'Unknown';
    if (!acc[country]) {
      acc[country] = 0;
    }
    acc[country]++;
    return acc;
  }, {});

  // Group active users by device
  const usersByDevice = activeUsers.reduce((acc, user) => {
    const device = user.device || 'Unknown';
    if (!acc[device]) {
      acc[device] = 0;
    }
    acc[device]++;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading real-time data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-gray-400 hover:text-white mb-2"
            >
              ← Back to Analytics
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Real-Time Analytics
            </h1>
            <p className="text-gray-400 mt-1">See what's happening right now • Updates every 5 seconds</p>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-400">Active Users</div>
            <div className="text-4xl font-bold text-green-400">{activeUsers.length}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👻</div>
            <h2 className="text-2xl font-bold mb-2">No Active Users</h2>
            <p className="text-gray-400">No one is currently active on your platform</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Pages */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Active Pages</h2>
              <div className="space-y-3">
                {Object.entries(usersByPage)
                  .sort(([, a], [, b]) => b.length - a.length)
                  .map(([page, users]) => (
                    <div key={page} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <div className="flex-1 truncate">
                        <div className="font-mono text-sm">{page}</div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-bold">{users.length}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Active Locations */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Active Locations</h2>
              <div className="space-y-3">
                {Object.entries(usersByCountry)
                  .sort(([, a], [, b]) => b - a)
                  .map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCountryFlag(country)}</span>
                        <span>{country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-bold">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Active Devices */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Active Devices</h2>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(usersByDevice).map(([device, count]) => (
                  <div key={device} className="bg-gray-700 rounded p-4 text-center">
                    <div className="text-3xl mb-2">{getDeviceIcon(device)}</div>
                    <div className="text-sm text-gray-400 capitalize mb-1">{device}</div>
                    <div className="text-2xl font-bold">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-2">
                {activeUsers.slice(0, 10).map((user, index) => {
                  const timeAgo = getTimeAgo(user.lastActivity);

                  return (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-700 rounded text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      <div className="flex-1">
                        <span className="text-gray-400">{user.device || 'Unknown'}</span>
                        <span className="mx-2">•</span>
                        <span className="font-mono">{user.currentPage}</span>
                      </div>
                      <span className="text-gray-400">{timeAgo}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Live Activity Feed</h2>
              <div className="bg-gray-900 rounded p-4 font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                {activeUsers.map((user, index) => {
                  const time = new Date(user.lastActivity).toLocaleTimeString();

                  return (
                    <div key={index} className="flex items-center gap-3 text-gray-400">
                      <span className="text-gray-600">[{time}]</span>
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-green-400">{user.country || 'Unknown'}</span>
                      <span>•</span>
                      <span className="text-blue-400">{user.device || 'Unknown'}</span>
                      <span>→</span>
                      <span className="text-white">{user.currentPage}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

function getCountryFlag(country) {
  // Simple emoji mapping - in production use proper country flag library
  const flags = {
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Spain': '🇪🇸',
    'Italy': '🇮🇹',
    'Japan': '🇯🇵',
    'China': '🇨🇳',
    'India': '🇮🇳',
    'Brazil': '🇧🇷',
    'Unknown': '🌍'
  };
  return flags[country] || '🌍';
}

function getDeviceIcon(device) {
  const icons = {
    desktop: '🖥️',
    mobile: '📱',
    tablet: '📱',
    Unknown: '💻'
  };
  return icons[device] || '💻';
}

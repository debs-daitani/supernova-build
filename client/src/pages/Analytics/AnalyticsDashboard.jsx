/**
 * Analytics Dashboard - Main Overview
 * Google Analytics killer dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_90_days', label: 'Last 90 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' }
];

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('last_7_days');
  const [loading, setLoading] = useState(true);

  // Data state
  const [overview, setOverview] = useState(null);
  const [visitorsOverTime, setVisitorsOverTime] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [geo, setGeo] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all dashboard data in parallel
      const [
        overviewRes,
        visitorsRes,
        sourcesRes,
        pagesRes,
        devicesRes,
        geoRes,
        activeRes
      ] = await Promise.all([
        fetch(`/api/analytics/dashboard?dateRange=${dateRange}`),
        fetch(`/api/analytics/visitors-over-time?dateRange=${dateRange}`),
        fetch(`/api/analytics/traffic-sources?dateRange=${dateRange}`),
        fetch(`/api/analytics/pages?dateRange=${dateRange}&limit=10`),
        fetch(`/api/analytics/devices?dateRange=${dateRange}`),
        fetch(`/api/analytics/geo?dateRange=${dateRange}`),
        fetch('/api/analytics/active-users')
      ]);

      const overviewData = await overviewRes.json();
      const visitorsData = await visitorsRes.json();
      const sourcesData = await sourcesRes.json();
      const pagesData = await pagesRes.json();
      const devicesData = await devicesRes.json();
      const geoData = await geoRes.json();
      const activeData = await activeRes.json();

      setOverview(overviewData.data);
      setVisitorsOverTime(visitorsData.data || []);
      setTrafficSources(sourcesData.sources || []);
      setTopPages(pagesData.pages || []);
      setDevices(devicesData.devices || []);
      setGeo(geoData.geo || []);
      setActiveUsers(activeData.count || 0);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1">Track all your platform activity in one place</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2"
            >
              {DATE_RANGES.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Navigation */}
            <button
              onClick={() => navigate('/analytics/funnels')}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Funnels
            </button>
            <button
              onClick={() => navigate('/analytics/goals')}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Goals
            </button>
            <button
              onClick={() => navigate('/analytics/real-time')}
              className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600"
            >
              Real-Time ({activeUsers})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Visitors"
            value={overview?.current?.visitors || 0}
            change={overview?.changes?.visitorsChange}
            icon="👥"
          />
          <StatCard
            title="Sessions"
            value={overview?.current?.sessions || 0}
            icon="🔄"
          />
          <StatCard
            title="Page Views"
            value={overview?.current?.pageViews || 0}
            icon="📄"
          />
          <StatCard
            title="Avg. Duration"
            value={formatDuration(overview?.current?.avgSessionDuration || 0)}
            icon="⏱️"
          />
          <StatCard
            title="Bounce Rate"
            value={`${(overview?.current?.bounceRate || 0).toFixed(1)}%`}
            icon="⚡"
          />
          <StatCard
            title="Active Users"
            value={activeUsers}
            icon="🟢"
            highlight
          />
        </div>

        {/* Visitors Over Time Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Visitors Over Time</h2>
          <VisitorsChart data={visitorsOverTime} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Sources */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Traffic Sources</h2>
            <div className="space-y-3">
              {trafficSources.slice(0, 8).map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getSourceColor(index)}`} />
                    <span>{source.source}</span>
                  </div>
                  <span className="font-bold">{source.sessions.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Devices</h2>
            <div className="space-y-3">
              {devices.map((device, index) => {
                const total = devices.reduce((sum, d) => sum + d.sessions, 0);
                const percentage = total > 0 ? (device.sessions / total) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="capitalize">{device.device}</span>
                      <span className="text-sm text-gray-400">
                        {device.sessions.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getDeviceColor(device.device)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Top Pages</h2>
            <div className="space-y-2">
              {topPages.map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{index + 1}.</span>
                    <span className="truncate">{page.path}</span>
                  </div>
                  <span className="font-bold">{page.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Top Countries</h2>
            <div className="space-y-2">
              {geo.slice(0, 10).map((country, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{index + 1}.</span>
                    <span>{country.country || 'Unknown'}</span>
                  </div>
                  <span className="font-bold">{country.sessions.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, highlight }) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${highlight ? 'ring-2 ring-green-500' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {change !== undefined && (
        <div className="flex items-center gap-1 text-sm">
          <span className={isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'}>
            {isPositive && '↑'}
            {isNegative && '↓'}
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-gray-400">vs previous period</span>
        </div>
      )}
    </div>
  );
}

function VisitorsChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center py-8">No data available</div>;
  }

  const maxVisitors = Math.max(...data.map(d => d.visitors), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((day, index) => {
          const height = (day.visitors / maxVisitors) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-orange-500 rounded-t hover:bg-orange-600 cursor-pointer transition-all"
                style={{ height: `${height}%` }}
                title={`${day.date}: ${day.visitors} visitors`}
              />
              <span className="text-xs text-gray-400 transform -rotate-45 origin-left">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

function getSourceColor(index) {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-cyan-500'
  ];
  return colors[index % colors.length];
}

function getDeviceColor(device) {
  const colors = {
    desktop: 'bg-blue-500',
    mobile: 'bg-green-500',
    tablet: 'bg-purple-500',
    Unknown: 'bg-gray-500'
  };
  return colors[device] || 'bg-gray-500';
}

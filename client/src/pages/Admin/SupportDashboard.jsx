/**
 * Support Dashboard (Admin)
 * Main interface for support team to manage tickets
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SupportDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    loadStats();
    loadTickets();
  }, [filters]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/support/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/support/admin/tickets?${params}`);
      const data = await response.json();

      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      RESOLVED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      LOW: '⬇️',
      MEDIUM: '➡️',
      HIGH: '⬆️',
      URGENT: '🔴'
    };
    return icons[priority] || '•';
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Support Dashboard</h1>
        <p className="text-gray-600">
          Manage customer support tickets and inquiries
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Open Tickets"
            value={stats.counts.open}
            icon="📬"
            color="blue"
          />
          <StatCard
            title="Pending Response"
            value={stats.counts.pending}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="Resolved Today"
            value={stats.counts.resolved}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Avg Response Time"
            value={`${stats.avgFirstResponseTime}m`}
            icon="⚡"
            color="purple"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Categories</option>
            <option value="BUG">Bug Report</option>
            <option value="FEATURE_REQUEST">Feature Request</option>
            <option value="QUESTION">Question</option>
            <option value="BILLING">Billing</option>
            <option value="ACCOUNT">Account</option>
            <option value="TECHNICAL">Technical</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-pulse">Loading tickets...</div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2">No tickets found</h3>
            <p className="text-gray-600">All caught up!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Ticket #</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Assigned</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tickets.map(ticket => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/support/tickets/${ticket.id}`)}
                >
                  <td className="px-4 py-3">
                    <span className="text-2xl">{getPriorityIcon(ticket.priority)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm">{ticket.ticketNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="text-xs text-gray-500">{ticket.category}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{ticket.user.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{ticket.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {ticket.assignedTo?.name || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/support/tickets/${ticket.id}`);
                      }}
                      className="text-orange-600 hover:underline text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Stats Summary */}
      {stats && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-bold mb-4">Resolution Time</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.avgResolutionTime}m
            </div>
            <p className="text-sm text-gray-600">Average time to resolve</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-bold mb-4">Customer Satisfaction</h3>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {stats.satisfaction.average.toFixed(1)} / 5.0
            </div>
            <p className="text-sm text-gray-600">
              {stats.satisfaction.totalRatings} ratings
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-bold mb-4">Urgent Tickets</h3>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {stats.counts.urgent}
            </div>
            <p className="text-sm text-gray-600">Require immediate attention</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    yellow: 'from-yellow-500 to-orange-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm opacity-90">{title}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

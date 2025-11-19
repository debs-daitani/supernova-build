/**
 * My Tickets Page
 * List of user's support tickets
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);

      const response = await fetch(`/api/support/tickets?${params}`);
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

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'text-green-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      URGENT: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Support Tickets</h1>
          <p className="text-gray-600">
            View and manage your support requests
          </p>
        </div>
        <button
          onClick={() => navigate('/support/new')}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-all"
        >
          + New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex gap-3 overflow-x-auto">
          {['ALL', 'OPEN', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All Tickets' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="animate-pulse">Loading tickets...</div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-xl font-bold mb-2">No tickets found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'ALL'
              ? "You haven't submitted any support tickets yet"
              : `No tickets with status: ${filter}`}
          </p>
          <button
            onClick={() => navigate('/support/new')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600"
          >
            Submit Your First Ticket
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Ticket #
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Messages
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tickets.map(ticket => (
                <tr
                  key={ticket.id}
                  onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium">
                      {ticket.ticketNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{ticket.subject}</div>
                    {ticket.assignedTo && (
                      <div className="text-xs text-gray-500 mt-1">
                        Assigned to {ticket.assignedTo.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {ticket.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      {ticket._count?.messages || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

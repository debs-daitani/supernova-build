import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { events, eventRegistrations, eventAnalytics } from '../../services/api';
import useAuthStore from '../../stores/authStore';

export default function EventsDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [user.id]);

  const loadDashboardData = async () => {
    try {
      // Get user's events
      const userEvents = await events.list({ userId: user.id });

      // Filter upcoming events
      const now = new Date();
      const upcoming = userEvents.filter(e => new Date(e.startDateTime) >= now);

      // Calculate total registrations and revenue
      let totalRegs = 0;
      let totalRev = 0;

      for (const event of userEvents) {
        totalRegs += event.totalRegistered || 0;

        // Get revenue for each event
        try {
          const analytics = await eventAnalytics.get(event.id);
          totalRev += analytics.totalRevenue || 0;
        } catch (err) {
          console.error('Failed to load analytics for event:', event.id);
        }
      }

      setStats({
        totalEvents: userEvents.length,
        upcomingEvents: upcoming.length,
        totalRegistrations: totalRegs,
        totalRevenue: totalRev,
      });

      // Sort upcoming events by date
      setUpcomingEvents(upcoming.sort((a, b) =>
        new Date(a.startDateTime) - new Date(b.startDateTime)
      ).slice(0, 5));

      // Get recent registrations from all events
      const allRegs = [];
      for (const event of userEvents.slice(0, 5)) {
        try {
          const regs = await eventRegistrations.list(event.id);
          allRegs.push(...regs.map(r => ({ ...r, event })));
        } catch (err) {
          console.error('Failed to load registrations for event:', event.id);
        }
      }

      // Sort by date and take latest 5
      setRecentRegistrations(
        allRegs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
      );

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'in_person': return '📍';
      case 'virtual': return '💻';
      case 'hybrid': return '🌐';
      default: return '📅';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'workshop': return '🛠️';
      case 'webinar': return '🎓';
      case 'meetup': return '🤝';
      case 'conference': return '🎤';
      case 'networking': return '🌟';
      default: return '📋';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: 'bg-green-500/20 text-green-300 border-green-400',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-400',
      waitlist: 'bg-blue-500/20 text-blue-300 border-blue-400',
      cancelled: 'bg-red-500/20 text-red-300 border-red-400',
      checked_in: 'bg-purple-500/20 text-purple-300 border-purple-400',
    };

    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">🎫</div>
            <p className="text-purple-300">Loading your events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🎫 Events Platform</h1>
              <p className="text-purple-200">Host amazing events and manage your attendees</p>
            </div>
            <Link
              to="/events/create"
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg"
            >
              + Create Event
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-300 text-sm font-medium">Total Events</p>
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
            <p className="text-purple-400 text-xs mt-1">All time</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-300 text-sm font-medium">Upcoming Events</p>
              <span className="text-2xl">🚀</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.upcomingEvents}</p>
            <p className="text-purple-400 text-xs mt-1">Scheduled</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-300 text-sm font-medium">Total Registrations</p>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalRegistrations}</p>
            <p className="text-purple-400 text-xs mt-1">All events</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-300 text-sm font-medium">Total Revenue</p>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-white">£{stats.totalRevenue.toFixed(2)}</p>
            <p className="text-purple-400 text-xs mt-1">Ticket sales</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/events/create"
              className="p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-400/30 transition-all text-center"
            >
              <div className="text-3xl mb-2">➕</div>
              <p className="text-white font-semibold text-sm">Create Event</p>
            </Link>

            <Link
              to="/events/calendar"
              className="p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-400/30 transition-all text-center"
            >
              <div className="text-3xl mb-2">📆</div>
              <p className="text-white font-semibold text-sm">Event Calendar</p>
            </Link>

            <Link
              to="/events/registrations"
              className="p-4 bg-green-500/20 hover:bg-green-500/30 rounded-lg border border-green-400/30 transition-all text-center"
            >
              <div className="text-3xl mb-2">✅</div>
              <p className="text-white font-semibold text-sm">Manage Registrations</p>
            </Link>

            <Link
              to="/events/analytics"
              className="p-4 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg border border-indigo-400/30 transition-all text-center"
            >
              <div className="text-3xl mb-2">📊</div>
              <p className="text-white font-semibold text-sm">View Analytics</p>
            </Link>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
              <Link to="/events/calendar" className="text-purple-300 hover:text-purple-200 text-sm">
                View All →
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">📅</p>
                <p className="text-purple-300 mb-2">No upcoming events</p>
                <p className="text-purple-400 text-sm mb-4">Create your first event to get started!</p>
                <Link
                  to="/events/create"
                  className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
                >
                  Create Event
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <Link
                    key={event.id}
                    to={`/events/${event.slug}`}
                    className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        {getCategoryIcon(event.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-white font-semibold">{event.title}</h3>
                          <span className="text-xl ml-2 flex-shrink-0">{getEventTypeIcon(event.eventType)}</span>
                        </div>
                        <p className="text-purple-300 text-sm mb-2">{formatDate(event.startDateTime)}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-purple-400">
                            👥 {event.totalRegistered} / {event.unlimitedCapacity ? '∞' : event.maxAttendees}
                          </span>
                          {event.spotsLeft !== null && event.spotsLeft <= 10 && (
                            <span className="text-yellow-300">
                              ⚠️ {event.spotsLeft} spots left
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Registrations */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Registrations</h2>
              <Link to="/events/registrations" className="text-purple-300 hover:text-purple-200 text-sm">
                View All →
              </Link>
            </div>

            {recentRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">🎟️</p>
                <p className="text-purple-300 mb-2">No registrations yet</p>
                <p className="text-purple-400 text-sm">They'll appear here as people register for your events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRegistrations.map(reg => (
                  <div
                    key={reg.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-semibold">{reg.attendeeName}</p>
                        <p className="text-purple-300 text-sm">{reg.attendeeEmail}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusBadge(reg.status)}`}>
                        {reg.status}
                      </span>
                    </div>
                    <p className="text-purple-400 text-xs mb-2">
                      {reg.event?.title || 'Event'}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-400">
                        {formatDate(reg.createdAt)}
                      </span>
                      {reg.orderTotal > 0 && (
                        <span className="text-green-300">
                          £{reg.orderTotal.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

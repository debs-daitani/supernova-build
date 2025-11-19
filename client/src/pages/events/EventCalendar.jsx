import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { events } from '../../services/api';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'conference', label: 'Conference' },
  { value: 'networking', label: 'Networking' },
];

const EVENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'in_person', label: 'In Person' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'hybrid', label: 'Hybrid' },
];

export default function EventCalendar() {
  const [loading, setLoading] = useState(true);
  const [eventsList, setEventsList] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [filters, setFilters] = useState({
    category: '',
    eventType: '',
    upcoming: 'true',
    search: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, eventsList]);

  const loadEvents = async () => {
    try {
      const data = await events.list({ published: 'true' });
      setEventsList(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...eventsList];

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }

    // Event type filter
    if (filters.eventType) {
      filtered = filtered.filter(e => e.eventType === filters.eventType);
    }

    // Upcoming filter
    if (filters.upcoming === 'true') {
      const now = new Date();
      filtered = filtered.filter(e => new Date(e.startDateTime) >= now);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEvents(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
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

  const getAvailabilityBadge = (event) => {
    if (event.unlimitedCapacity) {
      return <span className="text-green-300 text-sm">✓ Available</span>;
    }

    if (event.spotsLeft === null) {
      return <span className="text-green-300 text-sm">✓ Available</span>;
    }

    if (event.spotsLeft === 0) {
      return <span className="text-red-300 text-sm">✗ Sold Out</span>;
    }

    if (event.spotsLeft <= 10) {
      return <span className="text-yellow-300 text-sm">⚠️ {event.spotsLeft} spots left</span>;
    }

    return <span className="text-green-300 text-sm">✓ Available</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">📅</div>
            <p className="text-purple-300">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-3">📅 Event Calendar</h1>
          <p className="text-purple-200 text-lg">Discover and join amazing events</p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value} className="bg-gray-900">
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Event Type */}
            <select
              value={filters.eventType}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {EVENT_TYPES.map(type => (
                <option key={type.value} value={type.value} className="bg-gray-900">
                  {type.label}
                </option>
              ))}
            </select>

            {/* Upcoming/All */}
            <select
              value={filters.upcoming}
              onChange={(e) => handleFilterChange('upcoming', e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="true" className="bg-gray-900">Upcoming Only</option>
              <option value="false" className="bg-gray-900">All Events</option>
            </select>
          </div>

          {/* View Toggle & Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-purple-300 text-sm">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  view === 'list'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-purple-300 hover:bg-white/20'
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  view === 'calendar'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-purple-300 hover:bg-white/20'
                }`}
              >
                📅 Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Events Display */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="text-white text-2xl font-bold mb-2">No events found</h3>
            <p className="text-purple-300 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => setFilters({ category: '', eventType: '', upcoming: 'true', search: '' })}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : view === 'list' ? (
          // List View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map(event => (
              <Link
                key={event.id}
                to={`/events/${event.slug}`}
                className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-purple-400/50 transition-all group"
              >
                {/* Cover Image */}
                {event.coverImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getCategoryIcon(event.category)}</span>
                        <span className="text-purple-300 text-sm capitalize">{event.category}</span>
                        <span className="text-xl">{getEventTypeIcon(event.eventType)}</span>
                      </div>
                      <h3 className="text-white text-xl font-bold group-hover:text-purple-300 transition-colors">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-purple-200 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Date & Time */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-purple-300">
                      <span>📅</span>
                      <span>{formatDate(event.startDateTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-300">
                      <span>🕐</span>
                      <span>{formatTime(event.startDateTime)}</span>
                    </div>
                  </div>

                  {/* Location/Platform */}
                  <div className="mb-4 text-sm text-purple-300">
                    {event.eventType === 'virtual' ? (
                      <div className="flex items-center gap-2">
                        <span>💻</span>
                        <span>{event.streamPlatform || 'Online Event'}</span>
                      </div>
                    ) : event.eventType === 'hybrid' ? (
                      <div className="flex items-center gap-2">
                        <span>🌐</span>
                        <span>{event.venueName || 'Hybrid Event'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{event.venueName || event.venueCity || 'TBA'}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      {event.isFree ? (
                        <span className="text-green-300 font-semibold">FREE</span>
                      ) : (
                        <span className="text-white font-semibold">Paid Event</span>
                      )}
                    </div>
                    {getAvailabilityBadge(event)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Calendar View
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-center py-20">
              <p className="text-6xl mb-4">📅</p>
              <h3 className="text-white text-2xl font-bold mb-2">Calendar View</h3>
              <p className="text-purple-300 mb-6">
                Calendar view with interactive date selection coming soon!
              </p>
              <button
                onClick={() => setView('list')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-all"
              >
                Switch to List View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

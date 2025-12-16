'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  LayoutGrid,
  X,
  MapPin,
  Clock,
  User,
  Trash2,
} from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  allDay: boolean
  location?: string
  colour?: string
  source: string
  contactId?: string
  venuedTaskId?: string
  contact?: {
    id: string
    firstName: string
    lastName?: string
  }
  isCompleted?: boolean
}

interface Contact {
  id: string
  firstName: string
  lastName?: string
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda'

export default function CalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [saving, setSaving] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '10:00',
    allDay: false,
    location: '',
    colour: '#00F0E9',
    contactId: '',
    syncToGoogle: true,
  })

  useEffect(() => {
    fetchEvents()
    fetchContacts()
    checkConnectionStatus()
  }, [currentDate, viewMode])

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/calendar/status')
      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.connected)
      }
    } catch (error) {
      console.error('Failed to check connection status:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const { start, end } = getDateRange()
      const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        syncGoogle: isConnected ? 'true' : 'false',
      })

      const response = await fetch(`/api/calendar/events?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/crm/contacts?limit=200')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    }
  }

  const getDateRange = () => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    if (viewMode === 'month') {
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
    } else if (viewMode === 'week') {
      const day = start.getDay()
      start.setDate(start.getDate() - day + 1) // Monday
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6) // Sunday
      end.setHours(23, 59, 59, 999)
    } else if (viewMode === 'day') {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else {
      // Agenda - next 30 days
      start.setHours(0, 0, 0, 0)
      end.setDate(end.getDate() + 30)
      end.setHours(23, 59, 59, 999)
    }

    return { start, end }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const startTime = formData.allDay
        ? new Date(formData.startDate)
        : new Date(`${formData.startDate}T${formData.startTime}`)
      const endTime = formData.allDay
        ? new Date(formData.endDate)
        : new Date(`${formData.endDate}T${formData.endTime}`)

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          allDay: formData.allDay,
          location: formData.location || null,
          colour: formData.colour,
          contactId: formData.contactId || null,
          syncToGoogle: formData.syncToGoogle && isConnected,
        }),
      })

      if (response.ok) {
        setShowModal(false)
        resetForm()
        fetchEvents()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create event')
      }
    } catch (error) {
      alert('Failed to create event')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Delete this event?')) return

    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setShowEventModal(false)
        setSelectedEvent(null)
        fetchEvents()
      }
    } catch (error) {
      alert('Failed to delete event')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '10:00',
      allDay: false,
      location: '',
      colour: '#00F0E9',
      contactId: '',
      syncToGoogle: true,
    })
  }

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatDateHeader = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    } else if (viewMode === 'week') {
      const { start, end } = getDateRange()
      return `${start.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    }
  }

  const getEventColor = (event: CalendarEvent) => {
    if (event.source === 'venued') return 'bg-gradient-to-r from-hot-pink to-purple-500'
    if (event.colour) return ''
    return 'bg-light-teal/80'
  }

  const openEventModal = (event: CalendarEvent) => {
    if (event.venuedTaskId) {
      // Navigate to VENUED for VENUED tasks
      router.push('/venued')
      return
    }
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  // Generate calendar grid for month view
  const generateMonthGrid = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startDay = firstDay.getDay() || 7 // Monday = 1
    const daysInMonth = lastDay.getDate()

    const days = []

    // Previous month padding
    for (let i = 1; i < startDay; i++) {
      const date = new Date(firstDay)
      date.setDate(date.getDate() - (startDay - i))
      days.push({ date, isCurrentMonth: false })
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), isCurrentMonth: true })
    }

    // Next month padding
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(lastDay)
      date.setDate(date.getDate() + i)
      days.push({ date, isCurrentMonth: false })
    }

    return days
  }

  // Generate week view hours
  const generateWeekDays = () => {
    const { start } = getDateRange()
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      )
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('prev')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="text-light-teal" size={24} />
          </button>
          <h2 className="text-xl font-supernova text-light-teal min-w-[280px] text-center">
            {formatDateHeader()}
          </h2>
          <button
            onClick={() => navigate('next')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="text-light-teal" size={24} />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-josefin text-sm hover:bg-white/20 transition-all"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg bg-white/5 border border-light-teal/20 overflow-hidden">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 font-josefin text-sm transition-all ${viewMode === 'month' ? 'bg-light-teal/20 text-light-teal' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 font-josefin text-sm transition-all ${viewMode === 'week' ? 'bg-light-teal/20 text-light-teal' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 font-josefin text-sm transition-all ${viewMode === 'day' ? 'bg-light-teal/20 text-light-teal' : 'text-gray-400 hover:text-white'}`}
            >
              <CalendarIcon size={18} />
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-2 font-josefin text-sm transition-all ${viewMode === 'agenda' ? 'bg-light-teal/20 text-light-teal' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>

          <button
            onClick={() => router.push('/calendar/settings')}
            className="p-2 rounded-lg bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-all"
          >
            <Settings size={20} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(0,240,233,0.3)] transition-all"
          >
            <Plus size={18} />
            New Event
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
        {viewMode === 'month' && (
          <div>
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-light-teal/20">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="px-2 py-3 text-center text-xs font-supernova text-light-teal uppercase">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {generateMonthGrid().map((day, i) => {
                const dayEvents = getEventsForDate(day.date)
                return (
                  <div
                    key={i}
                    className={`min-h-[100px] p-2 border-b border-r border-white/5 ${!day.isCurrentMonth ? 'bg-black/20' : ''} ${isToday(day.date) ? 'bg-light-teal/10' : ''}`}
                  >
                    <div className={`text-sm font-josefin mb-1 ${day.isCurrentMonth ? 'text-white' : 'text-gray-600'} ${isToday(day.date) ? 'text-light-teal font-bold' : ''}`}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={() => openEventModal(event)}
                          className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer ${getEventColor(event)} ${event.colour && !event.source.includes('venued') ? '' : 'text-white'}`}
                          style={event.colour && event.source !== 'venued' ? { backgroundColor: event.colour } : {}}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-400 font-josefin">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {viewMode === 'week' && (
          <div>
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-light-teal/20">
              <div className="p-2 text-xs font-josefin text-gray-500">Time</div>
              {generateWeekDays().map(day => (
                <div
                  key={day.toISOString()}
                  className={`p-2 text-center ${isToday(day) ? 'bg-light-teal/10' : ''}`}
                >
                  <div className="text-xs font-supernova text-light-teal uppercase">
                    {day.toLocaleDateString('default', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-josefin ${isToday(day) ? 'text-light-teal font-bold' : 'text-white'}`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>
            {/* Time Grid */}
            <div className="max-h-[600px] overflow-y-auto">
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-white/5">
                  <div className="p-2 text-xs text-gray-500 font-josefin">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {generateWeekDays().map(day => {
                    const dayEvents = getEventsForDate(day).filter(event => {
                      const eventHour = new Date(event.startTime).getHours()
                      return eventHour === hour
                    })
                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        className={`min-h-[48px] p-1 border-l border-white/5 ${isToday(day) ? 'bg-light-teal/5' : ''}`}
                      >
                        {dayEvents.map(event => (
                          <div
                            key={event.id}
                            onClick={() => openEventModal(event)}
                            className={`text-xs px-1.5 py-1 rounded mb-1 cursor-pointer ${getEventColor(event)} ${event.colour && event.source !== 'venued' ? '' : 'text-white'}`}
                            style={event.colour && event.source !== 'venued' ? { backgroundColor: event.colour } : {}}
                          >
                            <div className="font-semibold truncate">{event.title}</div>
                            <div className="text-[10px] opacity-80">{formatTime(event.startTime)}</div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'day' && (
          <div>
            <div className="p-4 border-b border-light-teal/20 text-center">
              <div className="text-2xl font-supernova text-light-teal">
                {currentDate.toLocaleDateString('default', { weekday: 'long' })}
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {Array.from({ length: 24 }, (_, hour) => {
                const hourEvents = events.filter(event => {
                  const eventDate = new Date(event.startTime)
                  return (
                    eventDate.getFullYear() === currentDate.getFullYear() &&
                    eventDate.getMonth() === currentDate.getMonth() &&
                    eventDate.getDate() === currentDate.getDate() &&
                    eventDate.getHours() === hour
                  )
                })
                return (
                  <div key={hour} className="flex border-b border-white/5">
                    <div className="w-20 p-3 text-sm text-gray-500 font-josefin">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 min-h-[60px] p-2">
                      {hourEvents.map(event => (
                        <div
                          key={event.id}
                          onClick={() => openEventModal(event)}
                          className={`px-3 py-2 rounded mb-2 cursor-pointer ${getEventColor(event)} ${event.colour && event.source !== 'venued' ? '' : 'text-white'}`}
                          style={event.colour && event.source !== 'venued' ? { backgroundColor: event.colour } : {}}
                        >
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-sm opacity-80">
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </div>
                          {event.location && (
                            <div className="text-sm opacity-80 flex items-center gap-1 mt-1">
                              <MapPin size={12} />
                              {event.location}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {viewMode === 'agenda' && (
          <div className="p-4">
            <h3 className="text-lg font-supernova text-light-teal mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-gray-500 font-josefin text-center py-8">
                  No upcoming events in the next 30 days
                </p>
              ) : (
                events.map(event => (
                  <div
                    key={event.id}
                    onClick={() => openEventModal(event)}
                    className="flex items-start gap-4 p-4 rounded-lg bg-black/30 hover:bg-black/50 transition-colors cursor-pointer"
                  >
                    <div
                      className="w-1 h-full min-h-[60px] rounded-full"
                      style={{ backgroundColor: event.source === 'venued' ? '#FF008E' : event.colour || '#00F0E9' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-josefin text-white font-semibold">{event.title}</div>
                          <div className="text-sm text-gray-400 font-josefin flex items-center gap-2 mt-1">
                            <Clock size={14} />
                            {new Date(event.startTime).toLocaleDateString('default', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            at {formatTime(event.startTime)}
                          </div>
                          {event.location && (
                            <div className="text-sm text-gray-400 font-josefin flex items-center gap-2 mt-1">
                              <MapPin size={14} />
                              {event.location}
                            </div>
                          )}
                          {event.contact && (
                            <div className="text-sm text-gray-400 font-josefin flex items-center gap-2 mt-1">
                              <User size={14} />
                              {event.contact.firstName} {event.contact.lastName || ''}
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-josefin ${event.source === 'venued' ? 'bg-hot-pink/20 text-hot-pink' : event.source === 'google' ? 'bg-blue-500/20 text-blue-400' : 'bg-light-teal/20 text-light-teal'}`}>
                          {event.source === 'venued' ? 'VENUED' : event.source === 'google' ? 'Google' : 'Manual'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm font-josefin text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-light-teal/80" />
          <span>Calendar Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-hot-pink to-purple-500" />
          <span>VENUED Tasks</span>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Google Calendar</span>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-light-teal/20 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-supernova text-light-teal">New Event</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  placeholder="Event title"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allDay}
                    onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                    className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-light-teal"
                  />
                  <span className="font-josefin text-gray-300">All day</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  />
                </div>
                {!formData.allDay && (
                  <div>
                    <label className="block text-sm font-josefin text-gray-300 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  />
                </div>
                {!formData.allDay && (
                  <div>
                    <label className="block text-sm font-josefin text-gray-300 mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  placeholder="Add location"
                />
              </div>

              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  placeholder="Add description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">Link to Contact</label>
                  <select
                    value={formData.contactId}
                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  >
                    <option value="">No contact</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName || ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">Colour</label>
                  <input
                    type="color"
                    value={formData.colour}
                    onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                    className="w-full h-10 rounded-lg bg-black/50 border border-light-teal/20 cursor-pointer"
                  />
                </div>
              </div>

              {isConnected && (
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.syncToGoogle}
                      onChange={(e) => setFormData({ ...formData, syncToGoogle: e.target.checked })}
                      className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-light-teal"
                    />
                    <span className="font-josefin text-gray-300">Sync to Google Calendar</span>
                  </label>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-josefin transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(0,240,233,0.3)] transition-all disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-light-teal/20 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-supernova text-light-teal">{selectedEvent.title}</h3>
              <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300 font-josefin">
                <Clock size={18} className="text-light-teal" />
                <div>
                  <div>{new Date(selectedEvent.startTime).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <div className="text-sm text-gray-400">
                    {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                  </div>
                </div>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-gray-300 font-josefin">
                  <MapPin size={18} className="text-light-teal" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.contact && (
                <div className="flex items-center gap-3 text-gray-300 font-josefin">
                  <User size={18} className="text-light-teal" />
                  <span>{selectedEvent.contact.firstName} {selectedEvent.contact.lastName || ''}</span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-gray-300 font-josefin text-sm whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-josefin ${selectedEvent.source === 'google' ? 'bg-blue-500/20 text-blue-400' : 'bg-light-teal/20 text-light-teal'}`}>
                  {selectedEvent.source === 'google' ? 'Synced from Google' : 'Manual Event'}
                </span>
                <button
                  onClick={() => handleDelete(selectedEvent.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 font-josefin text-sm hover:bg-red-500/30 transition-all"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

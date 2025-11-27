import { useState, useEffect } from 'react';
import { habits as habitsApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [celebrating, setCelebrating] = useState(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const response = await habitsApi.list({ archived: false });
      setHabits(response.data);
    } catch (error) {
      console.error('Error loading habits:', error);
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (habitId, date = null) => {
    try {
      const response = await habitsApi.complete(habitId, date ? { date } : {});
      const habit = response.data;

      // Check if we should celebrate
      const wasCompleted = habits.find((h) => h.id === habitId);
      if (habit.streak > (wasCompleted?.streak || 0)) {
        setCelebrating({ habitId, streak: habit.streak });
        setTimeout(() => setCelebrating(null), 3000);

        // Special milestone celebrations
        if (habit.streak === 7) {
          toast.success('🎉 7 day streak! You\'re building a habit!', { duration: 4000 });
        } else if (habit.streak === 30) {
          toast.success('🔥 30 day streak! Amazing consistency!', { duration: 4000 });
        } else if (habit.streak === 100) {
          toast.success('🏆 100 day streak! You\'re a legend!', { duration: 4000 });
        } else if (habit.streak > 0 && habit.streak % 10 === 0) {
          toast.success(`🔥 ${habit.streak} day streak! Keep it up!`, { duration: 4000 });
        } else {
          toast.success('Great job! Keep the streak going! 🎯');
        }
      } else {
        toast('Habit unchecked');
      }

      loadHabits();
    } catch (error) {
      console.error('Error completing habit:', error);
      toast.error('Failed to update habit');
    }
  };

  const handleCreate = async (data) => {
    try {
      await habitsApi.create(data);
      toast.success('Habit created!');
      setShowCreateModal(false);
      loadHabits();
    } catch (error) {
      console.error('Error creating habit:', error);
      toast.error('Failed to create habit');
    }
  };

  const handleDelete = async (habitId) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    try {
      await habitsApi.delete(habitId);
      toast.success('Habit deleted');
      loadHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const todayHabits = habits.filter((h) => {
    if (h.frequency === 'daily') return true;
    if (h.frequency === 'weekly' && h.targetDays?.length > 0) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
      return h.targetDays.includes(today);
    }
    return true;
  });

  const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
  const longestStreak = Math.max(...habits.map((h) => h.longestStreak || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎯 Habit Tracker</h1>
        <p className="text-gray-600">Build consistency one day at a time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon="🔥"
          title="Active Habits"
          value={habits.length}
          color="from-orange-500 to-red-600"
        />
        <StatCard
          icon="📊"
          title="Total Streak Days"
          value={totalStreak}
          color="from-blue-500 to-purple-600"
        />
        <StatCard
          icon="🏆"
          title="Longest Streak"
          value={longestStreak}
          subtitle="days"
          color="from-purple-500 to-pink-600"
        />
      </div>

      {/* Today's Habits */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">☀️ Today's Habits</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Add Habit
          </button>
        </div>

        {todayHabits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No habits for today</p>
            <p className="text-sm text-gray-400 mb-6">
              Create your first habit to start building consistency!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={handleComplete}
                onDelete={handleDelete}
                celebrating={celebrating?.habitId === habit.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* All Habits */}
      {habits.length > todayHabits.length && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">📅 All Habits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={handleComplete}
                onDelete={handleDelete}
                celebrating={celebrating?.habitId === habit.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Habit Modal */}
      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Celebration Animation */}
      {celebrating && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-9xl animate-bounce">
            {celebrating.streak >= 30 ? '🏆' : celebrating.streak >= 7 ? '🔥' : '🎉'}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-lg shadow-md p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-sm mb-1 opacity-90">{title}</h3>
      <p className="text-3xl font-bold">
        {value} {subtitle && <span className="text-lg">{subtitle}</span>}
      </p>
    </div>
  );
}

function HabitCard({ habit, onComplete, onDelete, celebrating }) {
  const isCompletedToday = habit.completions?.some((c) => {
    const completionDate = new Date(c.date);
    const today = new Date();
    return (
      completionDate.getDate() === today.getDate() &&
      completionDate.getMonth() === today.getMonth() &&
      completionDate.getFullYear() === today.getFullYear()
    );
  });

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 7) return 'text-orange-600';
    if (streak >= 3) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getFrequencyText = (habit) => {
    if (habit.frequency === 'daily') return 'Daily';
    if (habit.frequency === 'weekly' && habit.targetDays?.length > 0) {
      return habit.targetDays.map((d) => d.slice(0, 3)).join(', ');
    }
    return habit.frequency;
  };

  // Generate last 7 days for mini calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const isCompletedOnDate = (date) => {
    return habit.completions?.some((c) => {
      const completionDate = new Date(c.date);
      return (
        completionDate.getDate() === date.getDate() &&
        completionDate.getMonth() === date.getMonth() &&
        completionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div
      className={`bg-gray-50 rounded-lg p-5 border-2 transition-all ${
        celebrating
          ? 'border-yellow-400 shadow-lg scale-105'
          : 'border-transparent hover:border-gray-200'
      }`}
      style={{ borderColor: celebrating ? habit.color : undefined }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => onComplete(habit.id)}
            className={`w-12 h-12 rounded-full border-3 transition-all flex items-center justify-center text-2xl ${
              isCompletedToday
                ? 'bg-green-500 border-green-600 text-white shadow-md'
                : 'bg-white border-gray-300 hover:border-pink-500'
            }`}
            style={{
              borderColor: isCompletedToday ? undefined : habit.color,
            }}
          >
            {isCompletedToday ? '✓' : habit.icon || '⭐'}
          </button>

          <div className="flex-1">
            <h3 className="font-bold text-lg">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{getFrequencyText(habit)}</p>
          </div>
        </div>

        <button
          onClick={() => onDelete(habit.id)}
          className="text-gray-400 hover:text-red-600 transition-colors p-1"
        >
          🗑️
        </button>
      </div>

      {/* Streak Display */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className={`text-2xl font-bold ${getStreakColor(habit.streak || 0)}`}>
            {habit.streak || 0} 🔥
          </p>
          <p className="text-xs text-gray-500">Current Streak</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-gray-700">
            {habit.longestStreak || 0} 🏆
          </p>
          <p className="text-xs text-gray-500">Best Streak</p>
        </div>
      </div>

      {/* Mini Calendar - Last 7 Days */}
      <div className="flex gap-1">
        {last7Days.map((date, idx) => {
          const completed = isCompletedOnDate(date);
          const isToday =
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth();

          return (
            <div
              key={idx}
              className="flex-1 text-center"
              title={date.toLocaleDateString()}
            >
              <div className="text-xs text-gray-500 mb-1">
                {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
              </div>
              <div
                className={`w-full h-8 rounded transition-colors ${
                  completed
                    ? 'bg-green-500'
                    : isToday
                    ? 'bg-pink-100 border-2 border-pink-400'
                    : 'bg-gray-200'
                }`}
                style={{
                  backgroundColor: completed ? habit.color : undefined,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      {habit.streak >= 3 && habit.streak < 7 && (
        <p className="text-xs text-center text-blue-600 mt-3 font-medium">
          Keep going! You're building momentum! 💪
        </p>
      )}
      {habit.streak >= 7 && habit.streak < 30 && (
        <p className="text-xs text-center text-orange-600 mt-3 font-medium">
          You're on fire! This is becoming a habit! 🔥
        </p>
      )}
      {habit.streak >= 30 && (
        <p className="text-xs text-center text-purple-600 mt-3 font-medium">
          Legendary consistency! You're unstoppable! 🏆
        </p>
      )}
    </div>
  );
}

function CreateHabitModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '⭐',
    color: '#FF1493',
    frequency: 'daily',
    targetDays: [],
  });

  const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  const toggleDay = (day) => {
    setFormData({
      ...formData,
      targetDays: formData.targetDays.includes(day)
        ? formData.targetDays.filter((d) => d !== day)
        : [...formData.targetDays, day],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Create New Habit</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Habit Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input w-full"
              placeholder="e.g., Morning workout, Read for 20min"
              required
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input w-full"
              rows={2}
              placeholder="Why is this habit important?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="input w-full text-2xl text-center"
                placeholder="⭐"
              />
            </div>

            <div>
              <label className="label">Color</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="input w-full h-12"
              />
            </div>
          </div>

          <div>
            <label className="label">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="input w-full"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Specific Days</option>
            </select>
          </div>

          {formData.frequency === 'weekly' && (
            <div>
              <label className="label">Select Days</label>
              <div className="grid grid-cols-4 gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`p-2 rounded text-xs font-medium transition-colors ${
                      formData.targetDays.includes(day)
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

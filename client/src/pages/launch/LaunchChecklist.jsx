import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { launches, launchChecklist } from '../../services/api';

const CATEGORY_COLORS = {
  marketing: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-400' },
  technical: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-400' },
  legal: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-400' },
  content: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-400' },
  logistics: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-400' },
};

export default function LaunchChecklist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [launch, setLaunch] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadLaunch();
  }, [id]);

  const loadLaunch = async () => {
    try {
      const data = await launches.get(id);
      setLaunch(data);
    } catch (error) {
      console.error('Failed to load launch:', error);
      navigate('/launch');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (itemId) => {
    try {
      await launchChecklist.toggle(id, itemId);
      // Reload launch data
      await loadLaunch();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await launchChecklist.delete(id, itemId);
      await loadLaunch();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntil = (dateStr) => {
    const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days}d`;
  };

  const groupTasksByTimeline = () => {
    if (!launch) return {};

    const filtered = launch.checklist.filter(task => {
      if (filter === 'completed' && !task.completed) return false;
      if (filter === 'pending' && task.completed) return false;
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
      return true;
    });

    // Group by days until due date
    const groups = {};
    filtered.forEach(task => {
      if (!task.dueDate) {
        if (!groups['No Due Date']) groups['No Due Date'] = [];
        groups['No Due Date'].push(task);
        return;
      }

      const days = Math.ceil((new Date(task.dueDate) - new Date(launch.launchDate)) / (1000 * 60 * 60 * 24));

      let groupName;
      if (days > 60) groupName = '90+ Days Before';
      else if (days > 30) groupName = '60 Days Before';
      else if (days > 14) groupName = '30 Days Before';
      else if (days > 7) groupName = '2 Weeks Before';
      else if (days > 0) groupName = 'Launch Week';
      else if (days === 0) groupName = 'Launch Day';
      else groupName = 'Post-Launch';

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(task);
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">📋</div>
            <p className="text-orange-300">Loading checklist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!launch) return null;

  const taskGroups = groupTasksByTimeline();
  const progress = launch.totalTasks > 0
    ? Math.round((launch.completedTasks / launch.totalTasks) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/launch')}
            className="text-orange-300 hover:text-orange-200 mb-4"
          >
            ← Back to Launches
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{launch.name}</h1>
              <p className="text-orange-200">Launch Checklist</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{progress}%</div>
              <div className="text-orange-300 text-sm">
                {launch.completedTasks}/{launch.totalTasks} tasks
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <div className="w-full bg-white/10 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-300">
              {launch.daysUntilLaunch >= 0
                ? `${launch.daysUntilLaunch} days until launch`
                : `Launched ${Math.abs(launch.daysUntilLaunch)} days ago`
              }
            </span>
            <span className="text-orange-300">
              {formatDate(launch.launchDate)}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-orange-300 hover:bg-white/20'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'pending'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-orange-300 hover:bg-white/20'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'completed'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-orange-300 hover:bg-white/20'
                }`}
              >
                Completed
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all" className="bg-gray-900">All Categories</option>
              <option value="marketing" className="bg-gray-900">Marketing</option>
              <option value="technical" className="bg-gray-900">Technical</option>
              <option value="legal" className="bg-gray-900">Legal</option>
              <option value="content" className="bg-gray-900">Content</option>
              <option value="logistics" className="bg-gray-900">Logistics</option>
            </select>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-6">
          {Object.keys(taskGroups).length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <p className="text-5xl mb-3">✓</p>
              <p className="text-white text-lg">No tasks match your filters</p>
            </div>
          ) : (
            Object.entries(taskGroups).map(([groupName, tasks]) => (
              <div key={groupName}>
                <h2 className="text-xl font-bold text-white mb-3">{groupName}</h2>
                <div className="space-y-2">
                  {tasks.map(task => {
                    const categoryColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.logistics;
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

                    return (
                      <div
                        key={task.id}
                        className={`bg-white/10 backdrop-blur-lg rounded-lg p-4 border transition-all ${
                          task.completed
                            ? 'border-green-400/30 opacity-60'
                            : isOverdue
                            ? 'border-red-400/50'
                            : 'border-white/20 hover:border-orange-400/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggle(task.id)}
                            className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                              task.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-white/40 hover:border-orange-400'
                            }`}
                          >
                            {task.completed && <span className="text-white text-sm">✓</span>}
                          </button>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className={`font-semibold ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                                {task.task}
                              </h3>
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="text-red-300 hover:text-red-200 text-sm ml-2"
                              >
                                🗑️
                              </button>
                            </div>

                            {task.description && (
                              <p className="text-orange-200 text-sm mb-2">{task.description}</p>
                            )}

                            <div className="flex items-center gap-3 text-xs">
                              <span className={`px-2 py-1 rounded border capitalize ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}>
                                {task.category}
                              </span>
                              {task.dueDate && (
                                <span className={`${isOverdue ? 'text-red-300 font-semibold' : 'text-orange-300'}`}>
                                  Due: {formatDate(task.dueDate)} ({getDaysUntil(task.dueDate)})
                                </span>
                              )}
                              {task.completed && task.completedAt && (
                                <span className="text-green-300">
                                  ✓ Completed {formatDate(task.completedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

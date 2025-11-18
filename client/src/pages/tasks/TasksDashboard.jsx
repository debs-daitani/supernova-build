import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasks, taskStats, timeTracking } from '../../services/api';
import toast from 'react-hot-toast';

export default function TasksDashboard() {
  const [stats, setStats] = useState(null);
  const [myDayTasks, setMyDayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickAddInput, setQuickAddInput] = useState('');

  useEffect(() => {
    loadDashboard();
    loadActiveTimer();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, todayRes, upcomingRes] = await Promise.all([
        taskStats.get(),
        tasks.list({ dueDate: 'today' }),
        tasks.list({ dueDate: 'week' }),
      ]);

      setStats(statsRes.data);
      setMyDayTasks(todayRes.data);
      setUpcomingTasks(upcomingRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveTimer = async () => {
    try {
      const response = await timeTracking.active();
      setActiveTimer(response.data);
    } catch (error) {
      console.error('Error loading active timer:', error);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickAddInput.trim()) return;

    try {
      await tasks.create({
        title: quickAddInput.trim(),
        status: 'todo',
        priority: 'medium',
      });
      setQuickAddInput('');
      toast.success('Task added to inbox!');
      loadDashboard();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasks.complete(taskId);
      toast.success('Great job! 🎉');
      loadDashboard();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleStartTimer = async (task) => {
    try {
      const response = await timeTracking.start(task.id, {
        description: `Working on: ${task.title}`,
      });
      setActiveTimer(response.data);
      toast.success(`Timer started for "${task.title}"`);
    } catch (error) {
      console.error('Error starting timer:', error);
      toast.error(error.response?.data?.error || 'Failed to start timer');
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;

    try {
      await timeTracking.stop(activeTimer.id);
      setActiveTimer(null);
      toast.success('Timer stopped!');
      loadDashboard();
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast.error('Failed to stop timer');
    }
  };

  const getTimerDuration = () => {
    if (!activeTimer) return '00:00';
    const start = new Date(activeTimer.startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000); // seconds
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const groupTasksByDate = (tasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() + 7);

    const groups = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      noDueDate: [],
    };

    tasks.forEach((task) => {
      if (!task.dueDate) {
        groups.noDueDate.push(task);
      } else {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          groups.overdue.push(task);
        } else if (dueDate.getTime() === today.getTime()) {
          groups.today.push(task);
        } else if (dueDate.getTime() === tomorrow.getTime()) {
          groups.tomorrow.push(task);
        } else if (dueDate < thisWeek) {
          groups.thisWeek.push(task);
        } else {
          groups.later.push(task);
        }
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const groupedTasks = groupTasksByDate(upcomingTasks);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Task Manager</h1>
        <p className="text-gray-600">Stay organized and focused</p>
      </div>

      {/* Quick Add - Brain Dump */}
      <div className="mb-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-3">✨ Quick Capture</h2>
        <p className="text-sm mb-4 opacity-90">Got something on your mind? Drop it here!</p>
        <form onSubmit={handleQuickAdd} className="flex gap-3">
          <input
            type="text"
            value={quickAddInput}
            onChange={(e) => setQuickAddInput(e.target.value)}
            placeholder="Type anything... we'll organize it later!"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white text-pink-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="font-semibold text-blue-900">
                  {activeTimer.task?.title || 'Untitled Task'}
                </p>
                <p className="text-sm text-blue-700">Timer running...</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-2xl font-mono font-bold text-blue-900">
                {getTimerDuration()}
              </p>
              <button
                onClick={handleStopTimer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="📅"
          title="Due Today"
          value={stats?.tasks.dueToday || 0}
          color="blue"
          link="/tasks/today"
        />
        <StatCard
          icon="⚠️"
          title="Overdue"
          value={stats?.tasks.overdue || 0}
          color="red"
          link="/tasks/inbox"
        />
        <StatCard
          icon="✅"
          title="Completed This Week"
          value={stats?.tasks.completedThisWeek || 0}
          color="green"
        />
        <StatCard
          icon="🔥"
          title="Current Streak"
          value={stats?.habits.currentStreak || 0}
          subtitle="days"
          color="orange"
          link="/tasks/habits"
        />
      </div>

      {/* My Day Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">☀️ My Day</h2>
          <Link to="/tasks/today" className="text-pink-600 hover:text-pink-700 text-sm">
            View All →
          </Link>
        </div>

        {myDayTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nothing due today! 🎉</p>
            <p className="text-sm text-gray-400">Take it easy or get ahead on tomorrow's tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myDayTasks.slice(0, 5).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
                onStartTimer={handleStartTimer}
              />
            ))}
            {myDayTasks.length > 5 && (
              <Link
                to="/tasks/today"
                className="block text-center py-3 text-pink-600 hover:text-pink-700 text-sm"
              >
                View {myDayTasks.length - 5} more task{myDayTasks.length - 5 !== 1 ? 's' : ''}...
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Tasks */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">📋 Upcoming</h2>
          <Link to="/tasks/inbox" className="text-pink-600 hover:text-pink-700 text-sm">
            View All →
          </Link>
        </div>

        <div className="space-y-6">
          {groupedTasks.overdue.length > 0 && (
            <TaskGroup
              title="Overdue"
              icon="⚠️"
              color="red"
              tasks={groupedTasks.overdue}
              onComplete={handleCompleteTask}
              onStartTimer={handleStartTimer}
            />
          )}

          {groupedTasks.tomorrow.length > 0 && (
            <TaskGroup
              title="Tomorrow"
              icon="🌅"
              color="blue"
              tasks={groupedTasks.tomorrow}
              onComplete={handleCompleteTask}
              onStartTimer={handleStartTimer}
            />
          )}

          {groupedTasks.thisWeek.length > 0 && (
            <TaskGroup
              title="This Week"
              icon="📆"
              color="purple"
              tasks={groupedTasks.thisWeek}
              onComplete={handleCompleteTask}
              onStartTimer={handleStartTimer}
            />
          )}

          {groupedTasks.later.length > 0 && (
            <TaskGroup
              title="Later"
              icon="🔮"
              color="gray"
              tasks={groupedTasks.later}
              onComplete={handleCompleteTask}
              onStartTimer={handleStartTimer}
            />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction icon="📥" text="Inbox" link="/tasks/inbox" />
          <QuickAction icon="📁" text="Projects" link="/tasks/projects" />
          <QuickAction icon="🎯" text="Habits" link="/tasks/habits" />
          <QuickAction icon="🏆" text="Goals" link="/tasks/goals" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color, link }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  const content = (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-sm mb-1 opacity-90">{title}</h3>
      <p className="text-3xl font-bold">
        {value} {subtitle && <span className="text-lg">{subtitle}</span>}
      </p>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

function TaskItem({ task, onComplete, onStartTimer }) {
  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: { color: 'bg-red-100 text-red-800', text: '🔥 Urgent' },
      high: { color: 'bg-orange-100 text-orange-800', text: 'High' },
      medium: { color: 'bg-blue-100 text-blue-800', text: 'Medium' },
      low: { color: 'bg-gray-100 text-gray-800', text: 'Low' },
    };
    return badges[priority] || badges.medium;
  };

  const badge = getPriorityBadge(task.priority);

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
      <button
        onClick={() => onComplete(task.id)}
        className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-pink-600 hover:bg-pink-50 transition-colors flex items-center justify-center"
      >
        {task.completed && <span className="text-pink-600">✓</span>}
      </button>

      <div className="flex-1">
        <Link to={`/tasks/${task.id}`} className="block">
          <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </p>
          {task.project && (
            <p className="text-xs text-gray-500 mt-1">
              📁 {task.project.name}
            </p>
          )}
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {task.priority !== 'medium' && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
            {badge.text}
          </span>
        )}
        {!task.completed && (
          <button
            onClick={() => onStartTimer(task)}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-pink-600 transition-opacity"
            title="Start timer"
          >
            ⏱️
          </button>
        )}
      </div>
    </div>
  );
}

function TaskGroup({ title, icon, color, tasks, onComplete, onStartTimer }) {
  const colorClasses = {
    red: 'text-red-600 bg-red-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    gray: 'text-gray-600 bg-gray-50',
  };

  return (
    <div>
      <h3 className={`text-sm font-semibold mb-2 ${colorClasses[color].split(' ')[0]}`}>
        {icon} {title} ({tasks.length})
      </h3>
      <div className="space-y-2">
        {tasks.slice(0, 3).map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={onComplete}
            onStartTimer={onStartTimer}
          />
        ))}
        {tasks.length > 3 && (
          <p className="text-xs text-gray-500 text-center py-2">
            + {tasks.length - 3} more task{tasks.length - 3 !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

function QuickAction({ icon, text, link }) {
  return (
    <Link
      to={link}
      className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-center">{text}</span>
    </Link>
  );
}

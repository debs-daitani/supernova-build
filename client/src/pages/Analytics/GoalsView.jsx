/**
 * Goals View
 * Create and track custom goals
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GoalsView() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/goals');
      const data = await response.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (goalId) => {
    if (!confirm('Delete this goal?')) return;

    try {
      await fetch(`/api/analytics/goals/${goalId}`, {
        method: 'DELETE'
      });
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  // Separate active and completed goals
  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

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
            <h1 className="text-3xl font-bold">Goals & Targets</h1>
            <p className="text-gray-400 mt-1">Set and track your business objectives</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 px-6 py-3 rounded hover:bg-orange-600"
          >
            Create Goal
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2">No Goals Yet</h2>
            <p className="text-gray-400 mb-6">Create your first goal to track progress toward your targets</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 px-6 py-3 rounded hover:bg-orange-600"
            >
              Create Goal
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Active Goals ({activeGoals.length})</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeGoals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} onDelete={deleteGoal} onUpdate={loadGoals} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-green-400">Completed Goals ({completedGoals.length})</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {completedGoals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} onDelete={deleteGoal} onUpdate={loadGoals} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadGoals();
          }}
        />
      )}
    </div>
  );
}

function GoalCard({ goal, onDelete, onUpdate }) {
  const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
  const isCompleted = goal.isCompleted;

  // Calculate days remaining
  let daysRemaining = null;
  if (goal.endDate && !isCompleted) {
    const end = new Date(goal.endDate);
    const now = new Date();
    const diff = end - now;
    daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border-2 ${
      isCompleted ? 'border-green-500' : 'border-gray-700'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1">{goal.name}</h3>
          {goal.description && (
            <p className="text-sm text-gray-400">{goal.description}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-red-400 hover:text-red-300 p-2"
        >
          🗑️
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Progress</span>
          <span className="font-bold">
            {formatMetricValue(goal.currentValue, goal.targetMetric)} / {formatMetricValue(goal.targetValue, goal.targetMetric)}
          </span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-orange-500'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className={`font-bold ${isCompleted ? 'text-green-400' : 'text-orange-400'}`}>
            {progress.toFixed(1)}%
          </span>
          {isCompleted && (
            <span className="text-sm text-green-400">
              ✓ Completed {new Date(goal.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Time remaining */}
      {daysRemaining !== null && (
        <div className="text-sm text-gray-400">
          {daysRemaining > 0 ? (
            <span>⏰ {daysRemaining} days remaining</span>
          ) : (
            <span className="text-red-400">⚠️ Deadline passed</span>
          )}
        </div>
      )}

      {/* Milestones */}
      {goal.alertOnMilestone && !isCompleted && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map(milestone => {
            const reached = progress >= milestone;
            return (
              <div
                key={milestone}
                className={`text-center py-1 rounded text-xs ${
                  reached ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {milestone}%
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateGoalModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetMetric, setTargetMetric] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [endDate, setEndDate] = useState('');
  const [alertOnComplete, setAlertOnComplete] = useState(true);
  const [alertOnMilestone, setAlertOnMilestone] = useState(false);
  const [saving, setSaving] = useState(false);

  const COMMON_METRICS = [
    { value: 'revenue', label: 'Revenue ($)' },
    { value: 'subscribers', label: 'Email Subscribers' },
    { value: 'sales', label: 'Product Sales' },
    { value: 'users', label: 'Active Users' },
    { value: 'course_completions', label: 'Course Completions' },
    { value: 'page_views', label: 'Page Views' },
    { value: 'conversions', label: 'Conversions' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await fetch('/api/analytics/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          targetMetric,
          targetValue: parseFloat(targetValue),
          endDate: endDate || null,
          alertOnComplete,
          alertOnMilestone
        })
      });

      const data = await response.json();

      if (data.success) {
        onCreated();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-xl w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Create Goal</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Goal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Reach 1000 Email Subscribers"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this goal represent?"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Metric</label>
              <select
                value={targetMetric}
                onChange={(e) => setTargetMetric(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                required
              >
                <option value="">Select metric...</option>
                {COMMON_METRICS.map(metric => (
                  <option key={metric.value} value={metric.value}>
                    {metric.label}
                  </option>
                ))}
                <option value="custom">Custom Metric</option>
              </select>
            </div>

            {targetMetric === 'custom' && (
              <div>
                <label className="block text-sm font-bold mb-2">Custom Metric Name</label>
                <input
                  type="text"
                  value={targetMetric}
                  onChange={(e) => setTargetMetric(e.target.value)}
                  placeholder="e.g., blog_posts_published"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-2">Target Value</label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g., 1000"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                required
                min="0"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Deadline (optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={alertOnComplete}
                  onChange={(e) => setAlertOnComplete(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Alert me when goal is completed</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={alertOnMilestone}
                  onChange={(e) => setAlertOnMilestone(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Alert me at milestones (25%, 50%, 75%)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-orange-500 py-3 rounded font-bold hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Goal'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 bg-gray-700 py-3 rounded font-bold hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function formatMetricValue(value, metric) {
  if (metric === 'revenue') {
    return `$${value.toLocaleString()}`;
  }
  return value.toLocaleString();
}

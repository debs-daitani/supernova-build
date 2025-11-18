import { useState, useEffect } from 'react';
import { goals as goalsApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState('in_progress'); // in_progress, completed, all
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    loadGoals();
  }, [filter]);

  const loadGoals = async () => {
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const response = await goalsApi.list(params);
      setGoals(response.data);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await goalsApi.create(data);
      toast.success('Goal created! Let\'s make it happen! 🎯');
      setShowCreateModal(false);
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    }
  };

  const handleUpdate = async (goalId, data) => {
    try {
      const response = await goalsApi.update(goalId, data);

      // Check if goal was just completed
      if (response.data.status === 'completed' && data.status !== 'completed') {
        toast.success('🎉 Goal achieved! Congratulations!', { duration: 5000 });
      }

      setEditingGoal(null);
      loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const handleDelete = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalsApi.delete(goalId);
      toast.success('Goal deleted');
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === 'in_progress');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🏆 Goals</h1>
        <p className="text-gray-600">Set ambitious targets and track your progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon="🎯"
          title="Active Goals"
          value={activeGoals.length}
          color="from-blue-500 to-purple-600"
        />
        <StatCard
          icon="✅"
          title="Completed"
          value={completedGoals.length}
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          icon="📈"
          title="Avg Progress"
          value={`${
            activeGoals.length > 0
              ? Math.round(
                  activeGoals.reduce((sum, g) => sum + getProgress(g), 0) / activeGoals.length
                )
              : 0
          }%`}
          color="from-orange-500 to-pink-600"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setFilter('in_progress')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              filter === 'in_progress'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎯 In Progress ({activeGoals.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              filter === 'completed'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✅ Completed ({completedGoals.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              filter === 'all'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 All ({goals.length})
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {filter === 'in_progress' && '🎯 Active Goals'}
            {filter === 'completed' && '✅ Achieved Goals'}
            {filter === 'all' && '📋 All Goals'}
          </h2>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            + New Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {filter === 'completed'
                ? 'No completed goals yet'
                : 'No goals yet'}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Set your first goal and start tracking your progress!
            </p>
            {filter !== 'completed' && (
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Set Your First Goal
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onEdit={() => setEditingGoal(goal)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <GoalModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
      )}

      {editingGoal && (
        <GoalModal
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
          onSave={(data) => handleUpdate(editingGoal.id, data)}
        />
      )}
    </div>
  );
}

function getProgress(goal) {
  if (!goal.targetValue || goal.targetValue === 0) return 0;
  const progress = (goal.currentValue / goal.targetValue) * 100;
  return Math.min(Math.round(progress), 100);
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-lg shadow-md p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-sm mb-1 opacity-90">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function GoalCard({ goal, onUpdate, onDelete, onEdit }) {
  const [showUpdateProgress, setShowUpdateProgress] = useState(false);
  const [newValue, setNewValue] = useState(goal.currentValue.toString());

  const progress = getProgress(goal);
  const daysRemaining = Math.ceil(
    (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const daysTotal = Math.ceil(
    (new Date(goal.targetDate) - new Date(goal.startDate)) / (1000 * 60 * 60 * 24)
  );
  const daysPassed = daysTotal - daysRemaining;

  const getGoalIcon = (type) => {
    const icons = {
      revenue: '💰',
      customers: '👥',
      weight: '⚖️',
      custom: '🎯',
    };
    return icons[type] || '🎯';
  };

  const handleUpdateProgress = () => {
    const value = parseFloat(newValue);
    if (isNaN(value)) {
      toast.error('Please enter a valid number');
      return;
    }

    onUpdate(goal.id, { currentValue: value });
    setShowUpdateProgress(false);
  };

  const getProgressColor = () => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const isOverdue = new Date(goal.targetDate) < new Date() && goal.status !== 'completed';

  return (
    <div className={`bg-gray-50 rounded-lg p-6 border-l-4 ${
      goal.status === 'completed'
        ? 'border-green-500'
        : isOverdue
        ? 'border-red-500'
        : 'border-blue-500'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-3xl">{getGoalIcon(goal.goalType)}</span>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{goal.title}</h3>
            {goal.description && (
              <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-blue-600 transition-colors p-2"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-2"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {goal.currentValue.toLocaleString()} {goal.unit} of {goal.targetValue.toLocaleString()} {goal.unit}
          </span>
          <span className="text-sm font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>
          📅 {new Date(goal.startDate).toLocaleDateString()} →{' '}
          {new Date(goal.targetDate).toLocaleDateString()}
        </span>
        {goal.status === 'completed' ? (
          <span className="text-green-600 font-medium">
            ✅ Achieved {goal.achievedAt && `on ${new Date(goal.achievedAt).toLocaleDateString()}`}
          </span>
        ) : isOverdue ? (
          <span className="text-red-600 font-medium">⚠️ Overdue by {Math.abs(daysRemaining)} days</span>
        ) : (
          <span>{daysRemaining} days remaining</span>
        )}
      </div>

      {/* Actions */}
      {goal.status !== 'completed' && (
        <div className="flex gap-3">
          {showUpdateProgress ? (
            <div className="flex gap-2 flex-1">
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="input flex-1"
                placeholder={`Current: ${goal.currentValue}`}
                step="any"
              />
              <button onClick={handleUpdateProgress} className="btn-primary px-4">
                Save
              </button>
              <button
                onClick={() => {
                  setShowUpdateProgress(false);
                  setNewValue(goal.currentValue.toString());
                }}
                className="btn-secondary px-4"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowUpdateProgress(true)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📊 Update Progress
              </button>
              {progress >= 100 && (
                <button
                  onClick={() => onUpdate(goal.id, { status: 'completed' })}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  ✅ Mark Complete
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Motivational Message */}
      {goal.status === 'in_progress' && (
        <>
          {progress >= 75 && (
            <p className="text-xs text-center text-green-600 mt-3 font-medium">
              Almost there! You're so close! 🎯
            </p>
          )}
          {progress >= 50 && progress < 75 && (
            <p className="text-xs text-center text-blue-600 mt-3 font-medium">
              Halfway there! Keep pushing forward! 💪
            </p>
          )}
          {progress >= 25 && progress < 50 && (
            <p className="text-xs text-center text-yellow-600 mt-3 font-medium">
              Making solid progress! Stay consistent! 🚀
            </p>
          )}
          {progress < 25 && daysPassed > daysTotal * 0.5 && (
            <p className="text-xs text-center text-orange-600 mt-3 font-medium">
              Time to pick up the pace! You've got this! ⚡
            </p>
          )}
        </>
      )}
    </div>
  );
}

function GoalModal({ goal, onClose, onSave }) {
  const [formData, setFormData] = useState(
    goal || {
      title: '',
      description: '',
      goalType: 'custom',
      targetValue: '',
      currentValue: '0',
      unit: '',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: '',
    }
  );

  const GOAL_TYPES = [
    { value: 'revenue', label: '💰 Revenue', unit: '£' },
    { value: 'customers', label: '👥 Customers', unit: 'customers' },
    { value: 'weight', label: '⚖️ Weight', unit: 'kg' },
    { value: 'custom', label: '🎯 Custom', unit: '' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      targetValue: parseFloat(formData.targetValue),
      currentValue: parseFloat(formData.currentValue),
    };

    onSave(data);
  };

  const handleTypeChange = (type) => {
    const typeConfig = GOAL_TYPES.find((t) => t.value === type);
    setFormData({
      ...formData,
      goalType: type,
      unit: typeConfig?.unit || formData.unit,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{goal ? 'Edit Goal' : 'Create New Goal'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Goal Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input w-full"
              placeholder="e.g., Reach £10,000 monthly revenue"
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
              placeholder="Why is this goal important?"
            />
          </div>

          <div>
            <label className="label">Goal Type</label>
            <select
              value={formData.goalType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="input w-full"
            >
              {GOAL_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Target Value</label>
              <input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                className="input w-full"
                step="any"
                required
              />
            </div>

            <div>
              <label className="label">Current Value</label>
              <input
                type="number"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                className="input w-full"
                step="any"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Unit</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="input w-full"
              placeholder="£, kg, customers, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="label">Target Date</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="input w-full"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

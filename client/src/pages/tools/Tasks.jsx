import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { crmTasks, crmContacts } from '../../services/api';
import toast from 'react-hot-toast';

export default function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed, overdue
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowCreateModal(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const params = {};
      if (filter === 'pending') params.status = 'pending';
      if (filter === 'completed') params.status = 'completed';
      if (filter === 'overdue') params.overdue = 'true';

      const [tasksRes, contactsRes] = await Promise.all([
        crmTasks.list(params),
        crmContacts.list(),
      ]);

      setTasks(tasksRes.data);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await crmTasks.complete(taskId);
      toast.success('Task completed!');
      loadData();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await crmTasks.delete(taskId);
      toast.success('Task deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', icon: '📋', color: 'bg-gray-100' },
    { value: 'pending', label: 'Pending', icon: '⏳', color: 'bg-blue-100' },
    { value: 'overdue', label: 'Overdue', icon: '⚠️', color: 'bg-red-100' },
    { value: 'completed', label: 'Completed', icon: '✅', color: 'bg-green-100' },
  ];

  const getTasksByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() + 7);

    const grouped = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      noDueDate: [],
    };

    tasks.forEach(task => {
      if (task.status === 'completed') return;

      if (!task.dueDate) {
        grouped.noDueDate.push(task);
        return;
      }

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        grouped.overdue.push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        grouped.today.push(task);
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        grouped.tomorrow.push(task);
      } else if (dueDate <= thisWeek) {
        grouped.thisWeek.push(task);
      } else {
        grouped.later.push(task);
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const groupedTasks = getTasksByDate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-gray-600">Manage your tasks and reminders</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span>➕</span>
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filterOptions.map((option) => {
          const count = option.value === 'all'
            ? tasks.length
            : tasks.filter(t => {
                if (option.value === 'pending') return t.status === 'pending';
                if (option.value === 'completed') return t.status === 'completed';
                if (option.value === 'overdue') {
                  return t.status === 'pending' && t.dueDate && new Date(t.dueDate) < new Date();
                }
                return true;
              }).length;

          return (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === option.value
                  ? 'bg-pink-600 text-white'
                  : `${option.color} text-gray-700 hover:bg-pink-100`
              }`}
            >
              {option.icon} {option.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No tasks found</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            Create Your First Task
          </button>
        </div>
      ) : filter === 'completed' ? (
        <CompletedTasksList tasks={tasks} contacts={contacts} onDelete={handleDelete} />
      ) : (
        <div className="space-y-6">
          {groupedTasks.overdue.length > 0 && (
            <TaskGroup
              title="⚠️ Overdue"
              tasks={groupedTasks.overdue}
              contacts={contacts}
              onComplete={handleComplete}
              onDelete={handleDelete}
              urgent
            />
          )}
          {groupedTasks.today.length > 0 && (
            <TaskGroup
              title="📅 Today"
              tasks={groupedTasks.today}
              contacts={contacts}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          )}
          {groupedTasks.tomorrow.length > 0 && (
            <TaskGroup
              title="🌅 Tomorrow"
              tasks={groupedTasks.tomorrow}
              contacts={contacts}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          )}
          {groupedTasks.thisWeek.length > 0 && (
            <TaskGroup
              title="📆 This Week"
              tasks={groupedTasks.thisWeek}
              contacts={contacts}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          )}
          {groupedTasks.later.length > 0 && (
            <TaskGroup
              title="📅 Later"
              tasks={groupedTasks.later}
              contacts={contacts}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          )}
          {groupedTasks.noDueDate.length > 0 && (
            <TaskGroup
              title="📝 No Due Date"
              tasks={groupedTasks.noDueDate}
              contacts={contacts}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          contacts={contacts}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function TaskGroup({ title, tasks, contacts, onComplete, onDelete, urgent = false }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className={`text-lg font-bold mb-4 ${urgent ? 'text-red-600' : 'text-gray-900'}`}>
        {title} <span className="text-sm font-normal text-gray-500">({tasks.length})</span>
      </h2>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            contacts={contacts}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function TaskItem({ task, contacts, onComplete, onDelete }) {
  const contact = contacts.find(c => c.id === task.contactId);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending';

  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg border ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
    }`}>
      <input
        type="checkbox"
        checked={task.status === 'completed'}
        onChange={() => onComplete(task.id)}
        className="mt-1 h-5 w-5 text-pink-600 rounded"
      />
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{task.title}</h4>
        {task.description && (
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          {task.dueDate && (
            <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
              📅 {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {contact && (
            <span>
              👤 {contact.firstName} {contact.lastName}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-400 hover:text-red-600 transition-colors"
      >
        🗑️
      </button>
    </div>
  );
}

function CompletedTasksList({ tasks, contacts, onDelete }) {
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold mb-4 text-green-600">
        ✅ Completed Tasks ({completedTasks.length})
      </h2>
      <div className="space-y-3">
        {completedTasks.map((task) => {
          const contact = contacts.find(c => c.id === task.contactId);
          return (
            <div key={task.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50 opacity-60">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="mt-1 h-5 w-5 text-green-600 rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-700 line-through">{task.title}</h4>
                {task.completedAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Completed {new Date(task.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => onDelete(task.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                🗑️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CreateTaskModal({ contacts, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    contactId: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Please enter a task title');
      return;
    }

    setSaving(true);
    try {
      await crmTasks.create({
        ...formData,
        contactId: formData.contactId || null,
        dueDate: formData.dueDate || null,
      });
      toast.success('Task created!');
      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Create New Task</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Task Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Follow up with client"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="input w-full"
                placeholder="Add more details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Contact (Optional)</label>
                <select
                  value={formData.contactId}
                  onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                  className="input w-full"
                >
                  <option value="">No contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Creating...' : 'Create Task'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

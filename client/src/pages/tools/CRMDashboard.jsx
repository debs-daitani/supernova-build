import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { crmStats, crmActivities, crmTasks } from '../../services/api';
import toast from 'react-hot-toast';

export default function CRMDashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, activitiesRes, tasksRes] = await Promise.all([
        crmStats.get(),
        crmActivities.list({ limit: 5 }),
        crmTasks.list({ status: 'pending', limit: 5 })
      ]);

      setStats(statsRes.data);
      setRecentActivities(activitiesRes.data);
      setUpcomingTasks(tasksRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CRM Dashboard</h1>
        <p className="text-gray-600">Manage your contacts, deals, and sales pipeline</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="👥"
          title="Total Contacts"
          value={stats?.totalContacts || 0}
          subtitle={`${stats?.contactsByStatus?.lead || 0} leads`}
          link="/tools/crm/contacts"
        />
        <StatCard
          icon="💼"
          title="Active Deals"
          value={stats?.totalDeals || 0}
          subtitle={`£${(stats?.totalDealValue || 0).toLocaleString()}`}
          link="/tools/crm/pipeline"
        />
        <StatCard
          icon="✅"
          title="Open Tasks"
          value={stats?.pendingTasks || 0}
          subtitle={`${stats?.overdueTasks || 0} overdue`}
          link="/tools/crm/tasks"
        />
        <StatCard
          icon="🎯"
          title="Conversion Rate"
          value={`${stats?.conversionRate || 0}%`}
          subtitle="This month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Activities</h2>
            <Link to="/tools/crm/contacts" className="text-pink-600 hover:text-pink-700 text-sm">
              View All →
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activities</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Upcoming Tasks</h2>
            <Link to="/tools/crm/tasks" className="text-pink-600 hover:text-pink-700 text-sm">
              View All →
            </Link>
          </div>

          {upcomingTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming tasks</p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <TaskItem key={task.id} task={task} onComplete={loadDashboard} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction icon="➕" text="Add Contact" link="/tools/crm/contacts?action=new" />
          <QuickAction icon="💼" text="New Deal" link="/tools/crm/pipeline?action=new" />
          <QuickAction icon="✅" text="Add Task" link="/tools/crm/tasks?action=new" />
          <QuickAction icon="📊" text="View Reports" link="/tools/crm/contacts" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, link }) {
  const content = (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

function ActivityItem({ activity }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'contact_created': return '👤';
      case 'deal_created': return '💼';
      case 'task_created': return '✅';
      case 'email_sent': return '📧';
      case 'call_made': return '📞';
      case 'meeting_scheduled': return '📅';
      default: return '📝';
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-xl">{getActivityIcon(activity.type)}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{activity.title}</p>
        {activity.description && (
          <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.createdAt)}</p>
      </div>
    </div>
  );
}

function TaskItem({ task, onComplete }) {
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await crmTasks.complete(task.id);
      toast.success('Task completed!');
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    } finally {
      setCompleting(false);
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <input
        type="checkbox"
        checked={false}
        onChange={handleComplete}
        disabled={completing}
        className="mt-1 h-4 w-4 text-pink-600 rounded"
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{task.title}</p>
        {task.dueDate && (
          <p className={`text-xs mt-1 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
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

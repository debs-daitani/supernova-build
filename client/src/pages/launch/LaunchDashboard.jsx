import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { launches } from '../../services/api';

export default function LaunchDashboard() {
  const [loading, setLoading] = useState(true);
  const [launchesList, setLaunchesList] = useState([]);

  useEffect(() => {
    loadLaunches();
  }, []);

  const loadLaunches = async () => {
    try {
      const data = await launches.list();
      setLaunchesList(data);
    } catch (error) {
      console.error('Failed to load launches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      planning: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-400', label: 'Planning' },
      pre_launch: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-400', label: 'Pre-Launch' },
      launched: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-400', label: 'Launched' },
      post_launch: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-400', label: 'Post-Launch' },
    };

    return badges[status] || badges.planning;
  };

  const getTypeIcon = (type) => {
    const icons = {
      product: '📦',
      service: '🛠️',
      course: '🎓',
      book: '📚',
      event: '🎫',
      business: '💼',
    };

    return icons[type] || '🚀';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">🚀</div>
            <p className="text-orange-300">Loading your launches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🚀 Launch Planner</h1>
              <p className="text-orange-200">Plan and execute successful launches</p>
            </div>
            <Link
              to="/launch/create"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
            >
              + New Launch
            </Link>
          </div>
        </div>

        {/* Active Launches */}
        {launchesList.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <p className="text-6xl mb-4">🎯</p>
            <h3 className="text-white text-2xl font-bold mb-2">No launches yet</h3>
            <p className="text-orange-300 mb-6">
              Create your first launch plan to get started!
            </p>
            <Link
              to="/launch/create"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Create Your First Launch
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {launchesList.map(launch => {
              const statusBadge = getStatusBadge(launch.status);
              const progress = launch.totalTasks > 0
                ? Math.round((launch.completedTasks / launch.totalTasks) * 100)
                : 0;

              return (
                <Link
                  key={launch.id}
                  to={`/launch/${launch.id}`}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-orange-400/50 transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-4xl">{getTypeIcon(launch.launchType)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-xl font-bold group-hover:text-orange-300 transition-colors truncate">
                          {launch.name}
                        </h3>
                        <p className="text-orange-300 text-sm capitalize">{launch.launchType}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Description */}
                  {launch.description && (
                    <p className="text-orange-200 text-sm mb-4 line-clamp-2">{launch.description}</p>
                  )}

                  {/* Launch Date */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-orange-300">Launch Date:</span>
                      <span className="text-white font-semibold">{formatDate(launch.launchDate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-300">Days Until Launch:</span>
                      <span className={`font-semibold ${
                        launch.daysUntilLaunch < 0
                          ? 'text-gray-400'
                          : launch.daysUntilLaunch <= 7
                          ? 'text-red-300'
                          : launch.daysUntilLaunch <= 30
                          ? 'text-yellow-300'
                          : 'text-green-300'
                      }`}>
                        {launch.daysUntilLaunch < 0
                          ? `${Math.abs(launch.daysUntilLaunch)} days ago`
                          : `${launch.daysUntilLaunch} days`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-orange-300">Progress</span>
                      <span className="text-white font-semibold">
                        {launch.completedTasks}/{launch.totalTasks} tasks
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-orange-300 text-xs mb-1">Waitlist</p>
                      <p className="text-white text-xl font-bold">{launch.waitlistCount}</p>
                    </div>
                    <div>
                      <p className="text-orange-300 text-xs mb-1">Completion</p>
                      <p className="text-white text-xl font-bold">{progress}%</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-orange-500/10 backdrop-blur-lg rounded-xl p-6 border border-orange-400/20">
          <h3 className="text-white font-bold mb-3">💡 Launch Success Tips</h3>
          <ul className="space-y-2 text-orange-200 text-sm">
            <li>• Start building your waitlist at least 60 days before launch</li>
            <li>• Create a content calendar for pre-launch hype building</li>
            <li>• Test all technical aspects (payment, delivery, etc.) 1 week before</li>
            <li>• Have a launch day schedule with specific times for each action</li>
            <li>• Follow up with non-buyers within 48 hours of launch</li>
            <li>• Collect testimonials immediately from early customers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

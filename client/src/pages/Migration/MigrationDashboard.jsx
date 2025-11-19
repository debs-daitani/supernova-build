/**
 * Migration Dashboard
 * View and manage all platform migrations
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PLATFORM_INFO = {
  WIX: { name: 'Wix', icon: '🌐', color: 'blue' },
  SHOPIFY: { name: 'Shopify', icon: '🛍️', color: 'green' },
  WORDPRESS: { name: 'WordPress', icon: '📝', color: 'blue' },
  SQUARESPACE: { name: 'Squarespace', icon: '⬛', color: 'gray' },
  KAJABI: { name: 'Kajabi', icon: '🎓', color: 'purple' },
  TEACHABLE: { name: 'Teachable', icon: '📚', color: 'orange' },
  MAILCHIMP: { name: 'Mailchimp', icon: '✉️', color: 'yellow' },
  CONVERTKIT: { name: 'ConvertKit', icon: '📧', color: 'pink' },
  WEBFLOW: { name: 'Webflow', icon: '🌊', color: 'blue' },
  GHOST: { name: 'Ghost', icon: '👻', color: 'gray' },
  MEDIUM: { name: 'Medium', icon: 'Ⓜ️', color: 'green' },
  SUBSTACK: { name: 'Substack', icon: '📰', color: 'orange' },
  CARRD: { name: 'Carrd', icon: '🃏', color: 'purple' },
  OTHER: { name: 'Other', icon: '📦', color: 'gray' }
};

export default function MigrationDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform-migration/projects');
      const data = await response.json();

      setProjects(data.projects || []);
      setError(null);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load migration projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-gray-100 text-gray-700',
      CONNECTING: 'bg-blue-100 text-blue-700',
      ANALYZING: 'bg-purple-100 text-purple-700',
      MAPPING: 'bg-yellow-100 text-yellow-700',
      READY: 'bg-green-100 text-green-700',
      IN_PROGRESS: 'bg-orange-100 text-orange-700',
      PAUSED: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      COMPLETED_WITH_ERRORS: 'bg-orange-100 text-orange-700',
      FAILED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: '⏸️',
      CONNECTING: '🔗',
      ANALYZING: '🔍',
      MAPPING: '🗺️',
      READY: '✅',
      IN_PROGRESS: '⚙️',
      PAUSED: '⏸️',
      COMPLETED: '✅',
      COMPLETED_WITH_ERRORS: '⚠️',
      FAILED: '❌',
      CANCELLED: '🚫'
    };
    return icons[status] || '•';
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to cancel this migration project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/platform-migration/${projectId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        loadProjects();
      } else {
        alert('Failed to cancel project');
      }
    } catch (error) {
      console.error('Error cancelling project:', error);
      alert('Error cancelling project');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="animate-pulse text-xl">Loading migrations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Platform Migrations</h1>
          <p className="text-gray-600">
            Import your data from other platforms
          </p>
        </div>
        <button
          onClick={() => navigate('/migration/new')}
          className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg"
        >
          + New Migration
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-r from-orange-100 to-pink-100 border border-orange-200 rounded-lg p-6 mb-8">
        <h3 className="font-bold text-lg mb-2">🚀 Switch Platforms in Minutes</h3>
        <p className="text-gray-700 mb-3">
          Migrate from Wix, Shopify, WordPress, and 10+ other platforms.
          We'll automatically import your products, customers, content, and more.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/migration/new')}
            className="text-orange-600 font-medium hover:underline"
          >
            Start Migration →
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => window.open('/docs/migration', '_blank')}
            className="text-orange-600 font-medium hover:underline"
          >
            View Documentation
          </button>
        </div>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold mb-2">No Migrations Yet</h3>
          <p className="text-gray-600 mb-6">
            Start your first migration to import data from another platform
          </p>
          <button
            onClick={() => navigate('/migration/new')}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg"
          >
            Start First Migration
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Platform</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Project Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Progress</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Items</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Created</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map(project => {
                const platformInfo = PLATFORM_INFO[project.sourcePlatform] || PLATFORM_INFO.OTHER;
                const percentage = project.itemsTotal > 0
                  ? Math.round((project.itemsMigrated / project.itemsTotal) * 100)
                  : 0;

                return (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/migration/${project.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{platformInfo.icon}</span>
                        <span className="font-medium">{platformInfo.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{project.projectName || 'Untitled'}</div>
                      <div className="text-xs text-gray-500">Step {project.currentStep}/7</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span>{getStatusIcon(project.status)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.status === 'IN_PROGRESS' || project.status === 'COMPLETED' || project.status === 'COMPLETED_WITH_ERRORS' ? (
                        <div className="w-full">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-600">{percentage}%</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not started</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">{project.itemsMigrated || 0} / {project.itemsTotal || 0}</div>
                        {project.itemsFailed > 0 && (
                          <div className="text-xs text-red-600">{project.itemsFailed} failed</div>
                        )}
                        {project.itemsSkipped > 0 && (
                          <div className="text-xs text-yellow-600">{project.itemsSkipped} skipped</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {(project.status === 'PENDING' || project.status === 'READY') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/migration/${project.id}`);
                            }}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Continue
                          </button>
                        )}
                        {(project.status === 'COMPLETED' || project.status === 'COMPLETED_WITH_ERRORS') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/migration/${project.id}/report`);
                            }}
                            className="text-green-600 hover:underline text-sm"
                          >
                            Report
                          </button>
                        )}
                        {project.status === 'IN_PROGRESS' && (
                          <span className="text-sm text-gray-500">Running...</span>
                        )}
                        {!['IN_PROGRESS', 'COMPLETED'].includes(project.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Stats */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <StatCard
            label="Total Migrations"
            value={projects.length}
            icon="📦"
            color="blue"
          />
          <StatCard
            label="Completed"
            value={projects.filter(p => p.status === 'COMPLETED').length}
            icon="✅"
            color="green"
          />
          <StatCard
            label="In Progress"
            value={projects.filter(p => p.status === 'IN_PROGRESS').length}
            icon="⚙️"
            color="orange"
          />
          <StatCard
            label="Total Items"
            value={projects.reduce((sum, p) => sum + (p.itemsMigrated || 0), 0)}
            icon="📊"
            color="purple"
          />
        </div>
      )}

      {/* Supported Platforms */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Supported Platforms</h2>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {Object.entries(PLATFORM_INFO).filter(([key]) => key !== 'OTHER').map(([key, platform]) => (
            <div
              key={key}
              className="bg-white rounded-lg shadow p-4 text-center"
            >
              <div className="text-3xl mb-2">{platform.icon}</div>
              <div className="text-sm font-medium">{platform.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-pink-500',
    purple: 'from-purple-500 to-pink-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm opacity-90">{label}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

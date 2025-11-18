import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentStats, contentPosts, savedDesigns, contentIdeas } from '../../services/api';
import toast from 'react-hot-toast';

export default function ContentDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentDesigns, setRecentDesigns] = useState([]);
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, postsRes, designsRes, ideasRes] = await Promise.all([
        contentStats.get(),
        contentPosts.list({ limit: 5 }),
        savedDesigns.list({ limit: 5 }),
        contentIdeas.list({ limit: 5 }),
      ]);

      setStats(statsRes.data);
      setRecentPosts(postsRes.data || []);
      setRecentDesigns(designsRes.data || []);
      setRecentIdeas(ideasRes.data || []);
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
        <h1 className="text-3xl font-bold mb-2">🎨 Content Creation Suite</h1>
        <p className="text-gray-600">Create, schedule, and manage all your content in one place</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <QuickAction
          icon="📝"
          label="Create Post"
          href="/content/planner"
          color="from-blue-500 to-blue-600"
        />
        <QuickAction
          icon="📅"
          label="Calendar"
          href="/content/calendar"
          color="from-green-500 to-green-600"
        />
        <QuickAction
          icon="💡"
          label="Ideas Bank"
          href="/content/ideas"
          color="from-yellow-500 to-yellow-600"
        />
        <QuickAction
          icon="🎨"
          label="Brand Assets"
          href="/content/brand-assets"
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="📊"
          title="Total Posts"
          value={stats?.posts?.total || 0}
          subtitle={`${stats?.posts?.scheduled || 0} scheduled`}
          color="blue"
        />
        <StatCard
          icon="📈"
          title="Published"
          value={stats?.posts?.published || 0}
          subtitle={`${stats?.performance?.average?.reach || 0} avg reach`}
          color="green"
        />
        <StatCard
          icon="🎨"
          title="Designs"
          value={stats?.designs || 0}
          subtitle="saved"
          color="purple"
        />
        <StatCard
          icon="💡"
          title="Ideas"
          value={stats?.ideas || 0}
          subtitle="captured"
          color="yellow"
        />
      </div>

      {/* Next Scheduled */}
      {stats?.nextScheduled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="font-semibold text-blue-900">Next Scheduled Post</p>
              <p className="text-sm text-blue-700">
                Publishing on {new Date(stats.nextScheduled.scheduledFor).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Posts */}
        <Section
          title="📝 Recent Posts"
          viewAllLink="/content/planner"
          emptyMessage="No posts yet"
          items={recentPosts}
          renderItem={(post) => (
            <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-2">{post.caption}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={post.status} />
                  {post.platforms && post.platforms.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {post.platforms.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        />

        {/* Recent Designs */}
        <Section
          title="🎨 Recent Designs"
          viewAllLink="/content/designs"
          emptyMessage="No designs yet"
          items={recentDesigns}
          renderItem={(design) => (
            <div key={design.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {design.thumbnail ? (
                <img
                  src={design.thumbnail}
                  alt={design.name}
                  className="w-16 h-16 rounded object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No preview</span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{design.name}</p>
                <p className="text-xs text-gray-500">
                  {design.width} × {design.height}
                </p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Content Ideas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">💡 Content Ideas</h2>
          <Link to="/content/ideas" className="text-pink-600 hover:text-pink-700 text-sm">
            View All →
          </Link>
        </div>

        {recentIdeas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No ideas yet</p>
            <Link to="/content/ideas" className="btn-primary">
              Start Brainstorming
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentIdeas.map((idea) => (
              <div key={idea.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{idea.title}</p>
                {idea.category && (
                  <span className="text-xs text-gray-500 capitalize">{idea.category}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAction({ icon, label, href, color }) {
  return (
    <Link
      to={href}
      className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br ${color} text-white rounded-lg hover:shadow-lg transition-all`}
    >
      <span className="text-4xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-center">{label}</span>
    </Link>
  );
}

function StatCard({ icon, title, value, subtitle, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg shadow-md p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-sm mb-1 opacity-90">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-sm opacity-80 mt-1">{subtitle}</p>}
    </div>
  );
}

function Section({ title, viewAllLink, emptyMessage, items, renderItem }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link to={viewAllLink} className="text-pink-600 hover:text-pink-700 text-sm">
          View All →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const badges = {
    draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
    scheduled: { color: 'bg-blue-100 text-blue-800', text: 'Scheduled' },
    published: { color: 'bg-green-100 text-green-800', text: 'Published' },
    failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
  };

  const badge = badges[status] || badges.draft;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
      {badge.text}
    </span>
  );
}

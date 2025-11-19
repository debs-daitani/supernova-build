import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoStats, videoScripts, videos } from '../../services/api';

export default function VideoDashboard() {
  const [stats, setStats] = useState(null);
  const [recentScripts, setRecentScripts] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, scriptsData, videosData] = await Promise.all([
        videoStats.get(),
        videoScripts.list({ limit: 5 }),
        videos.list({ limit: 6 }),
      ]);

      setStats(statsData);
      setRecentScripts(scriptsData);
      setRecentVideos(videosData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎬 Video Tools Suite</h1>
          <p className="text-purple-200">Create, optimize, and manage your video content</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <QuickAction icon="📝" label="Generate Script" href="/video/script-generator" />
          <QuickAction icon="📹" label="Video Library" href="/video/library" />
          <QuickAction icon="🎯" label="SEO Optimizer" href="/video/seo" />
          <QuickAction icon="📊" label="Analytics" href="/video/analytics" />
          <QuickAction icon="🎞️" label="Stock Videos" href="/video/stock" />
          <QuickAction icon="💬" label="Subtitles" href="/video/subtitles" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="🎬"
            title="Total Videos"
            value={stats?.videos?.total || 0}
            subtitle={`${stats?.videos?.published || 0} published`}
          />
          <StatCard
            icon="📝"
            title="Scripts"
            value={stats?.scripts || 0}
            subtitle="AI-generated"
          />
          <StatCard
            icon="👁️"
            title="Total Views"
            value={formatNumber(stats?.totalViews || 0)}
            subtitle={`${formatNumber(stats?.totalEngagement || 0)} engagements`}
          />
          <StatCard
            icon="🏆"
            title="Top Video"
            value={stats?.bestPerforming?.title ? truncate(stats.bestPerforming.title, 15) : 'N/A'}
            subtitle={stats?.bestPerforming?.views ? `${formatNumber(stats.bestPerforming.views)} views` : ''}
          />
        </div>

        {/* Recent Scripts & Videos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Scripts */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">📝 Recent Scripts</h2>
              <Link
                to="/video/script-generator"
                className="text-purple-300 hover:text-white transition-colors"
              >
                View All →
              </Link>
            </div>

            {recentScripts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-purple-200 mb-4">No scripts yet</p>
                <Link
                  to="/video/script-generator"
                  className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Generate Your First Script
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentScripts.map(script => (
                  <ScriptCard key={script.id} script={script} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Videos */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">🎬 Recent Videos</h2>
              <Link
                to="/video/library"
                className="text-purple-300 hover:text-white transition-colors"
              >
                View All →
              </Link>
            </div>

            {recentVideos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-purple-200 mb-4">No videos yet</p>
                <Link
                  to="/video/library"
                  className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Upload Your First Video
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentVideos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Video Templates Section */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">🎯 Script Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <TemplateCard
              icon="📚"
              name="Tutorial"
              description="Step-by-step guides"
            />
            <TemplateCard
              icon="🛍️"
              name="Product Demo"
              description="Showcase products"
            />
            <TemplateCard
              icon="🎓"
              name="Educational"
              description="Teach concepts"
            />
            <TemplateCard
              icon="📋"
              name="Listicle"
              description="Top X lists"
            />
            <TemplateCard
              icon="💬"
              name="Testimonial"
              description="Customer stories"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, href }) {
  return (
    <Link
      to={href}
      className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-lg p-4 hover:from-purple-500/30 hover:to-pink-500/30 transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2"
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-white text-sm font-medium text-center">{label}</span>
    </Link>
  );
}

function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-purple-200 text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-purple-300 text-xs">{subtitle}</p>}
    </div>
  );
}

function ScriptCard({ script }) {
  const toneColors = {
    professional: 'bg-blue-500/20 text-blue-300',
    casual: 'bg-green-500/20 text-green-300',
    enthusiastic: 'bg-orange-500/20 text-orange-300',
    educational: 'bg-purple-500/20 text-purple-300',
  };

  return (
    <Link
      to={`/video/script-generator?id=${script.id}`}
      className="block bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border border-white/10"
    >
      <h3 className="text-white font-semibold mb-2">{script.title}</h3>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-1 rounded text-xs ${toneColors[script.tone] || 'bg-gray-500/20 text-gray-300'}`}>
          {script.tone}
        </span>
        <span className="text-purple-300 text-xs">
          {script.duration} min
        </span>
        <span className="text-purple-400 text-xs">
          {new Date(script.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}

function VideoCard({ video }) {
  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-300',
    processing: 'bg-yellow-500/20 text-yellow-300',
    ready: 'bg-green-500/20 text-green-300',
    published: 'bg-blue-500/20 text-blue-300',
  };

  return (
    <Link
      to={`/video/library?id=${video.id}`}
      className="block bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border border-white/10"
    >
      <div className="flex gap-3">
        <div className="w-20 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded flex items-center justify-center text-2xl flex-shrink-0">
          {video.thumbnailUrl ? (
            <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover rounded" />
          ) : (
            '🎬'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold mb-1 truncate">{video.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded text-xs ${statusColors[video.status]}`}>
              {video.status}
            </span>
            {video.views > 0 && (
              <span className="text-purple-300 text-xs">
                👁️ {formatNumber(video.views)}
              </span>
            )}
            {video.duration && (
              <span className="text-purple-400 text-xs">
                ⏱️ {formatDuration(video.duration)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function TemplateCard({ icon, name, description }) {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-white font-semibold text-sm mb-1">{name}</h3>
      <p className="text-purple-300 text-xs">{description}</p>
    </div>
  );
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function truncate(str, length) {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

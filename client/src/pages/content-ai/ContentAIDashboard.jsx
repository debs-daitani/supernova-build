import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiContentStats, generatedContent } from '../../services/api';

export default function ContentAIDashboard() {
  const [stats, setStats] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, contentData] = await Promise.all([
        aiContentStats.get(),
        generatedContent.list({ limit: 10 }),
      ]);

      setStats(statsData);
      setRecentContent(contentData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const contentTypeIcons = {
    blog: '📝',
    caption: '📱',
    email: '📧',
    product_desc: '🛍️',
    meta: '🔍',
    landing_page: '🎯',
    ad: '📢',
    repurposed: '🔄',
    improved: '✨',
  };

  const contentTypeNames = {
    blog: 'Blog Post',
    caption: 'Social Caption',
    email: 'Email Subject',
    product_desc: 'Product Description',
    meta: 'Meta Description',
    landing_page: 'Landing Page',
    ad: 'Ad Copy',
    repurposed: 'Repurposed Content',
    improved: 'Improved Content',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">✍️ AI Content Generator</h1>
          <p className="text-indigo-200">Never run out of content ideas again - create everything with AI</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="📊"
            title="Total Generated"
            value={stats?.totalGenerated || 0}
            subtitle="All time"
          />
          <StatCard
            icon="🎯"
            title="This Month"
            value={stats?.thisMonth || 0}
            subtitle="Content pieces"
          />
          <StatCard
            icon="⭐"
            title="Most Used"
            value={contentTypeNames[stats?.mostUsed] || 'N/A'}
            subtitle="Content type"
          />
          <StatCard
            icon="⏱️"
            title="Time Saved"
            value={`${Math.floor((stats?.timeSaved || 0) / 60)}h`}
            subtitle={`${(stats?.timeSaved || 0) % 60}m estimated`}
          />
        </div>

        {/* Quick Generate */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">🚀 Quick Generate</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <GenerateButton icon="📝" label="Blog Post" href="/content-ai/blog" />
            <GenerateButton icon="📱" label="Social Caption" href="/content-ai/caption" />
            <GenerateButton icon="📧" label="Email Subject" href="/content-ai/email" />
            <GenerateButton icon="🛍️" label="Product Desc" href="/content-ai/product" />
            <GenerateButton icon="🔍" label="SEO Meta" href="/content-ai/meta" />
            <GenerateButton icon="🎯" label="Landing Page" href="/content-ai/landing" />
            <GenerateButton icon="📢" label="Ad Copy" href="/content-ai/ad" />
            <GenerateButton icon="🔄" label="Repurpose" href="/content-ai/repurpose" />
            <GenerateButton icon="✨" label="Improve Text" href="/content-ai/assistant" />
            <GenerateButton icon="📋" label="Content Brief" href="/content-ai/brief" />
          </div>
        </div>

        {/* Recent Generations */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📜 Recent Generations</h2>

          {recentContent.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-6xl mb-4">🤖</p>
              <h3 className="text-white text-xl font-bold mb-2">No content generated yet</h3>
              <p className="text-indigo-300 mb-6">Start creating amazing content with AI!</p>
              <Link
                to="/content-ai/blog"
                className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all"
              >
                Generate Your First Content
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentContent.map(content => (
                <ContentCard
                  key={content.id}
                  content={content}
                  icon={contentTypeIcons[content.contentType]}
                  typeName={contentTypeNames[content.contentType]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-indigo-200 text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-indigo-300 text-xs">{subtitle}</p>}
    </div>
  );
}

function GenerateButton({ icon, label, href }) {
  return (
    <Link
      to={href}
      className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg border border-white/20 rounded-lg p-6 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-3"
    >
      <span className="text-4xl">{icon}</span>
      <span className="text-white text-sm font-medium text-center">{label}</span>
    </Link>
  );
}

function ContentCard({ content, icon, typeName }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content.content);
    alert('Copied to clipboard!');
  };

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-200 rounded text-xs font-medium">
              {typeName}
            </span>
            <span className="text-indigo-400 text-xs">
              {new Date(content.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-white font-medium mb-2 line-clamp-2">
            {content.prompt}
          </p>
          <p className="text-indigo-200 text-sm line-clamp-2">
            {content.content}
          </p>
        </div>
        <button
          onClick={copyToClipboard}
          className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded transition-all"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

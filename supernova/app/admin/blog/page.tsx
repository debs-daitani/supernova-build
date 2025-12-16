'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  ArrowLeft,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  publishedAt: string | null;
  createdAt: string;
  viewCount: number;
  author: { id: string; name: string | null; email: string };
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'DRAFT' | 'PUBLISHED' | 'SCHEDULED'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.status === filter;
    const matchesSearch = search === '' ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'PUBLISHED').length,
    drafts: posts.filter(p => p.status === 'DRAFT').length,
    scheduled: posts.filter(p => p.status === 'SCHEDULED').length,
    totalViews: posts.reduce((sum, p) => sum + p.viewCount, 0),
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            <CheckCircle2 size={12} /> Published
          </span>
        );
      case 'DRAFT':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
            <FileText size={12} /> Draft
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
            <Clock size={12} /> Scheduled
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/home" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime">
              Blog Manager
            </h1>
            <p className="text-gray-400 font-josefin mt-2">Create and manage blog posts</p>
          </div>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
          >
            <Plus size={20} /> New Post
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Posts</div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-green-400">{stats.published}</div>
            <div className="text-sm text-gray-400">Published</div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.drafts}</div>
            <div className="text-sm text-gray-400">Drafts</div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.scheduled}</div>
            <div className="text-sm text-gray-400">Scheduled</div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-[#00F0E9]">{stats.totalViews}</div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            {(['all', 'PUBLISHED', 'DRAFT', 'SCHEDULED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-[#00F0E9] text-black'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00F0E9]"
            />
          </div>
        </div>

        {/* Posts List */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-4 text-gray-500" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-gray-400 mb-6">Create your first blog post to get started</p>
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
              >
                <Plus size={20} /> Create Post
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Title</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400 hidden md:table-cell">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400 hidden md:table-cell">Views</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="font-medium text-white">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-sm text-gray-400 truncate max-w-md">{post.excerpt}</div>
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(post.status)}</td>
                    <td className="p-4 text-sm text-gray-400 hidden md:table-cell">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-400 hidden md:table-cell">{post.viewCount}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'PUBLISHED' && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="p-2 text-gray-400 hover:text-[#00F0E9] hover:bg-white/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

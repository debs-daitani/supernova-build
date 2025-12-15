'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string;
  viewCount: number;
  author: { id: string; name: string | null; email: string };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div
        className="relative py-20 px-4"
        style={{
          backgroundImage: 'url("/images/dAitaniverse Stage.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime mb-4">
            The Blog
          </h1>
          <p className="text-xl text-gray-300 font-josefin max-w-2xl mx-auto">
            Real talk about building a business with a variant brain. No corporate bollocks.
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="mx-auto mb-4 text-gray-500" size={64} />
            <h2 className="text-2xl font-semibold text-white mb-2">Coming Soon</h2>
            <p className="text-gray-400">
              The first post is being crafted. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`group block backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-[#00F0E9]/50 hover:shadow-[0_0_30px_rgba(0,240,233,0.2)] transition-all hover:scale-[1.02] ${
                  index === 0 && posts.length > 1 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                {/* Featured Image */}
                {post.featuredImage ? (
                  <div className={`relative overflow-hidden ${index === 0 ? 'h-64' : 'h-48'}`}>
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                ) : (
                  <div
                    className={`relative ${index === 0 ? 'h-64' : 'h-48'} bg-gradient-to-br from-[#FF008E]/20 to-[#00F0E9]/20`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen size={48} className="text-white/20" />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h2
                    className={`font-bold text-white mb-3 group-hover:text-[#00F0E9] transition-colors ${
                      index === 0 ? 'text-2xl' : 'text-xl'
                    }`}
                  >
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {post.author.name || 'Debs'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className="text-[#00F0E9] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="backdrop-blur-xl bg-gradient-to-r from-[#FF008E]/10 to-[#00F0E9]/10 rounded-2xl border border-white/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Want more?</h2>
          <p className="text-gray-400 mb-6">
            Chat with SUPERNova, your AI coach who actually gets it.
          </p>
          <Link
            href="/supernova"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
          >
            Chat with SUPERNova
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Eye, Share2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  author: { id: string; name: string | null; email: string };
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || '',
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
            style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
          >
            <ArrowLeft size={18} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Featured Image */}
      <div className="relative">
        {post.featuredImage ? (
          <div className="h-[50vh] relative">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        ) : (
          <div
            className="h-[40vh] relative"
            style={{
              backgroundImage: 'url("/images/dAitaniverse Stage.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors"
            >
              <ArrowLeft size={16} /> Back to Blog
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <User size={16} />
                {post.author.name || 'Debs'}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <Eye size={16} />
                {post.viewCount} views
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-[#00F0E9] hover:text-white transition-colors"
              >
                <Share2 size={16} />
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div
          className="prose prose-lg prose-invert max-w-none
            [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-6 [&_h1]:mt-12
            [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mb-4 [&_h2]:mt-10
            [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mb-3 [&_h3]:mt-8
            [&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-6
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2
            [&_li]:text-gray-300
            [&_a]:text-[#00F0E9] [&_a]:underline [&_a]:hover:text-[#FF008E] [&_a]:transition-colors
            [&_strong]:text-white [&_strong]:font-semibold
            [&_em]:text-gray-400 [&_em]:italic
            [&_blockquote]:border-l-4 [&_blockquote]:border-[#FF008E] [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-8
            [&_pre]:bg-white/10 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-6
            [&_code]:bg-white/10 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-[#00F0E9] [&_code]:text-sm
            [&_img]:rounded-lg [&_img]:my-8 [&_img]:mx-auto
            [&_hr]:border-white/10 [&_hr]:my-10
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author Bio */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF008E] to-[#00F0E9] flex items-center justify-center text-2xl font-bold text-black">
              {(post.author.name || 'D')[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-white text-lg">{post.author.name || 'Debs'}</div>
              <div className="text-gray-400">Founder, dAItaniverse</div>
            </div>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#00F0E9] hover:text-white transition-colors"
          >
            <ArrowLeft size={18} /> Back to all posts
          </Link>
        </div>
      </article>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="backdrop-blur-xl bg-gradient-to-r from-[#FF008E]/10 to-[#00F0E9]/10 rounded-2xl border border-white/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to dive deeper?</h2>
          <p className="text-gray-400 mb-6">
            Chat with SUPERNova about the topics in this post or explore your own challenges.
          </p>
          <Link
            href="/supernova"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
          >
            Chat with SUPERNova
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { microPosts, microTrending } from '../../services/api';

export default function Timeline() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('for-you');
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 280;

  useEffect(() => {
    loadTimeline();
    loadTrending();
  }, [activeTab]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'for-you' ? microPosts.getForYou : microPosts.getFollowing;
      const res = await endpoint({ limit: 20 });
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrending = async () => {
    try {
      const res = await microTrending.getTrending({ limit: 10 });
      setTrending(res.data.topics || []);
    } catch (error) {
      console.error('Failed to load trending:', error);
    }
  };

  const handleContentChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setPostContent(text);
      setCharCount(text.length);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() || charCount > MAX_CHARS) return;

    try {
      await microPosts.create({ content: postContent });
      setPostContent('');
      setCharCount(0);
      setComposing(false);
      loadTimeline();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleLike = async (post) => {
    try {
      if (post.userLiked) {
        await microPosts.unlike(post.id);
        setPosts(posts.map(p =>
          p.id === post.id
            ? { ...p, userLiked: false, likesCount: p.likesCount - 1 }
            : p
        ));
      } else {
        await microPosts.like(post.id);
        setPosts(posts.map(p =>
          p.id === post.id
            ? { ...p, userLiked: true, likesCount: p.likesCount + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleRepost = async (postId) => {
    try {
      await microPosts.create({ repostOfId: postId });
      loadTimeline();
    } catch (error) {
      console.error('Failed to repost:', error);
    }
  };

  const handleBookmark = async (post) => {
    try {
      if (post.userBookmarked) {
        await microPosts.removeBookmark(post.id);
        setPosts(posts.map(p =>
          p.id === post.id
            ? { ...p, userBookmarked: false, bookmarksCount: p.bookmarksCount - 1 }
            : p
        ));
      } else {
        await microPosts.bookmark(post.id, {});
        setPosts(posts.map(p =>
          p.id === post.id
            ? { ...p, userBookmarked: true, bookmarksCount: p.bookmarksCount + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Failed to bookmark:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(date).toLocaleDateString();
  };

  const renderPost = (post) => {
    // If it's a repost, show original post inside
    const displayPost = post.repostOf || post;
    const isRepost = !!post.repostOf && !post.isQuote;

    return (
      <div key={post.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
        {isRepost && (
          <div className="px-4 pt-3 flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {post.user?.name} reposted
          </div>
        )}

        <div className="p-4">
          <div className="flex space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {displayPost.user?.name?.charAt(0) || 'U'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/micro/profile/${displayPost.user?.id}`)}
                  className="font-bold text-gray-900 hover:underline"
                >
                  {displayPost.user?.name}
                </button>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500 text-sm">{formatTimeAgo(displayPost.createdAt)}</span>
              </div>

              {/* Reply indicator */}
              {displayPost.replyTo && (
                <p className="text-sm text-gray-500 mt-1">
                  Replying to <span className="text-blue-500">@{displayPost.replyTo.user?.name}</span>
                </p>
              )}

              {/* Quote repost - show content above original post */}
              {post.isQuote && post.content && (
                <p className="mt-2 text-gray-900 whitespace-pre-wrap">{post.content}</p>
              )}

              {/* Post content */}
              {(!isRepost || post.isQuote) && displayPost.content && (
                <p className={`${post.isQuote ? 'mt-2 p-3 border border-gray-300 rounded-lg' : 'mt-2'} text-gray-900 whitespace-pre-wrap`}>
                  {displayPost.content}
                </p>
              )}

              {/* Regular repost - show content */}
              {isRepost && displayPost.content && (
                <p className="mt-2 text-gray-900 whitespace-pre-wrap">{displayPost.content}</p>
              )}

              {/* Media */}
              {displayPost.mediaUrls && displayPost.mediaUrls.length > 0 && (
                <div className={`mt-3 ${displayPost.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid grid-cols-2'} gap-2 rounded-lg overflow-hidden`}>
                  {displayPost.mediaUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Post media"
                      className="w-full h-auto object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}

              {/* Poll */}
              {displayPost.pollOptions && (
                <div className="mt-3 space-y-2">
                  {displayPost.pollOptions.map((option, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Thread indicator */}
              {displayPost.isThread && (
                <button
                  onClick={() => navigate(`/micro/thread/${displayPost.threadId}`)}
                  className="mt-2 text-blue-500 text-sm hover:underline"
                >
                  Show this thread
                </button>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 max-w-md">
                <button
                  onClick={() => navigate(`/micro/post/${displayPost.id}`)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 group"
                >
                  <div className="p-2 rounded-full group-hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-sm">{formatNumber(displayPost.repliesCount)}</span>
                </button>

                <button
                  onClick={() => handleRepost(displayPost.id)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-green-500 group"
                >
                  <div className="p-2 rounded-full group-hover:bg-green-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="text-sm">{formatNumber(displayPost.repostsCount)}</span>
                </button>

                <button
                  onClick={() => handleLike(post)}
                  className={`flex items-center space-x-2 group ${
                    post.userLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <div className={`p-2 rounded-full ${post.userLiked ? 'bg-red-50' : 'group-hover:bg-red-50'}`}>
                    <svg className={`w-5 h-5 ${post.userLiked ? 'fill-current' : ''}`} fill={post.userLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-sm">{formatNumber(displayPost.likesCount)}</span>
                </button>

                <button
                  onClick={() => handleBookmark(post)}
                  className={`flex items-center space-x-2 group ${
                    post.userBookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  <div className={`p-2 rounded-full ${post.userBookmarked ? 'bg-blue-50' : 'group-hover:bg-blue-50'}`}>
                    <svg className={`w-5 h-5 ${post.userBookmarked ? 'fill-current' : ''}`} fill={post.userBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                </button>

                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 group">
                  <div className="p-2 rounded-full group-hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-gray-200 min-h-screen sticky top-0 p-4">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-2xl font-bold text-blue-500 mb-8"
            >
              🐦 SupernovaMicro
            </button>

            <button
              onClick={() => setActiveTab('for-you')}
              className={`w-full flex items-center space-x-4 px-4 py-3 rounded-full text-xl ${
                activeTab === 'for-you' ? 'font-bold' : 'font-normal'
              } hover:bg-gray-100`}
            >
              <span>🏠</span>
              <span>Home</span>
            </button>

            <button
              onClick={() => navigate('/micro/explore')}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-full text-xl hover:bg-gray-100"
            >
              <span>🔍</span>
              <span>Explore</span>
            </button>

            <button
              onClick={() => navigate('/micro/bookmarks')}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-full text-xl hover:bg-gray-100"
            >
              <span>🔖</span>
              <span>Bookmarks</span>
            </button>

            <button
              onClick={() => navigate('/micro/lists')}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-full text-xl hover:bg-gray-100"
            >
              <span>📋</span>
              <span>Lists</span>
            </button>

            <button
              onClick={() => navigate('/micro/spaces')}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-full text-xl hover:bg-gray-100"
            >
              <span>🎙️</span>
              <span>Spaces</span>
            </button>

            <button
              onClick={() => setComposing(true)}
              className="w-full mt-4 bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600 text-lg"
            >
              Post
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 border-r border-gray-200 max-w-2xl">
          {/* Header with tabs */}
          <div className="sticky top-0 bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200 z-10">
            <div className="flex">
              <button
                onClick={() => setActiveTab('for-you')}
                className={`flex-1 py-4 font-bold hover:bg-gray-50 ${
                  activeTab === 'for-you' ? 'border-b-4 border-blue-500' : ''
                }`}
              >
                For you
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-4 font-bold hover:bg-gray-50 ${
                  activeTab === 'following' ? 'border-b-4 border-blue-500' : ''
                }`}
              >
                Following
              </button>
            </div>
          </div>

          {/* Compose Box */}
          {composing && (
            <div className="border-b border-gray-200 p-4">
              <form onSubmit={handlePost}>
                <div className="flex space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    U
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={postContent}
                      onChange={handleContentChange}
                      placeholder="What's happening?!"
                      className="w-full text-xl resize-none outline-none min-h-[120px]"
                      autoFocus
                    />

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        <button type="button" className="p-2 hover:bg-blue-50 rounded-full text-blue-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button type="button" className="p-2 hover:bg-blue-50 rounded-full text-blue-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className={`text-sm ${charCount > MAX_CHARS ? 'text-red-500' : 'text-gray-500'}`}>
                          {charCount > 0 && `${charCount}/${MAX_CHARS}`}
                        </div>
                        <button
                          type="submit"
                          disabled={!postContent.trim() || charCount > MAX_CHARS}
                          className="px-4 py-2 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Timeline */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500 text-lg">No posts yet. Start following people to see their posts!</p>
            </div>
          ) : (
            <div>
              {posts.map(renderPost)}
            </div>
          )}
        </main>

        {/* Right Sidebar - Trending */}
        <aside className="w-80 p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="bg-gray-50 rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-4">Trending</h2>
            <div className="space-y-4">
              {trending.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/micro/search/${topic.hashtag}`)}
                  className="w-full text-left hover:bg-gray-100 p-3 rounded-lg transition-colors"
                >
                  <p className="text-sm text-gray-500">{topic.category || 'Trending'}</p>
                  <p className="font-bold text-gray-900">#{topic.hashtag}</p>
                  <p className="text-sm text-gray-500">{formatNumber(topic.postCount)} posts</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-gray-50 rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-4">Who to follow</h2>
            <p className="text-sm text-gray-500">Suggestions coming soon...</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

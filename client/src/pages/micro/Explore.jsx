import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { microTrending, microSearch } from '../../services/api';

export default function Explore() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trending');
  const [trending, setTrending] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      setLoading(true);
      const res = await microTrending.getTrending({ limit: 20 });
      setTrending(res.data.topics || []);
    } catch (error) {
      console.error('Failed to load trending:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const [postsRes, usersRes] = await Promise.all([
        microSearch.posts({ q: searchQuery, limit: 20 }),
        microSearch.users({ q: searchQuery, limit: 10 }),
      ]);

      setSearchResults({
        posts: postsRes.data.posts || [],
        users: usersRes.data.users || [],
      });
      setActiveTab('search');
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setSearching(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto border-x border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200 z-10">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/micro')} className="hover:bg-gray-100 p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="font-bold text-xl">Explore</h1>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts, users, hashtags..."
                  className="w-full px-4 py-3 pl-12 bg-gray-100 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <svg className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Tabs */}
            <div className="flex space-x-4 mt-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('trending')}
                className={`px-4 py-3 font-bold ${
                  activeTab === 'trending' ? 'border-b-4 border-blue-500' : 'text-gray-500'
                }`}
              >
                Trending
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-4 py-3 font-bold ${
                  activeTab === 'news' ? 'border-b-4 border-blue-500' : 'text-gray-500'
                }`}
              >
                News
              </button>
              <button
                onClick={() => setActiveTab('sports')}
                className={`px-4 py-3 font-bold ${
                  activeTab === 'sports' ? 'border-b-4 border-blue-500' : 'text-gray-500'
                }`}
              >
                Sports
              </button>
              <button
                onClick={() => setActiveTab('entertainment')}
                className={`px-4 py-3 font-bold ${
                  activeTab === 'entertainment' ? 'border-b-4 border-blue-500' : 'text-gray-500'
                }`}
              >
                Entertainment
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'trending' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : trending.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-gray-500">No trending topics right now</p>
                </div>
              ) : (
                <div>
                  {trending.map((topic, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate(`/micro/search/${topic.hashtag}`)}
                      className="border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">{topic.category || 'Trending'} · {topic.location || 'Worldwide'}</p>
                          <p className="font-bold text-lg mt-1">#{topic.hashtag}</p>
                          <p className="text-sm text-gray-500 mt-1">{formatNumber(topic.postCount)} posts</p>
                        </div>
                        <button className="text-gray-500 hover:text-blue-500 p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              {searching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {/* Users Results */}
                  {searchResults.users.length > 0 && (
                    <div className="border-b border-gray-200">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-bold text-lg">People</h2>
                      </div>
                      {searchResults.users.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => navigate(`/micro/profile/${user.id}`)}
                          className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-bold">{user.name}</p>
                                <p className="text-sm text-gray-500">@{user.name?.toLowerCase().replace(/\s+/g, '')}</p>
                                {user.bio && <p className="text-sm text-gray-700 mt-1">{user.bio.substring(0, 100)}</p>}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className={`px-4 py-2 rounded-full font-bold ${
                                user.isFollowing
                                  ? 'bg-white border border-gray-300 text-gray-900'
                                  : 'bg-gray-900 text-white'
                              }`}
                            >
                              {user.isFollowing ? 'Following' : 'Follow'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Posts Results */}
                  {searchResults.posts.length > 0 && (
                    <div>
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-bold text-lg">Posts</h2>
                      </div>
                      {searchResults.posts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => navigate(`/micro/post/${post.id}`)}
                          className="border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex space-x-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {post.user?.name?.charAt(0) || 'U'}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold">{post.user?.name}</span>
                                <span className="text-gray-500">·</span>
                                <span className="text-gray-500 text-sm">{formatTimeAgo(post.createdAt)}</span>
                              </div>

                              <p className="mt-2 text-gray-900 whitespace-pre-wrap">{post.content}</p>

                              {post.mediaUrls && post.mediaUrls.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                                  {post.mediaUrls.slice(0, 4).map((url, idx) => (
                                    <img key={idx} src={url} alt="Post media" className="w-full h-40 object-cover" />
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center space-x-8 mt-3 text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  <span className="text-sm">{formatNumber(post.repliesCount)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  <span className="text-sm">{formatNumber(post.likesCount)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.posts.length === 0 && searchResults.users.length === 0 && (
                    <div className="text-center py-12 px-4">
                      <p className="text-gray-500">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {(activeTab === 'news' || activeTab === 'sports' || activeTab === 'entertainment') && (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500">Category content coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { microPosts, microFollow } from '../../services/api';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId, activeTab]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [postsRes, statsRes] = await Promise.all([
        microPosts.getUserPosts(userId, { limit: 20, filter: activeTab }),
        microFollow.getUserStats(userId),
      ]);

      setPosts(postsRes.data.posts || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (stats.isFollowing) {
        await microFollow.unfollow(userId);
        setStats({ ...stats, isFollowing: false, followersCount: stats.followersCount - 1 });
      } else {
        await microFollow.follow(userId, {});
        setStats({ ...stats, isFollowing: true, followersCount: stats.followersCount + 1 });
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
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
        <div className="sticky top-0 bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200 z-10 px-4 py-3">
          <div className="flex items-center space-x-8">
            <button onClick={() => navigate('/micro')} className="hover:bg-gray-100 p-2 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="font-bold text-xl">Profile</h1>
              <p className="text-sm text-gray-500">{stats?.postsCount || 0} posts</p>
            </div>
          </div>
        </div>

        {loading && !stats ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div>
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>

              {/* Profile Info */}
              <div className="px-4 pb-4">
                <div className="flex justify-between items-start -mt-16 mb-4">
                  <div className="w-32 h-32 bg-blue-500 border-4 border-white rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    U
                  </div>

                  {currentUserId !== userId && (
                    <button
                      onClick={handleFollow}
                      className={`mt-20 px-6 py-2 rounded-full font-bold ${
                        stats?.isFollowing
                          ? 'bg-white border border-gray-300 text-gray-900 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {stats?.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <h2 className="text-2xl font-bold">User Name</h2>
                  <p className="text-gray-500">@username</p>

                  <p className="mt-3 text-gray-900">
                    Bio text goes here. This is where users can describe themselves and what they're about.
                  </p>

                  <div className="flex items-center space-x-4 mt-3 text-gray-500 text-sm">
                    <span>📍 Location</span>
                    <span>🗓️ Joined January 2024</span>
                  </div>

                  <div className="flex items-center space-x-6 mt-4">
                    <button
                      onClick={() => navigate(`/micro/profile/${userId}/following`)}
                      className="hover:underline"
                    >
                      <span className="font-bold text-gray-900">{formatNumber(stats?.followingCount)}</span>
                      <span className="text-gray-500 ml-1">Following</span>
                    </button>
                    <button
                      onClick={() => navigate(`/micro/profile/${userId}/followers`)}
                      className="hover:underline"
                    >
                      <span className="font-bold text-gray-900">{formatNumber(stats?.followersCount)}</span>
                      <span className="text-gray-500 ml-1">Followers</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 flex">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-4 font-bold hover:bg-gray-50 ${
                    activeTab === 'posts' ? 'border-b-4 border-blue-500' : ''
                  }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('replies')}
                  className={`flex-1 py-4 font-bold hover:bg-gray-50 ${
                    activeTab === 'replies' ? 'border-b-4 border-blue-500' : ''
                  }`}
                >
                  Replies
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`flex-1 py-4 font-bold hover:bg-gray-50 ${
                    activeTab === 'media' ? 'border-b-4 border-blue-500' : ''
                  }`}
                >
                  Media
                </button>
                <button
                  onClick={() => setActiveTab('likes')}
                  className={`flex-1 py-4 font-bold hover:bg-gray-50 ${
                    activeTab === 'likes' ? 'border-b-4 border-blue-500' : ''
                  }`}
                >
                  Likes
                </button>
              </div>
            </div>

            {/* Posts */}
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-gray-500">No {activeTab} yet</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/micro/post/${post.id}`)}
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
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

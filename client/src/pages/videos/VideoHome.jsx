import React, { useState, useEffect } from 'react';
import { videos, videoDiscovery, videoSubscriptions } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function VideoHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recommended, trending, subs] = await Promise.all([
        videoDiscovery.recommendations({ limit: 12 }),
        videoDiscovery.trending({ limit: 8 }),
        videoSubscriptions.list({ limit: 10 }),
      ]);

      setRecommendedVideos(recommended.data.videos || []);
      setTrendingVideos(trending.data.videos || []);
      setSubscriptions(subs.data.subscriptions || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatViews = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffSeconds = Math.floor((now - posted) / 1000);

    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 86400)} days ago`;
    if (diffSeconds < 31536000) return `${Math.floor(diffSeconds / 2592000)} months ago`;
    return `${Math.floor(diffSeconds / 31536000)} years ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-full px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <button onClick={() => navigate('/dashboard')} className="text-2xl font-bold text-red-600 flex items-center space-x-2">
                <span>📹</span>
                <span>SupernovaTV</span>
              </button>
            </div>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="flex-1 px-4 py-2 border rounded-l-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button className="bg-gray-100 px-6 py-2 rounded-r-full border border-l-0 hover:bg-gray-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/videos/upload')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Upload</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                activeTab === 'home' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
              }`}
            >
              <span>🏠</span>
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate('/videos/shorts')}
              className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-50"
            >
              <span>📱</span>
              <span>Shorts</span>
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                activeTab === 'subscriptions' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
              }`}
            >
              <span>📺</span>
              <span>Subscriptions</span>
            </button>

            <div className="border-t pt-2 mt-2">
              <button className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-50">
                <span>📚</span>
                <span>Your Channel</span>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-50">
                <span>🕐</span>
                <span>History</span>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-50">
                <span>👍</span>
                <span>Liked Videos</span>
              </button>
            </div>

            {subscriptions.length > 0 && (
              <div className="border-t pt-2 mt-2">
                <p className="px-4 py-2 text-sm font-semibold text-gray-700">Subscriptions</p>
                {subscriptions.slice(0, 5).map((sub) => (
                  <button
                    key={sub.id}
                    className="w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 hover:bg-gray-50"
                  >
                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">
                      {sub.channel?.channelName?.charAt(0) || 'C'}
                    </div>
                    <span className="text-sm truncate">{sub.channel?.channelName}</span>
                  </button>
                ))}
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'home' && (
            <>
              {/* Trending */}
              {trendingVideos.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">🔥 Trending</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {trendingVideos.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => navigate(`/videos/watch/${video.id}`)}
                        className="cursor-pointer group"
                      >
                        <div className="relative">
                          <img
                            src={video.thumbnailUrl || 'https://via.placeholder.com/320x180'}
                            alt={video.title}
                            className="w-full aspect-video object-cover rounded-lg group-hover:rounded-none transition-all"
                          />
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                          </div>
                        </div>
                        <div className="mt-2">
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600">
                            {video.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{video.channel?.channelName}</p>
                          <p className="text-xs text-gray-500">
                            {formatViews(video.viewsCount)} views • {formatTimeAgo(video.publishedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recommended */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended for you</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recommendedVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => navigate(`/videos/watch/${video.id}`)}
                      className="cursor-pointer group"
                    >
                      <div className="relative">
                        <img
                          src={video.thumbnailUrl || 'https://via.placeholder.com/320x180'}
                          alt={video.title}
                          className="w-full aspect-video object-cover rounded-lg group-hover:rounded-none transition-all"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                          {video.channel?.user?.name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600">
                            {video.title}
                          </h3>
                          <p className="text-sm text-gray-600">{video.channel?.channelName}</p>
                          <p className="text-xs text-gray-500">
                            {formatViews(video.viewsCount)} views • {formatTimeAgo(video.publishedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'subscriptions' && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest from subscriptions</h2>
              {subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📺</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No subscriptions yet</h3>
                  <p className="text-gray-600">Subscribe to channels to see their latest videos here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="border-b pb-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
                          {sub.channel?.channelName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <h3 className="font-semibold">{sub.channel?.channelName}</h3>
                          <p className="text-sm text-gray-600">{sub.channel?.subscribersCount} subscribers</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

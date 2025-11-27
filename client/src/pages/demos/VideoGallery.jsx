import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import demoVideosService from '../../services/demoVideos';

export default function VideoGallery() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pagination, setPagination] = useState(null);

  const categories = [
    { id: 'all', name: 'All Demos', icon: '🎬' },
    { id: 'overview', name: 'Platform Overview', icon: '🌟' },
    { id: 'website_builder', name: 'Website Builder', icon: '🌐' },
    { id: 'crm', name: 'CRM & Sales', icon: '💼' },
    { id: 'ecommerce', name: 'Ecommerce', icon: '🛒' },
    { id: 'content', name: 'Content Creation', icon: '✍️' },
    { id: 'courses', name: 'Courses', icon: '🎓' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'video', name: 'Video Platform', icon: '📹' },
    { id: 'other', name: 'Other Tools', icon: '🔧' },
  ];

  useEffect(() => {
    loadVideos();
  }, [selectedCategory]);

  const loadVideos = async () => {
    try {
      setLoading(true);

      // Load featured video separately
      if (!featuredVideo) {
        const featuredResult = await demoVideosService.getVideos({
          featured: true,
          limit: 1
        });
        if (featuredResult.videos.length > 0) {
          setFeaturedVideo(featuredResult.videos[0]);
        }
      }

      // Load videos by category
      const params = { limit: 20 };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const result = await demoVideosService.getVideos(params);
      setVideos(result.videos);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading && !featuredVideo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading demo videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              🎬 See The dAItaniverse in Action
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Watch comprehensive demos and tutorials showing you how to build your empire with our all-in-one platform
            </p>
          </div>
        </div>
      </header>

      {/* Featured Video */}
      {featuredVideo && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-12">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div
                className="relative cursor-pointer group"
                onClick={() => navigate(`/demos/watch/${featuredVideo.id}`)}
              >
                <img
                  src={featuredVideo.thumbnailUrl}
                  alt={featuredVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <div className="bg-white rounded-full p-6 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                  {formatDuration(featuredVideo.duration)}
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4 w-fit">
                  ⭐ Featured Demo
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {featuredVideo.title}
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  {featuredVideo.description}
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {formatViews(featuredVideo.viewCount)} views
                  </span>
                  {featuredVideo.completionRate && (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {featuredVideo.completionRate.toFixed(0)}% completion
                    </span>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/demos/watch/${featuredVideo.id}`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Watch Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">No videos found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => navigate(`/demos/watch/${video.id}`)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {formatViews(video.viewCount)}
                    </span>
                    {video.videoType && (
                      <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                        {video.videoType.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {pagination && pagination.hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                // Load more logic
              }}
              className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 transition-colors"
            >
              Load More Videos
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Empire?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Start using The dAItaniverse today and transform your business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

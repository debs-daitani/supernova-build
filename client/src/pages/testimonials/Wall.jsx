import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import testimonialsService from '../../services/testimonials';

export default function TestimonialWall() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [pagination, setPagination] = useState({ total: 0, limit: 12, offset: 0, hasMore: false });

  useEffect(() => {
    loadTestimonials();
    loadStats();
  }, [selectedCategory, minRating, pagination.offset]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const params = {
        limit: pagination.limit,
        offset: pagination.offset
      };

      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (minRating > 0) params.minRating = minRating;

      const data = await testimonialsService.getTestimonials(params);
      setTestimonials(data.testimonials || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await testimonialsService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadMore = () => {
    setPagination({ ...pagination, offset: pagination.offset + pagination.limit });
  };

  const categories = [
    { value: 'all', label: 'All', icon: '🌟' },
    { value: 'general', label: 'General', icon: '💬' },
    { value: 'website_builder', label: 'Website', icon: '🌐' },
    { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
    { value: 'crm', label: 'CRM', icon: '💼' },
    { value: 'email_marketing', label: 'Email', icon: '📧' },
    { value: 'content_creation', label: 'Content', icon: '🎨' },
    { value: 'productivity', label: 'Productivity', icon: '✅' },
    { value: 'cost_savings', label: 'Savings', icon: '💰' },
  ];

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Customer Success Stories</h1>
            <p className="text-2xl text-purple-100 mb-8">
              See what entrepreneurs are saying about The dAItaniverse
            </p>

            {stats && (
              <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-3xl mx-auto">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">{stats.totalCount}</div>
                  <div className="text-purple-100">Happy Customers</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">
                    {stats.averageRating ? stats.averageRating.toFixed(1) : '5.0'}⭐
                  </div>
                  <div className="text-purple-100">Average Rating</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">{stats.recommendationRate}%</div>
                  <div className="text-purple-100">Recommend Us</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category:</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setPagination({ ...pagination, offset: 0 });
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category.value
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating:</label>
            <div className="flex gap-2">
              {[0, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => {
                    setMinRating(rating);
                    setPagination({ ...pagination, offset: 0 });
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    minRating === rating
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating === 0 ? 'All Ratings' : `${rating}+ Stars`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && testimonials.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No testimonials yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
            <button
              onClick={() => navigate('/testimonials/submit')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Submit Testimonial
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                    testimonial.featured ? 'ring-2 ring-purple-600' : ''
                  }`}
                >
                  {/* Featured Badge */}
                  {testimonial.featured && (
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-2 text-sm font-semibold">
                      ⭐ Featured Testimonial
                    </div>
                  )}

                  <div className="p-6">
                    {/* Rating */}
                    <div className="mb-4">{renderStars(testimonial.rating)}</div>

                    {/* Content */}
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>

                    {/* Video/Photo */}
                    {testimonial.videoUrl && (
                      <video
                        src={testimonial.videoUrl}
                        poster={testimonial.videoThumbnail}
                        controls
                        className="w-full rounded-lg mb-4 bg-black"
                      />
                    )}
                    {!testimonial.videoUrl && testimonial.photoUrl && (
                      <img
                        src={testimonial.photoUrl}
                        alt="Testimonial"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}

                    {/* Author */}
                    <div className="flex items-center border-t pt-4">
                      {testimonial.authorPhoto ? (
                        <img
                          src={testimonial.authorPhoto}
                          alt={testimonial.authorName}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                          <span className="text-purple-600 font-semibold text-lg">
                            {testimonial.authorName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.authorName}</div>
                        {testimonial.authorRole && (
                          <div className="text-sm text-gray-600">
                            {testimonial.authorRole}
                            {testimonial.authorCompany && ` at ${testimonial.authorCompany}`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Use Case Badge */}
                    {testimonial.useCase && (
                      <div className="mt-4">
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                          {testimonial.useCase}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Join Them?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Start your free trial today and see why thousands of entrepreneurs love The dAItaniverse
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="bg-white hover:bg-gray-100 text-purple-600 px-8 py-4 rounded-lg text-lg font-bold transition-colors shadow-lg"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/testimonials/submit')}
              className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-4 rounded-lg text-lg font-bold transition-colors border-2 border-white"
            >
              Share Your Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

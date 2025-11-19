import React, { useState, useEffect } from 'react';
import demoVideosService from '../../services/demoVideos';

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, [filter]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const result = await demoVideosService.getAdminTestimonials(filter);
      setTestimonials(result);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status, featured = false, displayOnHome = false) => {
    try {
      await demoVideosService.reviewTestimonial(id, {
        status,
        featured,
        displayOnHome
      });

      alert(`Testimonial ${status}!`);
      loadTestimonials();
    } catch (error) {
      console.error('Failed to review testimonial:', error);
      alert('Failed to review testimonial');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Video Testimonials</h1>
          <p className="text-gray-600 mt-1">Review and manage user testimonials</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-4">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Testimonials List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No testimonials found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-3 gap-6 p-6">
                  {/* Video Preview */}
                  <div>
                    <div
                      className="relative cursor-pointer group"
                      onClick={() => setPreviewVideo(testimonial)}
                    >
                      {testimonial.thumbnailUrl ? (
                        <img
                          src={testimonial.thumbnailUrl}
                          alt="Testimonial"
                          className="w-full aspect-video object-cover rounded"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {testimonial.duration && (
                      <p className="text-sm text-gray-500 mt-2">
                        Duration: {Math.floor(testimonial.duration / 60)}:{(testimonial.duration % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>

                  {/* User Info & Quote */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={testimonial.user.avatar || '/default-avatar.png'}
                          alt={testimonial.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{testimonial.user.name}</div>
                          <div className="text-sm text-gray-500">{testimonial.user.email}</div>
                          {testimonial.user.niche && (
                            <div className="text-sm text-gray-500">{testimonial.user.niche}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {testimonial.featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-semibold">
                            Featured
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded font-semibold ${
                          testimonial.status === 'approved' ? 'bg-green-100 text-green-800' :
                          testimonial.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {testimonial.quote && (
                      <blockquote className="border-l-4 border-purple-500 pl-4 py-2 mb-4 italic text-gray-700">
                        "{testimonial.quote}"
                      </blockquote>
                    )}

                    <div className="text-sm text-gray-500 mb-4">
                      Submitted {formatDate(testimonial.submittedAt)}
                      {testimonial.reviewedAt && (
                        <span className="ml-2">• Reviewed {formatDate(testimonial.reviewedAt)}</span>
                      )}
                    </div>

                    {/* Actions */}
                    {testimonial.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReview(testimonial.id, 'approved', false, false)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReview(testimonial.id, 'approved', true, false)}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          ⭐ Approve & Feature
                        </button>
                        <button
                          onClick={() => handleReview(testimonial.id, 'approved', true, true)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          🏠 Approve & Show on Home
                        </button>
                        <button
                          onClick={() => handleReview(testimonial.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}

                    {testimonial.status === 'approved' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReview(testimonial.id, 'approved', !testimonial.featured, testimonial.displayOnHome)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          {testimonial.featured ? 'Remove from Featured' : 'Mark as Featured'}
                        </button>
                        <button
                          onClick={() => handleReview(testimonial.id, 'approved', testimonial.featured, !testimonial.displayOnHome)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          {testimonial.displayOnHome ? 'Remove from Homepage' : 'Show on Homepage'}
                        </button>
                        <button
                          onClick={() => handleReview(testimonial.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Preview Modal */}
        {previewVideo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewVideo(null)}
          >
            <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <video
                src={previewVideo.videoUrl}
                controls
                autoPlay
                className="w-full rounded-lg"
              />
              <button
                onClick={() => setPreviewVideo(null)}
                className="mt-4 bg-white hover:bg-gray-100 text-gray-900 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

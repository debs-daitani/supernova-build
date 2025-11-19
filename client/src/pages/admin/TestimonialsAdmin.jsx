import React, { useState, useEffect } from 'react';
import testimonialsService from '../../services/testimonials';

export default function TestimonialsAdmin() {
  const [activeTab, setActiveTab] = useState('pending');
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);

  // Approve modal state
  const [approveData, setApproveData] = useState({
    featured: false,
    displayOnHome: false,
    category: '',
    order: 0
  });

  useEffect(() => {
    loadTestimonials();
  }, [activeTab]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      let data;

      if (activeTab === 'pending') {
        data = await testimonialsService.getPendingTestimonials();
      } else {
        data = await testimonialsService.getAllTestimonials(activeTab !== 'all' ? activeTab : null);
      }

      setTestimonials(data);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      alert('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setApproveData({
      featured: false,
      displayOnHome: false,
      category: testimonial.category || 'general',
      order: 0
    });
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    try {
      await testimonialsService.approveTestimonial(selectedTestimonial.id, approveData);
      alert('Testimonial approved successfully!');
      setShowApproveModal(false);
      loadTestimonials();
    } catch (error) {
      console.error('Failed to approve testimonial:', error);
      alert('Failed to approve testimonial');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this testimonial?')) return;

    try {
      await testimonialsService.rejectTestimonial(id);
      alert('Testimonial rejected');
      loadTestimonials();
    } catch (error) {
      console.error('Failed to reject testimonial:', error);
      alert('Failed to reject testimonial');
    }
  };

  const handleFeature = async (id, featured) => {
    try {
      await testimonialsService.featureTestimonial(id, { featured });
      alert(`Testimonial ${featured ? 'featured' : 'unfeatured'} successfully!`);
      loadTestimonials();
    } catch (error) {
      console.error('Failed to feature testimonial:', error);
      alert('Failed to feature testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial? This cannot be undone.')) return;

    try {
      await testimonialsService.deleteTestimonial(id);
      alert('Testimonial deleted');
      loadTestimonials();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      alert('Failed to delete testimonial');
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Testimonials Management</h1>
          <p className="text-gray-600">Review and manage customer testimonials</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'pending', label: 'Pending Review', count: testimonials.filter(t => t.status === 'pending').length },
                { id: 'approved', label: 'Approved', count: null },
                { id: 'rejected', label: 'Rejected', count: null },
                { id: 'all', label: 'All', count: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && activeTab === 'pending' && tab.count > 0 && (
                    <span className="ml-2 bg-purple-600 text-white px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Testimonials List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading testimonials...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No testimonials found</h3>
              <p className="text-gray-600">No testimonials in this category yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        {renderStars(testimonial.rating)}
                        {getStatusBadge(testimonial.status)}
                        {testimonial.featured && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                            ⭐ Featured
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(testimonial.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.content}"</p>

                      {/* Author Info */}
                      <div className="flex items-center mb-4">
                        {testimonial.authorPhoto ? (
                          <img
                            src={testimonial.authorPhoto}
                            alt={testimonial.authorName}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <span className="text-purple-600 font-semibold">
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

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {testimonial.category && (
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                            {testimonial.category.replace('_', ' ')}
                          </span>
                        )}
                        {testimonial.useCase && (
                          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                            {testimonial.useCase}
                          </span>
                        )}
                        {testimonial.source && (
                          <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                            Source: {testimonial.source}
                          </span>
                        )}
                      </div>

                      {/* Media */}
                      <div className="grid grid-cols-2 gap-4">
                        {testimonial.videoUrl && (
                          <div>
                            <video
                              src={testimonial.videoUrl}
                              poster={testimonial.videoThumbnail}
                              controls
                              className="w-full rounded-lg bg-black"
                            />
                          </div>
                        )}
                        {testimonial.photoUrl && !testimonial.videoUrl && (
                          <div>
                            <img
                              src={testimonial.photoUrl}
                              alt="Testimonial"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>

                      {/* User Info (if available) */}
                      {testimonial.user && (
                        <div className="mt-4 text-sm text-gray-600">
                          <strong>User:</strong> {testimonial.user.name} ({testimonial.user.email})
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-6 flex flex-col gap-2">
                      {testimonial.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(testimonial)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(testimonial.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {testimonial.status === 'approved' && (
                        <button
                          onClick={() => handleFeature(testimonial.id, !testimonial.featured)}
                          className={`${
                            testimonial.featured
                              ? 'bg-gray-600 hover:bg-gray-700'
                              : 'bg-purple-600 hover:bg-purple-700'
                          } text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors`}
                        >
                          {testimonial.featured ? 'Unfeature' : 'Feature'}
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Approve Testimonial</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={approveData.featured}
                    onChange={(e) => setApproveData({ ...approveData, featured: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="font-medium text-gray-900">Mark as Featured</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={approveData.displayOnHome}
                    onChange={(e) => setApproveData({ ...approveData, displayOnHome: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="font-medium text-gray-900">Display on Homepage</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={approveData.category}
                  onChange={(e) => setApproveData({ ...approveData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="website_builder">Website Builder</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="crm">CRM</option>
                  <option value="email_marketing">Email Marketing</option>
                  <option value="content_creation">Content Creation</option>
                  <option value="productivity">Productivity</option>
                  <option value="cost_savings">Cost Savings</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                <input
                  type="number"
                  value={approveData.order}
                  onChange={(e) => setApproveData({ ...approveData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmApprove}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

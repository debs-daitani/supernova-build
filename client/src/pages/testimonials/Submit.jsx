import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import testimonialsService from '../../services/testimonials';
import { uploadFile } from '../../services/api';

export default function SubmitTestimonial() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [testimonialType, setTestimonialType] = useState('text'); // 'text' or 'video'

  // Form fields
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [authorCompany, setAuthorCompany] = useState('');
  const [useCase, setUseCase] = useState('');
  const [category, setCategory] = useState('general');

  // Media fields
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content || !authorName) {
      alert('Please provide testimonial content and your name');
      return;
    }

    try {
      setUploading(true);

      const testimonialData = {
        content,
        rating,
        authorName,
        authorRole,
        authorCompany,
        useCase,
        category,
        source: 'customer'
      };

      // Upload photo if provided
      if (photoFile) {
        const photoResult = await uploadFile(photoFile);
        testimonialData.photoUrl = photoResult.url;
      }

      // Upload video if provided
      if (videoFile) {
        const videoResult = await uploadFile(videoFile);
        testimonialData.videoUrl = videoResult.url;
      }

      // Submit testimonial
      await testimonialsService.submitTestimonial(testimonialData);

      alert('Thank you! Your testimonial has been submitted for review.');
      navigate('/testimonials/wall');
    } catch (error) {
      console.error('Failed to submit testimonial:', error);
      alert('Failed to submit testimonial. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const categories = [
    { value: 'general', label: 'General Experience' },
    { value: 'website_builder', label: 'Website Builder' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'crm', label: 'CRM & Sales' },
    { value: 'email_marketing', label: 'Email Marketing' },
    { value: 'content_creation', label: 'Content Creation' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'cost_savings', label: 'Cost Savings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Share Your Success Story</h1>
            <p className="text-purple-100">
              Help others by sharing your experience with The dAItaniverse
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Testimonial Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Testimonial Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTestimonialType('text')}
                  className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                    testimonialType === 'text'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📝 Text Testimonial
                </button>
                <button
                  type="button"
                  onClick={() => setTestimonialType('video')}
                  className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                    testimonialType === 'video'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎥 Video Testimonial
                </button>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-12 h-12 ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-4 text-lg font-semibold text-gray-700">
                  {rating} {rating === 1 ? 'Star' : 'Stars'}
                </span>
              </div>
            </div>

            {/* Written Testimonial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Testimonial <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                required
                placeholder="Share your experience with The dAItaniverse... What features do you love? What problems did it solve? What results have you achieved?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                Example: "The dAItaniverse transformed my business! I built my entire website, CRM, and online store in just one platform. I'm saving £500/month and everything works seamlessly together."
              </p>
            </div>

            {/* Author Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Role/Title
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="Founder & CEO"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={authorCompany}
                onChange={(e) => setAuthorCompany(e.target.value)}
                placeholder="Your Company Ltd"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category & Use Case */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Use Case
                </label>
                <input
                  type="text"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="E-commerce store, Blog, Agency..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Photo (Optional)
              </label>
              {!photoPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Upload Photo</span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
            </div>

            {/* Video Upload (only if video type selected) */}
            {testimonialType === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Video Testimonial
                </label>
                {!videoFile ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                        id="video-upload"
                      />
                      <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-lg font-medium text-gray-900 mb-2">Upload Video File</span>
                        <span className="text-sm text-gray-500">Click to browse or drag and drop</span>
                        <span className="text-xs text-gray-400 mt-1">MP4, MOV, WebM up to 500MB</span>
                      </label>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-500">or</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/tools/screen-recorder')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span>Record Video Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <video src={videoPreview} controls className="w-full rounded-lg bg-black" />
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview(null);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove Video
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Permission */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
                />
                <div className="text-sm text-gray-700">
                  <strong>I grant permission</strong> to use my testimonial (text, photo, and/or video) in marketing materials, website, and promotional content for The dAItaniverse.
                </div>
              </label>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📝 Testimonial Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific about features you use and results you've achieved</li>
                <li>• Mention measurable benefits (time saved, money saved, revenue growth)</li>
                <li>• Share your honest experience - authenticity matters!</li>
                {testimonialType === 'video' && (
                  <>
                    <li>• Keep video under 2 minutes for best results</li>
                    <li>• Good lighting and clear audio are important</li>
                  </>
                )}
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                {uploading ? 'Submitting...' : 'Submit Testimonial'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/testimonials/wall')}
                className="px-8 py-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Why Share Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-bold text-gray-900 mb-2">Build Trust</h3>
            <p className="text-gray-600 text-sm">
              Your honest review helps build trust with potential customers
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-bold text-gray-900 mb-2">Get Featured</h3>
            <p className="text-gray-600 text-sm">
              Great testimonials get featured on our homepage and marketing materials
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-bold text-gray-900 mb-2">Help Others</h3>
            <p className="text-gray-600 text-sm">
              Your story helps other entrepreneurs make the right choice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

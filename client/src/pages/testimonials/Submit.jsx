import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import demoVideosService from '../../services/demoVideos';
import { uploadFile } from '../../services/api';

export default function SubmitTestimonial() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [quote, setQuote] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      alert('Please select or record a video');
      return;
    }

    try {
      setUploading(true);

      // Upload video
      const videoUploadResult = await uploadFile(videoFile);

      // Submit testimonial
      await demoVideosService.submitTestimonial({
        videoUrl: videoUploadResult.url,
        quote,
        duration: Math.floor(videoFile.size / 100000) // Rough estimate
      });

      alert('Thank you! Your testimonial has been submitted for review.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit testimonial:', error);
      alert('Failed to submit testimonial. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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
            {/* Video Upload */}
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
                      onChange={handleFileSelect}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-lg font-medium text-gray-900 mb-2">
                        Upload Video File
                      </span>
                      <span className="text-sm text-gray-500">
                        Click to browse or drag and drop
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        MP4, MOV, WebM up to 500MB
                      </span>
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
                  <video
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg bg-black"
                  />
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

            {/* Text Testimonial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Written Testimonial (Optional)
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={4}
                placeholder="Share a few words about your experience... (This will be used as a quote if we feature your testimonial)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                Example: "The dAItaniverse transformed my business! I built my entire website, CRM, and online store in just one platform."
              </p>
            </div>

            {/* Permission */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
                />
                <div className="text-sm text-gray-700">
                  <strong>I grant permission</strong> to use my video testimonial and written feedback in marketing materials, website, and promotional content for The dAItaniverse.
                </div>
              </label>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📝 Testimonial Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keep video under 2 minutes for best results</li>
                <li>• Mention specific features you love</li>
                <li>• Share measurable results if possible</li>
                <li>• Speak naturally and be yourself!</li>
                <li>• Good lighting and clear audio are important</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading || !videoFile}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                {uploading ? 'Submitting...' : 'Submit Testimonial'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Why Share Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
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

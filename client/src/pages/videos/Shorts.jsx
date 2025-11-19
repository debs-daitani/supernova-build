import React, { useState, useEffect } from 'react';
import { videoDiscovery, videos } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Shorts() {
  const navigate = useNavigate();
  const [shorts, setShorts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShorts();
  }, []);

  const loadShorts = async () => {
    try {
      const res = await videoDiscovery.shorts({ limit: 20 });
      setShorts(res.data.shorts || []);
    } catch (error) {
      console.error('Failed to load shorts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (videoId) => {
    try {
      await videos.like(videoId, { likeType: 'like' });
      setShorts(shorts.map(s => s.id === videoId ? { ...s, likesCount: s.likesCount + 1 } : s));
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const goNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading || shorts.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading Shorts...</p>
        </div>
      </div>
    );
  }

  const current = shorts[currentIndex];

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Close Button */}
      <button
        onClick={() => navigate('/videos')}
        className="absolute top-4 left-4 z-20 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Video Container */}
      <div className="relative h-full flex items-center justify-center">
        {/* Video Placeholder (9:16 aspect ratio) */}
        <div className="relative max-w-md w-full h-full bg-gray-900">
          <img
            src={current.thumbnailUrl || 'https://via.placeholder.com/360x640'}
            alt={current.title}
            className="w-full h-full object-cover"
          />

          {/* Video Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/70 to-transparent text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-sm">
                    {current.channel?.channelName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="font-semibold">{current.channel?.channelName}</p>
                    <button className="text-red-500 text-sm font-semibold">Subscribe</button>
                  </div>
                </div>
                <p className="text-sm mb-1">{current.title}</p>
                <p className="text-xs text-gray-300">{current.viewsCount} views</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={() => handleLike(current.id)}
                  className="flex flex-col items-center"
                >
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <span className="text-xs mt-1">{current.likesCount}</span>
                </button>

                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-xs mt-1">{current.commentsCount}</span>
                </button>

                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <span className="text-xs mt-1">Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {currentIndex > 0 && (
            <button
              onClick={goPrev}
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}

          {currentIndex < shorts.length - 1 && (
            <button
              onClick={goNext}
              className="absolute bottom-1/3 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 right-4 z-20 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {shorts.length}
      </div>
    </div>
  );
}

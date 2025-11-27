import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import demoVideosService from '../../services/demoVideos';

export default function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const progressInterval = useRef(null);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showChapters, setShowChapters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeCTA, setActiveCTA] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [watchData, setWatchData] = useState({
    startTime: 0,
    totalWatchTime: 0,
    lastPosition: 0
  });

  useEffect(() => {
    loadVideo();
    return () => {
      // Save watch progress on unmount
      if (videoRef.current) {
        saveWatchProgress();
      }
    };
  }, [id]);

  useEffect(() => {
    // Check for CTAs at current time
    if (video?.ctas && currentTime > 0) {
      const activeCta = video.ctas.find(
        cta => Math.abs(currentTime - cta.time) < 1 && currentTime >= cta.time
      );
      setActiveCTA(activeCta || null);
    }
  }, [currentTime, video]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const videoData = await demoVideosService.getVideo(id);
      setVideo(videoData);

      // Load related videos
      const related = await demoVideosService.getVideos({
        category: videoData.category,
        limit: 4
      });
      setRelatedVideos(related.videos.filter(v => v.id !== id));

      // Set initial playback position if user has watched before
      if (videoData.userWatchPosition && videoRef.current) {
        videoRef.current.currentTime = videoData.userWatchPosition;
      }
    } catch (error) {
      console.error('Failed to load video:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWatchProgress = async () => {
    if (!videoRef.current || !video) return;

    const watchTime = Math.floor(videoRef.current.currentTime);
    const completed = watchTime >= duration * 0.9; // 90% watched = completed

    try {
      await demoVideosService.logView(id, {
        watchTime,
        completed,
        dropOffAt: !completed ? watchTime : null
      });
    } catch (error) {
      console.error('Failed to save watch progress:', error);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
      // Track watch progress every 5 seconds
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
        }
      }, 5000);
    }
    setPlaying(!playing);
  };

  const handleSeek = (time) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const handlePlaybackRateChange = (rate) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const jumpToChapter = (time) => {
    handleSeek(time);
    setShowChapters(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Video not found</h2>
          <button
            onClick={() => navigate('/demos')}
            className="text-purple-600 hover:text-purple-700"
          >
            ← Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Video Player Section */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          <div
            className="relative group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(playing ? false : true)}
          >
            {/* Video Element */}
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full aspect-video"
              onClick={handlePlayPause}
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              onEnded={() => {
                setPlaying(false);
                saveWatchProgress();
              }}
            />

            {/* CTA Overlay */}
            {activeCTA && (
              <div className="absolute inset-x-0 bottom-24 flex justify-center">
                <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md mx-4 animate-bounce">
                  <p className="text-gray-900 font-semibold mb-4">{activeCTA.text}</p>
                  <button
                    onClick={() => navigate(activeCTA.url)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {activeCTA.buttonText || 'Learn More'}
                  </button>
                  <button
                    onClick={() => setActiveCTA(null)}
                    className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Progress Bar */}
              <div className="px-4 pb-2">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                  }}
                />
                {/* Chapter Markers */}
                {video.chapters?.map((chapter, index) => (
                  <div
                    key={index}
                    className="absolute h-3 w-1 bg-white rounded"
                    style={{ left: `${(chapter.time / duration) * 100}%`, bottom: '6px' }}
                    title={chapter.title}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="px-4 pb-4 flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  {/* Play/Pause */}
                  <button onClick={handlePlayPause} className="hover:text-purple-400 transition-colors">
                    {playing ? (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleVolumeChange(volume > 0 ? 0 : 1)} className="hover:text-purple-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Time */}
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Chapters */}
                  {video.chapters && video.chapters.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowChapters(!showChapters)}
                        className="hover:text-purple-400 transition-colors"
                        title="Chapters"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>

                      {showChapters && (
                        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl p-2 w-64 max-h-80 overflow-y-auto">
                          <div className="text-xs font-semibold text-gray-400 px-2 py-1">CHAPTERS</div>
                          {video.chapters.map((chapter, index) => (
                            <button
                              key={index}
                              onClick={() => jumpToChapter(chapter.time)}
                              className="w-full text-left px-2 py-2 hover:bg-gray-700 rounded text-sm flex justify-between items-center"
                            >
                              <span className="truncate">{chapter.title}</span>
                              <span className="text-gray-400 text-xs ml-2">{formatTime(chapter.time)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Speed */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="hover:text-purple-400 transition-colors text-sm font-semibold"
                    >
                      {playbackRate}x
                    </button>

                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl p-2 w-32">
                        <div className="text-xs font-semibold text-gray-400 px-2 py-1">SPEED</div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handlePlaybackRateChange(rate)}
                            className={`w-full text-left px-2 py-1 hover:bg-gray-700 rounded text-sm ${
                              playbackRate === rate ? 'text-purple-400' : ''
                            }`}
                          >
                            {rate}x {rate === 1 && '(Normal)'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fullscreen */}
                  <button onClick={handleFullscreen} className="hover:text-purple-400 transition-colors" title="Fullscreen">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info & Related */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title & Stats */}
            <h1 className="text-3xl font-bold text-white mb-4">{video.title}</h1>
            <div className="flex items-center space-x-6 text-gray-400 mb-6">
              <span>{formatViews(video.viewCount)} views</span>
              {video.completionRate && (
                <span>{video.completionRate.toFixed(0)}% completion rate</span>
              )}
            </div>

            {/* Description */}
            {video.description && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={copyShareLink}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>

              <button
                onClick={() => navigate('/signup')}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
              >
                <span>Start Free Trial</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Related Videos</h3>
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) => (
                <div
                  key={relatedVideo.id}
                  onClick={() => navigate(`/demos/watch/${relatedVideo.id}`)}
                  className="flex gap-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors"
                >
                  <img
                    src={relatedVideo.thumbnailUrl}
                    alt={relatedVideo.title}
                    className="w-40 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                      {relatedVideo.title}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {formatViews(relatedVideo.viewCount)} views
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatTime(relatedVideo.duration)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/demos')}
              className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              View All Demos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { videos, videoSEO } from '../../services/api';

export default function VideoLibrary() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const videoId = searchParams.get('id');

  const [myVideos, setMyVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, draft, processing, ready, published
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSEOModal, setShowSEOModal] = useState(false);

  // SEO Generation state
  const [generatingTitles, setGeneratingTitles] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedTags, setGeneratedTags] = useState([]);

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 0,
  });

  useEffect(() => {
    loadVideos();
  }, [filter]);

  useEffect(() => {
    if (videoId) {
      loadVideo(videoId);
    }
  }, [videoId]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const videosData = await videos.list(params);
      setMyVideos(videosData);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVideo = async (id) => {
    try {
      const video = await videos.get(id);
      setSelectedVideo(video);
    } catch (error) {
      console.error('Failed to load video:', error);
    }
  };

  const handleCreateVideo = async () => {
    if (!uploadData.title || !uploadData.videoUrl) {
      alert('Please fill in title and video URL');
      return;
    }

    try {
      const newVideo = await videos.create(uploadData);
      await loadVideos();
      setShowUploadModal(false);
      setUploadData({ title: '', description: '', videoUrl: '', thumbnailUrl: '', duration: 0 });
      navigate(`/video/library?id=${newVideo.id}`);
    } catch (error) {
      console.error('Failed to create video:', error);
      alert('Failed to create video');
    }
  };

  const handleUpdateVideo = async (updates) => {
    if (!selectedVideo) return;

    try {
      const updated = await videos.update(selectedVideo.id, updates);
      setSelectedVideo(updated);
      await loadVideos();
    } catch (error) {
      console.error('Failed to update video:', error);
      alert('Failed to update video');
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await videos.delete(id);
      await loadVideos();
      if (selectedVideo?.id === id) {
        setSelectedVideo(null);
        navigate('/video/library');
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video');
    }
  };

  const handleGenerateTitles = async () => {
    if (!selectedVideo) return;

    try {
      setGeneratingTitles(true);
      const titles = await videoSEO.generateTitles({
        topic: selectedVideo.title,
        description: selectedVideo.description,
        targetAudience: 'general',
      });
      setGeneratedTitles(titles);
    } catch (error) {
      console.error('Failed to generate titles:', error);
      alert('Failed to generate titles');
    } finally {
      setGeneratingTitles(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!selectedVideo) return;

    try {
      setGeneratingDescription(true);
      const description = await videoSEO.generateDescription({
        title: selectedVideo.seoTitle || selectedVideo.title,
        topic: selectedVideo.title,
        keyPoints: [selectedVideo.description],
      });
      setGeneratedDescription(description);
    } catch (error) {
      console.error('Failed to generate description:', error);
      alert('Failed to generate description');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!selectedVideo) return;

    try {
      setGeneratingTags(true);
      const tags = await videoSEO.generateTags({
        topic: selectedVideo.title,
        niche: selectedVideo.description,
      });
      setGeneratedTags(tags);
    } catch (error) {
      console.error('Failed to generate tags:', error);
      alert('Failed to generate tags');
    } finally {
      setGeneratingTags(false);
    }
  };

  const applyTitle = (title) => {
    handleUpdateVideo({ seoTitle: title });
    setGeneratedTitles([]);
  };

  const applyDescription = () => {
    handleUpdateVideo({ seoDescription: generatedDescription });
    setGeneratedDescription('');
  };

  const applyTags = () => {
    handleUpdateVideo({ tags: generatedTags });
    setGeneratedTags([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🎬 Video Library</h1>
            <p className="text-purple-200">Manage and optimize your video content</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            + Upload Video
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Video List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['all', 'draft', 'processing', 'ready', 'published'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      filter === status
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-purple-300 hover:bg-white/10'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Video List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {myVideos.length === 0 ? (
                  <p className="text-purple-300 text-sm text-center py-4">
                    No videos found
                  </p>
                ) : (
                  myVideos.map(video => (
                    <div
                      key={video.id}
                      onClick={() => navigate(`/video/library?id=${video.id}`)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedVideo?.id === video.id
                          ? 'bg-purple-500/30 border border-purple-400'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded flex items-center justify-center flex-shrink-0">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover rounded" />
                          ) : (
                            <span className="text-xl">🎬</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm mb-1 truncate">{video.title}</h3>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={video.status} />
                            {video.views > 0 && (
                              <span className="text-purple-300 text-xs">
                                👁️ {formatNumber(video.views)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Video Details */}
          <div className="lg:col-span-2">
            {selectedVideo ? (
              <div className="space-y-6">
                {/* Video Preview */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                    {selectedVideo.videoUrl ? (
                      <video
                        src={selectedVideo.videoUrl}
                        controls
                        className="w-full h-full rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-6xl mb-2">🎬</p>
                        <p className="text-purple-300">No video uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                      <div className="flex items-center gap-4 flex-wrap mb-4">
                        <StatusBadge status={selectedVideo.status} />
                        {selectedVideo.duration && (
                          <span className="text-purple-300 text-sm">
                            ⏱️ {formatDuration(selectedVideo.duration)}
                          </span>
                        )}
                        {selectedVideo.hasSubtitles && (
                          <span className="text-green-300 text-sm">✓ Subtitles</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteVideo(selectedVideo.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>

                  {selectedVideo.description && (
                    <p className="text-purple-200 mb-4">{selectedVideo.description}</p>
                  )}

                  {/* Analytics */}
                  <div className="grid grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="text-center">
                      <p className="text-purple-300 text-sm mb-1">Views</p>
                      <p className="text-white text-xl font-bold">{formatNumber(selectedVideo.views)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-300 text-sm mb-1">Likes</p>
                      <p className="text-white text-xl font-bold">{formatNumber(selectedVideo.likes)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-300 text-sm mb-1">Comments</p>
                      <p className="text-white text-xl font-bold">{formatNumber(selectedVideo.comments)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-300 text-sm mb-1">Shares</p>
                      <p className="text-white text-xl font-bold">{formatNumber(selectedVideo.shares)}</p>
                    </div>
                  </div>
                </div>

                {/* SEO Section */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">🎯 SEO Optimization</h3>

                  {/* SEO Title */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-purple-200 text-sm font-medium">SEO Title</label>
                      <button
                        onClick={handleGenerateTitles}
                        disabled={generatingTitles}
                        className="text-xs text-purple-300 hover:text-white disabled:opacity-50"
                      >
                        {generatingTitles ? '⚙️ Generating...' : '✨ Generate with AI'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={selectedVideo.seoTitle || ''}
                      onChange={(e) => handleUpdateVideo({ seoTitle: e.target.value })}
                      placeholder="Optimized title for search engines..."
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    {/* Generated Titles */}
                    {generatedTitles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-purple-300 text-xs">Select a generated title:</p>
                        {generatedTitles.map((titleObj, idx) => (
                          <div key={idx} className="bg-white/5 p-3 rounded border border-white/10">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-white font-medium mb-1">{titleObj.title}</p>
                                <p className="text-purple-300 text-xs">{titleObj.reason}</p>
                              </div>
                              <button
                                onClick={() => applyTitle(titleObj.title)}
                                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-all"
                              >
                                Use This
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SEO Description */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-purple-200 text-sm font-medium">SEO Description</label>
                      <button
                        onClick={handleGenerateDescription}
                        disabled={generatingDescription}
                        className="text-xs text-purple-300 hover:text-white disabled:opacity-50"
                      >
                        {generatingDescription ? '⚙️ Generating...' : '✨ Generate with AI'}
                      </button>
                    </div>
                    <textarea
                      value={selectedVideo.seoDescription || ''}
                      onChange={(e) => handleUpdateVideo({ seoDescription: e.target.value })}
                      rows="4"
                      placeholder="Optimized description with keywords..."
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    {/* Generated Description */}
                    {generatedDescription && (
                      <div className="mt-3 bg-white/5 p-3 rounded border border-white/10">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-purple-300 text-xs">Generated description:</p>
                          <button
                            onClick={applyDescription}
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-all"
                          >
                            Use This
                          </button>
                        </div>
                        <pre className="text-purple-100 text-sm whitespace-pre-wrap font-sans">{generatedDescription}</pre>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-purple-200 text-sm font-medium">Tags</label>
                      <button
                        onClick={handleGenerateTags}
                        disabled={generatingTags}
                        className="text-xs text-purple-300 hover:text-white disabled:opacity-50"
                      >
                        {generatingTags ? '⚙️ Generating...' : '✨ Generate with AI'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(selectedVideo.tags || []).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-400/30"
                        >
                          #{tag}
                        </span>
                      ))}
                      {(!selectedVideo.tags || selectedVideo.tags.length === 0) && (
                        <p className="text-purple-300 text-sm">No tags yet</p>
                      )}
                    </div>

                    {/* Generated Tags */}
                    {generatedTags.length > 0 && (
                      <div className="mt-3 bg-white/5 p-3 rounded border border-white/10">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-purple-300 text-xs">Generated tags ({generatedTags.length}):</p>
                          <button
                            onClick={applyTags}
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-all"
                          >
                            Use These
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {generatedTags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded text-xs border border-purple-400/30"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
                <p className="text-6xl mb-4">🎬</p>
                <h3 className="text-white text-xl font-bold mb-2">No Video Selected</h3>
                <p className="text-purple-300 mb-6">Select a video from the list or upload a new one</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  + Upload Video
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">📤 Upload Video</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="My Awesome Video"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    rows="3"
                    placeholder="Describe your video..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Video URL *</label>
                  <input
                    type="url"
                    value={uploadData.videoUrl}
                    onChange={(e) => setUploadData({ ...uploadData, videoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={uploadData.thumbnailUrl}
                    onChange={(e) => setUploadData({ ...uploadData, thumbnailUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Duration (seconds)</label>
                  <input
                    type="number"
                    value={uploadData.duration}
                    onChange={(e) => setUploadData({ ...uploadData, duration: parseInt(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateVideo}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    draft: 'bg-gray-500/20 text-gray-300',
    processing: 'bg-yellow-500/20 text-yellow-300',
    ready: 'bg-green-500/20 text-green-300',
    published: 'bg-blue-500/20 text-blue-300',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

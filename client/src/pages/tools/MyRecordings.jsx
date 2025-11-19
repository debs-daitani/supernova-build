import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import demoVideosService from '../../services/demoVideos';

export default function MyRecordings() {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const result = await demoVideosService.getMyRecordings({ limit: 50 });
      setRecordings(result.recordings);
    } catch (error) {
      console.error('Failed to load recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this recording?')) return;

    try {
      await demoVideosService.deleteRecording(id);
      alert('Recording deleted successfully!');
      loadRecordings();
    } catch (error) {
      console.error('Failed to delete recording:', error);
      alert('Failed to delete recording');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Recordings</h1>
            <p className="text-gray-600 mt-1">All your screen recordings in one place</p>
          </div>
          <button
            onClick={() => navigate('/tools/screen-recorder')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + New Recording
          </button>
        </div>

        {/* Recordings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : recordings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No recordings yet</h3>
            <p className="text-gray-600 mb-6">Start recording your screen to create demos, tutorials, or bug reports</p>
            <button
              onClick={() => navigate('/tools/screen-recorder')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Your First Recording
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.map((recording) => (
              <div key={recording.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Thumbnail */}
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setPreviewVideo(recording)}
                >
                  {recording.thumbnailUrl ? (
                    <img
                      src={recording.thumbnailUrl}
                      alt={recording.title || 'Recording'}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
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
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                    {formatTime(recording.duration)}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {recording.title || 'Untitled Recording'}
                  </h3>
                  <div className="text-sm text-gray-500 mb-4">
                    {formatDate(recording.createdAt)}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded capitalize">
                      {recording.recordingType.replace('_', ' ')}
                    </span>
                    {recording.includeAudio && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        With Audio
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 flex gap-2">
                  <button
                    onClick={() => setPreviewVideo(recording)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Watch
                  </button>
                  <a
                    href={recording.videoUrl}
                    download
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors text-center"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(recording.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {previewVideo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewVideo(null)}
          >
            <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-bold">{previewVideo.title || 'Untitled Recording'}</h2>
                  <p className="text-sm text-gray-500">Recorded on {formatDate(previewVideo.createdAt)}</p>
                </div>
                <video
                  src={previewVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full"
                />
                <div className="p-4 flex justify-end gap-3">
                  <a
                    href={previewVideo.videoUrl}
                    download
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => setPreviewVideo(null)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Close
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

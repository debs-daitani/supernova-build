/**
 * Photo Library - Main View
 * Grid view with filtering, sorting, and organization
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RATINGS = [0, 1, 2, 3, 4, 5];
const FLAG_OPTIONS = ['NONE', 'PICK', 'REJECT'];
const COLOR_OPTIONS = ['NONE', 'RED', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE'];

export default function LibraryView() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    albumId: null,
    rating: null,
    flagStatus: null,
    colorLabel: null,
    sortBy: 'captureDate',
    sortOrder: 'desc'
  });

  // View options
  const [gridSize, setGridSize] = useState(200); // Thumbnail size
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    loadPhotos();
    loadAlbums();
  }, [filters]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.albumId) params.append('albumId', filters.albumId);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.flagStatus) params.append('flagStatus', filters.flagStatus);
      if (filters.colorLabel) params.append('colorLabel', filters.colorLabel);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/photos?${params}`);
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlbums = async () => {
    try {
      const response = await fetch('/api/albums');
      const data = await response.json();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error('Error loading albums:', error);
    }
  };

  const handlePhotoClick = (photo, e) => {
    if (e.shiftKey && selectedPhotos.length > 0) {
      // Select range
      const lastSelected = selectedPhotos[selectedPhotos.length - 1];
      const startIndex = photos.findIndex(p => p.id === lastSelected);
      const endIndex = photos.findIndex(p => p.id === photo.id);
      const range = photos.slice(
        Math.min(startIndex, endIndex),
        Math.max(startIndex, endIndex) + 1
      );
      setSelectedPhotos(range.map(p => p.id));
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      if (selectedPhotos.includes(photo.id)) {
        setSelectedPhotos(selectedPhotos.filter(id => id !== photo.id));
      } else {
        setSelectedPhotos([...selectedPhotos, photo.id]);
      }
    } else {
      // Single select / open
      if (selectedPhotos.length === 1 && selectedPhotos[0] === photo.id) {
        navigate(`/photos/${photo.id}/edit`);
      } else {
        setSelectedPhotos([photo.id]);
      }
    }
  };

  const setRating = async (rating) => {
    if (selectedPhotos.length === 0) return;

    for (const photoId of selectedPhotos) {
      await fetch(`/api/photos/${photoId}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
    }

    loadPhotos();
  };

  const setFlag = async (flagStatus) => {
    if (selectedPhotos.length === 0) return;

    for (const photoId of selectedPhotos) {
      await fetch(`/api/photos/${photoId}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagStatus })
      });
    }

    loadPhotos();
  };

  const setColor = async (colorLabel) => {
    if (selectedPhotos.length === 0) return;

    for (const photoId of selectedPhotos) {
      await fetch(`/api/photos/${photoId}/color`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colorLabel })
      });
    }

    loadPhotos();
  };

  const handleKeyDown = (e) => {
    // Keyboard shortcuts
    if (e.key >= '0' && e.key <= '5') {
      setRating(parseInt(e.key));
    } else if (e.key.toLowerCase() === 'p') {
      setFlag('PICK');
    } else if (e.key.toLowerCase() === 'x') {
      setFlag('REJECT');
    } else if (e.key.toLowerCase() === 'u') {
      setFlag('NONE');
    } else if (e.key.toLowerCase() === 'd') {
      if (selectedPhotos.length > 0) {
        navigate(`/photos/${selectedPhotos[0]}/edit`);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotos]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">Library</h2>

          {/* Folders */}
          <div className="mb-6">
            <div
              onClick={() => setFilters({ ...filters, albumId: null })}
              className={`px-3 py-2 rounded cursor-pointer ${
                !filters.albumId ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              📷 All Photos ({photos.length})
            </div>
          </div>

          {/* Albums */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-400 mb-2">Albums</h3>
            {albums.map(album => (
              <div
                key={album.id}
                onClick={() => setFilters({ ...filters, albumId: album.id })}
                className={`px-3 py-2 rounded cursor-pointer flex justify-between ${
                  filters.albumId === album.id ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                <span>{album.name}</span>
                <span className="text-gray-400">{album.photoCount}</span>
              </div>
            ))}
            <button
              onClick={() => {/* Open create album dialog */}}
              className="mt-2 w-full px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            >
              + New Album
            </button>
          </div>

          {/* Smart Albums */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-2">Smart Albums</h3>
            <div
              onClick={() => setFilters({ ...filters, rating: 5 })}
              className="px-3 py-2 rounded cursor-pointer hover:bg-gray-700"
            >
              ⭐ 5-Star Photos
            </div>
            <div
              onClick={() => setFilters({ ...filters, flagStatus: 'PICK' })}
              className="px-3 py-2 rounded cursor-pointer hover:bg-gray-700"
            >
              🚩 Flagged
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/photos/import')}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Import Photos
            </button>

            {/* View Options */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGridSize(Math.max(100, gridSize - 50))}
                className="p-2 hover:bg-gray-700 rounded"
              >
                🔍-
              </button>
              <span className="text-sm text-gray-400">{gridSize}px</span>
              <button
                onClick={() => setGridSize(Math.min(400, gridSize + 50))}
                className="p-2 hover:bg-gray-700 rounded"
              >
                🔍+
              </button>
            </div>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="captureDate">Capture Date</option>
              <option value="uploadedAt">Upload Date</option>
              <option value="rating">Rating</option>
              <option value="fileName">Filename</option>
            </select>

            <button
              onClick={() => setFilters({
                ...filters,
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
              })}
              className="p-2 hover:bg-gray-700 rounded"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Quick Actions (when photos selected) */}
          {selectedPhotos.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{selectedPhotos.length} selected</span>

              {/* Rating */}
              <div className="flex gap-1">
                {RATINGS.map(rating => (
                  <button
                    key={rating}
                    onClick={() => setRating(rating)}
                    className="p-2 hover:bg-gray-700 rounded text-yellow-400"
                    title={`${rating} stars`}
                  >
                    {rating === 0 ? '☆' : '⭐'.repeat(rating)}
                  </button>
                ))}
              </div>

              {/* Flags */}
              <div className="flex gap-1">
                <button
                  onClick={() => setFlag('PICK')}
                  className="p-2 hover:bg-gray-700 rounded text-green-400"
                  title="Pick (P)"
                >
                  🚩
                </button>
                <button
                  onClick={() => setFlag('REJECT')}
                  className="p-2 hover:bg-gray-700 rounded text-red-400"
                  title="Reject (X)"
                >
                  ❌
                </button>
              </div>

              {/* Colors */}
              <div className="flex gap-1">
                {COLOR_OPTIONS.filter(c => c !== 'NONE').map(color => (
                  <button
                    key={color}
                    onClick={() => setColor(color)}
                    className={`w-6 h-6 rounded hover:ring-2 ring-white ${getColorClass(color)}`}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading photos...</div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-xl font-bold mb-2">No Photos Yet</h3>
              <p className="text-gray-400 mb-6">Import your first photos to get started</p>
              <button
                onClick={() => navigate('/photos/import')}
                className="bg-orange-500 text-white px-6 py-3 rounded hover:bg-orange-600"
              >
                Import Photos
              </button>
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))`
              }}
            >
              {photos.map(photo => (
                <div
                  key={photo.id}
                  onClick={(e) => handlePhotoClick(photo, e)}
                  className={`relative aspect-square rounded overflow-hidden cursor-pointer border-2 ${
                    selectedPhotos.includes(photo.id)
                      ? 'border-orange-500'
                      : 'border-transparent hover:border-gray-600'
                  }`}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.fileName}
                    className="w-full h-full object-cover"
                  />

                  {/* Info Overlay */}
                  {showInfo && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          {photo.rating > 0 && (
                            <span className="text-yellow-400">
                              {'⭐'.repeat(photo.rating)}
                            </span>
                          )}
                          {photo.flagStatus === 'PICK' && <span className="text-green-400">🚩</span>}
                          {photo.flagStatus === 'REJECT' && <span className="text-red-400">❌</span>}
                          {photo.colorLabel !== 'NONE' && (
                            <span className={`w-3 h-3 rounded-full ${getColorClass(photo.colorLabel)}`} />
                          )}
                        </div>
                        <span className="text-gray-300">{photo.camera}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar (when single photo selected) */}
      {selectedPhotos.length === 1 && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto p-4">
          <PhotoInfoPanel photoId={selectedPhotos[0]} photos={photos} />
        </div>
      )}
    </div>
  );
}

function PhotoInfoPanel({ photoId, photos }) {
  const photo = photos.find(p => p.id === photoId);
  if (!photo) return null;

  return (
    <div>
      <h3 className="font-bold mb-4">Photo Info</h3>

      {/* Histogram Placeholder */}
      <div className="bg-gray-700 h-32 rounded mb-4 flex items-center justify-center text-gray-500">
        Histogram
      </div>

      {/* Quick Develop */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-400 mb-2">Quick Develop</h4>
        <button className="w-full bg-gray-700 px-3 py-2 rounded hover:bg-gray-600 mb-2">
          Auto Enhance
        </button>
        <button className="w-full bg-gray-700 px-3 py-2 rounded hover:bg-gray-600">
          Apply Preset
        </button>
      </div>

      {/* Metadata */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-400 mb-2">Metadata</h4>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Camera:</span>
            <span>{photo.camera || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Dimensions:</span>
            <span>{photo.width} × {photo.height}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Date:</span>
            <span>{new Date(photo.captureDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div>
        <h4 className="text-sm font-bold text-gray-400 mb-2">File Info</h4>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Filename:</span>
            <span className="truncate">{photo.fileName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getColorClass(color) {
  const colors = {
    RED: 'bg-red-500',
    YELLOW: 'bg-yellow-500',
    GREEN: 'bg-green-500',
    BLUE: 'bg-blue-500',
    PURPLE: 'bg-purple-500'
  };
  return colors[color] || '';
}

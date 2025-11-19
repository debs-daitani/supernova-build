/**
 * Import Photos Dialog
 * Upload and import photos with metadata
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ImportPhotos() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [albumId, setAlbumId] = useState('');
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState('');

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleImport = async () => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();

      files.forEach(file => {
        formData.append('photos', file);
      });

      if (albumId) formData.append('albumId', albumId);
      if (rating) formData.append('rating', rating);
      if (tags) formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim())));

      const response = await fetch('/api/photos/import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert(`Imported ${data.imported} photos successfully!`);
        navigate('/photos');
      } else {
        alert('Import failed');
      }
    } catch (error) {
      console.error('Error importing:', error);
      alert('Import error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/photos')}
          className="mb-6 text-gray-400 hover:text-white"
        >
          ← Back to Library
        </button>

        <h1 className="text-3xl font-bold mb-8">Import Photos</h1>

        {/* File Selection */}
        <div className="bg-gray-800 rounded-lg p-8 mb-6">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-bold mb-2">Select Photos to Import</h3>
            <p className="text-gray-400 mb-6">
              JPG, PNG, TIFF, RAW (CR2, NEF, ARW, DNG, etc.)
            </p>
            <label className="inline-block bg-orange-500 px-6 py-3 rounded cursor-pointer hover:bg-orange-600">
              Choose Files
              <input
                type="file"
                multiple
                accept="image/*,.cr2,.nef,.arw,.dng,.raf,.orf,.rw2,.pef"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold mb-3">{files.length} files selected</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="text-sm text-gray-400">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Import Options */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
          <h3 className="font-bold mb-4">Import Options</h3>

          <div>
            <label className="block text-sm mb-2">Initial Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="0">No rating</option>
              <option value="1">⭐ 1 Star</option>
              <option value="2">⭐ 2 Stars</option>
              <option value="3">⭐ 3 Stars</option>
              <option value="4">⭐ 4 Stars</option>
              <option value="5">⭐ 5 Stars</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="vacation, beach, summer 2024"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Import Button */}
        <button
          onClick={handleImport}
          disabled={files.length === 0 || uploading}
          className="w-full bg-orange-500 py-4 rounded text-lg font-bold hover:bg-orange-600 disabled:opacity-50"
        >
          {uploading ? `Importing ${files.length} photos...` : `Import ${files.length} Photos`}
        </button>
      </div>
    </div>
  );
}

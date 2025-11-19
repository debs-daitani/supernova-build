/**
 * Export Photos Dialog
 * Export photos with edits applied
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ExportPhotos() {
  const navigate = useNavigate();
  const location = useLocation();
  const photoIds = location.state?.photoIds || [];

  const [exportOptions, setExportOptions] = useState({
    format: 'JPEG',
    quality: 90,
    resize: false,
    resizeWidth: 1920,
    resizeHeight: 1080,
    resizeMode: 'FIT',
    includeMetadata: true,
    stripGPS: false,
    sharpenOutput: false
  });

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);

      const response = await fetch('/api/photos/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoIds,
          exportOptions
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Exported ${data.exported} photos successfully!`);
        navigate('/photos');
      } else {
        alert('Export failed');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Export error');
    } finally {
      setExporting(false);
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

        <h1 className="text-3xl font-bold mb-8">Export Photos</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <p className="text-gray-400">Exporting {photoIds.length} photo(s)</p>
        </div>

        {/* Export Settings */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 space-y-6">
          <h3 className="font-bold">Export Settings</h3>

          {/* Format & Quality */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Format</label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                <option value="JPEG">JPEG</option>
                <option value="PNG">PNG</option>
                <option value="TIFF">TIFF</option>
                <option value="WEBP">WebP</option>
                <option value="DNG">DNG (RAW)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Quality ({exportOptions.quality}%)</label>
              <input
                type="range"
                min="1"
                max="100"
                value={exportOptions.quality}
                onChange={(e) => setExportOptions({ ...exportOptions, quality: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          {/* Resize */}
          <div>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={exportOptions.resize}
                onChange={(e) => setExportOptions({ ...exportOptions, resize: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Resize Images</span>
            </label>

            {exportOptions.resize && (
              <div className="ml-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Width (px)</label>
                  <input
                    type="number"
                    value={exportOptions.resizeWidth}
                    onChange={(e) => setExportOptions({ ...exportOptions, resizeWidth: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Height (px)</label>
                  <input
                    type="number"
                    value={exportOptions.resizeHeight}
                    onChange={(e) => setExportOptions({ ...exportOptions, resizeHeight: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Metadata Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => setExportOptions({ ...exportOptions, includeMetadata: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Include Metadata</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={exportOptions.stripGPS}
                onChange={(e) => setExportOptions({ ...exportOptions, stripGPS: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Strip GPS Data</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={exportOptions.sharpenOutput}
                onChange={(e) => setExportOptions({ ...exportOptions, sharpenOutput: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Output Sharpening</span>
            </label>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-orange-500 py-4 rounded text-lg font-bold hover:bg-orange-600 disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export Photos'}
        </button>
      </div>
    </div>
  );
}

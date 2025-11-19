/**
 * Asset Library
 * Manage brand assets (images, icons, patterns, templates)
 */

import { useState, useEffect } from 'react';

const ASSET_TYPES = ['LOGO', 'ICON', 'IMAGE', 'PATTERN', 'TEMPLATE', 'GRAPHIC', 'OTHER'];

export default function AssetLibrary({ brandKit, onRefresh }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'IMAGE',
    fileUrl: '',
    category: '',
    tags: ''
  });

  useEffect(() => {
    loadAssets();
  }, [filterType, searchQuery]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/brand-kits/${brandKit.id}/assets?${params}`);
      const data = await response.json();

      if (data.success) {
        setAssets(data.assets);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAsset = async () => {
    try {
      const tags = uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean);

      const response = await fetch(`/api/brand-kits/${brandKit.id}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...uploadForm,
          tags
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowUploadForm(false);
        setUploadForm({ name: '', type: 'IMAGE', fileUrl: '', category: '', tags: '' });
        loadAssets();
      }
    } catch (error) {
      console.error('Error uploading asset:', error);
    }
  };

  const deleteAsset = async (assetId) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      await fetch(`/api/brand-kits/assets/${assetId}`, {
        method: 'DELETE'
      });

      loadAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asset Library</h2>
          <p className="text-gray-400">Manage your brand assets</p>
        </div>

        <button
          onClick={() => setShowUploadForm(true)}
          className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600"
        >
          + Upload Asset
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search assets..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-4 py-2"
        >
          <option value="">All Types</option>
          {ASSET_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="text-center py-12">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-bold mb-2">No Assets Yet</h3>
          <p className="text-gray-400 mb-4">Upload your brand assets to keep them organized</p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600"
          >
            Upload Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map(asset => (
            <div key={asset.id} className="bg-gray-800 rounded-lg overflow-hidden group">
              <div className="aspect-square bg-gray-700 flex items-center justify-center relative">
                {asset.fileUrl ? (
                  <img src={asset.fileUrl} alt={asset.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-gray-500 text-4xl">📄</div>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={asset.fileUrl}
                    download
                    className="px-3 py-1 bg-green-500 rounded hover:bg-green-600 text-sm"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="p-3">
                <div className="font-bold text-sm truncate">{asset.name}</div>
                <div className="text-xs text-gray-400">{asset.type}</div>
                {asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {asset.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Upload Asset</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Asset Name</label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="My Brand Asset"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Type</label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                >
                  {ASSET_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">File URL</label>
                <input
                  type="url"
                  value={uploadForm.fileUrl}
                  onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                  placeholder="https://example.com/asset.png"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Upload file to storage first, then paste URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Category (optional)</label>
                <input
                  type="text"
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  placeholder="Social Media, Print, Web"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  placeholder="logo, square, instagram"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={uploadAsset}
                disabled={!uploadForm.name || !uploadForm.fileUrl}
                className="flex-1 px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                Upload
              </button>
              <button
                onClick={() => setShowUploadForm(false)}
                className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
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

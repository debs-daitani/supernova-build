import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageFiles, storageFolders, storageQuota, storageUpload } from '../../services/api';

export default function MyDrive() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('my-drive'); // my-drive, shared, recent, starred, trash
  const [viewMode, setViewMode] = useState('grid');
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [quota, setQuota] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
    loadQuota();
  }, [view]);

  const loadData = async () => {
    try {
      if (view === 'my-drive') {
        const [filesData, foldersData] = await Promise.all([
          storageFiles.list(),
          storageFolders.list(),
        ]);
        setFiles(filesData);
        setFolders(foldersData);
      }
      // Add other views as needed
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuota = async () => {
    try {
      const quotaData = await storageQuota.get();
      setQuota(quotaData);
    } catch (error) {
      console.error('Failed to load quota:', error);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // 1. Initialize upload
      const { fileId, uploadUrl, key } = await storageUpload.init({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      // 2. Upload to storage (mock - in production would upload to S3)
      alert(`File upload mock complete!\n\nIn production:\n1. Upload file to: ${uploadUrl}\n2. Then call complete endpoint`);

      // 3. Complete upload
      await storageUpload.complete({
        fileId,
        key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      loadData();
      loadQuota();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (!name) return;

    try {
      await storageFolders.create({ name });
      loadData();
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert('Failed to create folder');
    }
  };

  const handleStar = async (id, type) => {
    try {
      if (type === 'file') {
        await storageFiles.star(id);
      }
      loadData();
    } catch (error) {
      console.error('Failed to star:', error);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm(`Move this ${type} to trash?`)) return;

    try {
      if (type === 'file') {
        await storageFiles.delete(id);
      } else {
        await storageFolders.delete(id);
      }
      loadData();
      loadQuota();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete');
    }
  };

  const handleShare = (id, type) => {
    alert('Sharing functionality coming soon!');
  };

  const handleDownload = async (id) => {
    try {
      const { downloadUrl } = await storageFiles.download(id);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Failed to download:', error);
      alert('Download failed');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return '📄';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '🎤';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📄';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">☁️</div>
          <p className="text-blue-300">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900/50 backdrop-blur-lg border-r border-white/10 min-h-screen p-4">
          <h2 className="text-white text-2xl font-bold mb-6">☁️ My Drive</h2>

          {/* Upload Button */}
          <div className="mb-6">
            <label className="block">
              <input
                type="file"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-lg font-semibold cursor-pointer hover:from-blue-600 hover:to-indigo-600 transition-all text-center">
                {uploading ? 'Uploading...' : '+ Upload File'}
              </div>
            </label>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-6">
            <button
              onClick={() => setView('my-drive')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                view === 'my-drive' ? 'bg-blue-500 text-white' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              📁 My Drive
            </button>
            <button
              onClick={() => setView('shared')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                view === 'shared' ? 'bg-blue-500 text-white' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              👥 Shared with me
            </button>
            <button
              onClick={() => setView('recent')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                view === 'recent' ? 'bg-blue-500 text-white' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              🕐 Recent
            </button>
            <button
              onClick={() => setView('starred')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                view === 'starred' ? 'bg-blue-500 text-white' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              ⭐ Starred
            </button>
            <button
              onClick={() => setView('trash')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                view === 'trash' ? 'bg-blue-500 text-white' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              🗑️ Trash
            </button>
          </nav>

          {/* Storage Quota */}
          {quota && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-200 text-sm">Storage</span>
                <span className="text-white text-sm font-semibold">
                  {quota.percentUsed}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${quota.percentUsed}%` }}
                />
              </div>
              <p className="text-blue-300 text-xs">
                {quota.formattedUsed} of {quota.formattedTotal} used
              </p>
              <button className="mt-3 w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg transition-all">
                Upgrade Storage
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {view === 'my-drive' && 'My Drive'}
                {view === 'shared' && 'Shared with me'}
                {view === 'recent' && 'Recent'}
                {view === 'starred' && 'Starred'}
                {view === 'trash' && 'Trash'}
              </h1>
              <p className="text-blue-300">
                {files.length} files, {folders.length} folders
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateFolder}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
              >
                📁 New Folder
              </button>
              <div className="flex gap-2 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded transition-all ${
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-blue-200'
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded transition-all ${
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-blue-200'
                  }`}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Files and Folders */}
          {files.length === 0 && folders.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <p className="text-6xl mb-4">☁️</p>
              <h3 className="text-white text-2xl font-bold mb-2">No files yet</h3>
              <p className="text-blue-300 mb-6">Upload your first file to get started!</p>
              <label className="inline-block">
                <input
                  type="file"
                  onChange={handleUpload}
                  className="hidden"
                />
                <div className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all">
                  Upload File
                </div>
              </label>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Folders */}
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-blue-400/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">📁</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStar(folder.id, 'folder'); }}
                        className="text-yellow-300 hover:text-yellow-200 p-1"
                      >
                        ⭐
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShare(folder.id, 'folder'); }}
                        className="text-blue-300 hover:text-blue-200 p-1"
                      >
                        🔗
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(folder.id, 'folder'); }}
                        className="text-red-300 hover:text-red-200 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <h3 className="text-white font-semibold truncate">{folder.name}</h3>
                  <p className="text-blue-300 text-sm">
                    {folder._count?.files || 0} files
                  </p>
                </div>
              ))}

              {/* Files */}
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-blue-400/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{getFileIcon(file.mimeType)}</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStar(file.id, 'file'); }}
                        className="text-yellow-300 hover:text-yellow-200 p-1"
                      >
                        ⭐
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShare(file.id, 'file'); }}
                        className="text-blue-300 hover:text-blue-200 p-1"
                      >
                        🔗
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(file.id); }}
                        className="text-green-300 hover:text-green-200 p-1"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(file.id, 'file'); }}
                        className="text-red-300 hover:text-red-200 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <h3 className="text-white font-semibold truncate">{file.name}</h3>
                  <p className="text-blue-300 text-sm">
                    {formatFileSize(file.fileSize)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-blue-300 text-sm font-semibold">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-2">Modified</div>
                <div className="col-span-2">Size</div>
              </div>
              {[...folders, ...files].map((item, index) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 gap-4 p-4 hover:bg-white/5 cursor-pointer ${
                    index > 0 ? 'border-t border-white/10' : ''
                  }`}
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <span className="text-2xl">
                      {item.mimeType ? getFileIcon(item.mimeType) : '📁'}
                    </span>
                    <span className="text-white font-medium truncate">{item.name}</span>
                  </div>
                  <div className="col-span-2 flex items-center text-blue-300 text-sm">
                    Me
                  </div>
                  <div className="col-span-2 flex items-center text-blue-300 text-sm">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 flex items-center text-blue-300 text-sm">
                    {item.fileSize ? formatFileSize(item.fileSize) : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Coming Soon */}
          <div className="mt-12 bg-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-400/20">
            <h3 className="text-white font-bold mb-3">☁️ Coming Soon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-200 text-sm">
              <div className="flex items-start gap-2"><span>✓</span><span>File preview (docs, images, videos, PDFs)</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Drag-and-drop upload</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Share files & folders with permissions</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Advanced search with filters</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>File version history</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Thumbnail generation</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Folder color coding</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Bulk actions (select multiple)</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Desktop sync app</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Mobile app</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Offline access</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Auto-organize with AI</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

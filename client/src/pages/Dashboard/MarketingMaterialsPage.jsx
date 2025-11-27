/**
 * Marketing Materials Library
 * Browse and download affiliate marketing assets
 */

import { useState, useEffect } from 'react';

export default function MarketingMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: null, category: null });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMaterials();
  }, [filter]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.category) params.append('category', filter.category);

      const response = await fetch(`/api/affiliate/materials?${params}`);
      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      // Track download
      await fetch(`/api/affiliate/materials/${material.id}/download`, {
        method: 'POST'
      });

      // Download file if URL exists
      if (material.fileUrl) {
        window.open(material.fileUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const filteredMaterials = materials.filter(material => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      material.title.toLowerCase().includes(search) ||
      material.description?.toLowerCase().includes(search) ||
      material.tags?.some(tag => tag.toLowerCase().includes(search))
    );
  });

  const materialTypes = [
    { value: null, label: 'All Types' },
    { value: 'BANNER', label: 'Banner Ads' },
    { value: 'EMAIL', label: 'Email Templates' },
    { value: 'SOCIAL', label: 'Social Media' },
    { value: 'VIDEO', label: 'Video Scripts' },
    { value: 'BLOG_POST', label: 'Blog Posts' },
    { value: 'LANDING_PAGE', label: 'Landing Pages' },
    { value: 'GRAPHIC', label: 'Graphics' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketing Materials</h1>
        <p className="text-gray-600">
          Download ready-to-use marketing assets to promote The dAItaniverse
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search materials..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={filter.type || ''}
              onChange={(e) => setFilter({ ...filter, type: e.target.value || null })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {materialTypes.map(type => (
                <option key={type.value || 'all'} value={type.value || ''}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filter.category || ''}
              onChange={(e) => setFilter({ ...filter, category: e.target.value || null })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="social">Social Media</option>
              <option value="email">Email</option>
              <option value="banner">Banner</option>
              <option value="blog">Blog</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-bold mb-2">No Materials Found</h3>
          <p className="text-gray-600">
            {searchTerm || filter.type || filter.category
              ? 'Try adjusting your filters'
              : 'Materials will be added soon'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map(material => (
            <MaterialCard
              key={material.id}
              material={material}
              onDownload={() => handleDownload(material)}
            />
          ))}
        </div>
      )}

      {/* Usage Tips */}
      <div className="mt-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Marketing Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-2">✅ Do's</h3>
            <ul className="space-y-2 text-orange-100">
              <li>• Customize templates with your referral link</li>
              <li>• Add personal testimonials or experiences</li>
              <li>• Test different messages and formats</li>
              <li>• Track which materials perform best</li>
              <li>• Share consistently across platforms</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">❌ Don'ts</h3>
            <ul className="space-y-2 text-orange-100">
              <li>• Don't spam or use deceptive tactics</li>
              <li>• Don't make false income claims</li>
              <li>• Don't modify our logo or branding</li>
              <li>• Don't use materials on adult/illegal sites</li>
              <li>• Don't bid on our brand name in ads</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}

function MaterialCard({ material, onDownload }) {
  const getTypeIcon = (type) => {
    const icons = {
      BANNER: '🎯',
      EMAIL: '📧',
      SOCIAL: '📱',
      VIDEO: '🎥',
      BLOG_POST: '📝',
      LANDING_PAGE: '🌐',
      GRAPHIC: '🎨',
      OTHER: '📄'
    };
    return icons[type] || '📄';
  };

  const getTypeColor = (type) => {
    const colors = {
      BANNER: 'bg-blue-100 text-blue-700',
      EMAIL: 'bg-green-100 text-green-700',
      SOCIAL: 'bg-purple-100 text-purple-700',
      VIDEO: 'bg-red-100 text-red-700',
      BLOG_POST: 'bg-yellow-100 text-yellow-700',
      LANDING_PAGE: 'bg-indigo-100 text-indigo-700',
      GRAPHIC: 'bg-pink-100 text-pink-700',
      OTHER: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all">
      {/* Thumbnail */}
      {material.thumbnailUrl ? (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={material.thumbnailUrl}
            alt={material.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
          <span className="text-6xl">{getTypeIcon(material.type)}</span>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Type Badge */}
        <div className="mb-3">
          <span className={`${getTypeColor(material.type)} px-3 py-1 rounded-full text-xs font-medium`}>
            {material.type.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-2">{material.title}</h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {material.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {material.dimensions && (
            <span className="flex items-center gap-1">
              📐 {material.dimensions}
            </span>
          )}
          {material.fileSize && (
            <span className="flex items-center gap-1">
              💾 {formatFileSize(material.fileSize)}
            </span>
          )}
        </div>

        {/* Tags */}
        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {material.tags.slice(0, 3).map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span>↓ {material.downloadCount || 0} downloads</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {material.content && (
            <button
              onClick={() => {
                // Show content in modal or copy to clipboard
                navigator.clipboard.writeText(material.content);
                alert('Content copied to clipboard!');
              }}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all font-medium"
            >
              Copy
            </button>
          )}
          <button
            onClick={onDownload}
            className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all font-medium"
          >
            {material.fileUrl ? 'Download' : 'View'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Brand Kit Dashboard
 * Main interface for managing brand assets, colors, fonts, and guidelines
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ColorPaletteManager from './components/ColorPaletteManager';
import TypographyManager from './components/TypographyManager';
import LogoLibrary from './components/LogoLibrary';
import AssetLibrary from './components/AssetLibrary';
import BrandGuidelines from './components/BrandGuidelines';

const TABS = [
  { id: 'colors', label: 'Colors', icon: '🎨' },
  { id: 'typography', label: 'Typography', icon: '📝' },
  { id: 'logos', label: 'Logos', icon: '🏷️' },
  { id: 'assets', label: 'Assets', icon: '📁' },
  { id: 'guidelines', label: 'Guidelines', icon: '📖' }
];

export default function BrandKitDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [brandKit, setBrandKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('colors');
  const [isEditingName, setIsEditingName] = useState(false);
  const [kitName, setKitName] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (id) {
      loadBrandKit();
    }
  }, [id]);

  const loadBrandKit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/brand-kits/${id}`);
      const data = await response.json();

      if (data.success) {
        setBrandKit(data.brandKit);
        setKitName(data.brandKit.name);
      } else {
        alert('Brand kit not found');
        navigate('/brand-kits');
      }
    } catch (error) {
      console.error('Error loading brand kit:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBrandKit = async (updates) => {
    try {
      const response = await fetch(`/api/brand-kits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (data.success) {
        setBrandKit(data.brandKit);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating brand kit:', error);
      return false;
    }
  };

  const saveName = async () => {
    if (kitName.trim() !== brandKit.name) {
      await updateBrandKit({ name: kitName });
    }
    setIsEditingName(false);
  };

  const applyToAllContent = async () => {
    try {
      const response = await fetch(`/api/brand-kits/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targets: ['websites', 'emails', 'presentations']
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Brand kit applied to all content successfully!');
        setShowApplyModal(false);
      }
    } catch (error) {
      console.error('Error applying brand kit:', error);
      alert('Error applying brand kit');
    }
  };

  const exportCSS = async () => {
    try {
      const response = await fetch(`/api/brand-kits/${id}/export/css`);
      const css = await response.text();

      const blob = new Blob([css], { type: 'text/css' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brandKit.name}-variables.css`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSS:', error);
    }
  };

  const exportJSON = async () => {
    try {
      const response = await fetch(`/api/brand-kits/${id}/export/json`);
      const json = await response.json();

      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brandKit.name}-brand-kit.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
    }
  };

  const duplicateBrandKit = async () => {
    try {
      const response = await fetch('/api/brand-kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${brandKit.name} (Copy)`,
          colors: brandKit.colors,
          fonts: brandKit.fonts,
          logos: brandKit.logos,
          guidelines: brandKit.guidelines
        })
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/brand-kit/${data.brandKit.id}`);
      }
    } catch (error) {
      console.error('Error duplicating brand kit:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading brand kit...
      </div>
    );
  }

  if (!brandKit) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Brand Kit Not Found</h2>
          <button
            onClick={() => navigate('/brand-kits')}
            className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 mt-4"
          >
            Back to Brand Kits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/brand-kits')}
            className="text-gray-400 hover:text-white mb-2"
          >
            ← Back to Brand Kits
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isEditingName ? (
                <input
                  type="text"
                  value={kitName}
                  onChange={(e) => setKitName(e.target.value)}
                  onBlur={saveName}
                  onKeyPress={(e) => e.key === 'Enter' && saveName()}
                  autoFocus
                  className="text-3xl font-bold bg-gray-700 border border-gray-600 rounded px-3 py-1 outline-none focus:border-orange-500"
                />
              ) : (
                <h1
                  onClick={() => setIsEditingName(true)}
                  className="text-3xl font-bold cursor-pointer hover:text-orange-500"
                  title="Click to edit"
                >
                  {brandKit.name}
                </h1>
              )}

              {brandKit.isPrimary && (
                <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                  Primary
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 text-sm font-bold"
              >
                ⚡ Apply to All Content
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm font-bold"
                >
                  Export ▼
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded shadow-lg z-10">
                    <button
                      onClick={() => { exportCSS(); setShowExportMenu(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-600"
                    >
                      Export as CSS
                    </button>
                    <button
                      onClick={() => { exportJSON(); setShowExportMenu(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-600"
                    >
                      Export as JSON
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
              >
                Share
              </button>

              <button
                onClick={duplicateBrandKit}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-orange-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'colors' && (
          <ColorPaletteManager
            brandKit={brandKit}
            onUpdate={updateBrandKit}
          />
        )}

        {activeTab === 'typography' && (
          <TypographyManager
            brandKit={brandKit}
            onUpdate={updateBrandKit}
          />
        )}

        {activeTab === 'logos' && (
          <LogoLibrary
            brandKit={brandKit}
            onUpdate={updateBrandKit}
          />
        )}

        {activeTab === 'assets' && (
          <AssetLibrary
            brandKit={brandKit}
            onRefresh={loadBrandKit}
          />
        )}

        {activeTab === 'guidelines' && (
          <BrandGuidelines
            brandKit={brandKit}
            onRefresh={loadBrandKit}
          />
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Apply Brand Kit</h2>
            <p className="text-gray-300 mb-4">
              This will apply your brand colors, fonts, and logos to all content across your platform:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
              <li>Website pages</li>
              <li>Email templates</li>
              <li>Presentations</li>
              <li>Social media graphics</li>
              <li>Documents</li>
            </ul>
            <p className="text-sm text-gray-400 mb-6">
              This action can be undone from the content editor.
            </p>
            <div className="flex gap-3">
              <button
                onClick={applyToAllContent}
                className="flex-1 px-6 py-2 bg-green-500 rounded hover:bg-green-600"
              >
                Apply Now
              </button>
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Share Brand Kit</h2>
            <p className="text-gray-300 mb-4">
              Generate a shareable link to allow others to view your brand kit.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2">Permissions</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2">
                  <option value="VIEW">View Only</option>
                  <option value="EDIT">Can Edit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Password (optional)</label>
                <input
                  type="password"
                  placeholder="Leave empty for no password"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-6 py-2 bg-orange-500 rounded hover:bg-orange-600"
              >
                Generate Link
              </button>
              <button
                onClick={() => setShowShareModal(false)}
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

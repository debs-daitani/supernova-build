/**
 * Logo Library
 * Manage brand logos and variations
 */

import { useState } from 'react';

const LOGO_TYPES = [
  'Primary', 'Secondary', 'Icon', 'White', 'Black', 'Favicon'
];

export default function LogoLibrary({ brandKit, onUpdate }) {
  const [logos, setLogos] = useState(brandKit.logos || []);
  const [showLogoForm, setShowLogoForm] = useState(false);
  const [logoForm, setLogoForm] = useState({
    type: 'Primary',
    url: '',
    usage: ''
  });

  const addLogo = async () => {
    const updatedLogos = [...logos, logoForm];
    setLogos(updatedLogos);

    const success = await onUpdate({ logos: updatedLogos });

    if (success) {
      setShowLogoForm(false);
      setLogoForm({ type: 'Primary', url: '', usage: '' });
    }
  };

  const deleteLogo = async (index) => {
    if (!confirm('Are you sure you want to delete this logo?')) return;

    const updatedLogos = logos.filter((_, i) => i !== index);
    setLogos(updatedLogos);
    await onUpdate({ logos: updatedLogos });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Logo Library</h2>
          <p className="text-gray-400">Manage your brand logos and variations</p>
        </div>

        <button
          onClick={() => setShowLogoForm(true)}
          className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600"
        >
          + Add Logo
        </button>
      </div>

      {logos.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">🏷️</div>
          <h3 className="text-xl font-bold mb-2">No Logos Yet</h3>
          <p className="text-gray-400 mb-4">Upload your brand logos and variations</p>
          <button
            onClick={() => setShowLogoForm(true)}
            className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600"
          >
            Upload Logo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {logos.map((logo, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">{logo.type} Logo</h3>
                <button
                  onClick={() => deleteLogo(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>

              <div className="bg-gray-700 rounded h-40 mb-4 flex items-center justify-center">
                {logo.url ? (
                  <img src={logo.url} alt={logo.type} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-gray-500 text-4xl">🏷️</div>
                )}
              </div>

              {logo.usage && (
                <p className="text-sm text-gray-400">{logo.usage}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Logo Modal */}
      {showLogoForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Logo</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Logo Type</label>
                <select
                  value={logoForm.type}
                  onChange={(e) => setLogoForm({ ...logoForm, type: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                >
                  {LOGO_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Logo URL</label>
                <input
                  type="url"
                  value={logoForm.url}
                  onChange={(e) => setLogoForm({ ...logoForm, url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Upload your logo to file storage first, then paste the URL here
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Usage Guidelines</label>
                <textarea
                  value={logoForm.usage}
                  onChange={(e) => setLogoForm({ ...logoForm, usage: e.target.value })}
                  placeholder="Minimum size: 120px wide"
                  rows={2}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addLogo}
                disabled={!logoForm.url}
                className="flex-1 px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                Add Logo
              </button>
              <button
                onClick={() => setShowLogoForm(false)}
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

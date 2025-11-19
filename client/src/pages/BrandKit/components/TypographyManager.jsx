/**
 * Typography Manager
 * Manage brand fonts and typography settings
 */

import { useState } from 'react';

const GOOGLE_FONTS = [
  'Montserrat', 'Open Sans', 'Roboto', 'Lato', 'Poppins',
  'Inter', 'Raleway', 'Nunito', 'Playfair Display', 'Merriweather'
];

const FONT_WEIGHTS = ['300', '400', '500', '600', '700', '800', '900'];

export default function TypographyManager({ brandKit, onUpdate }) {
  const [fonts, setFonts] = useState(brandKit.fonts || []);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [editingFont, setEditingFont] = useState(null);
  const [fontForm, setFontForm] = useState({
    name: 'Primary',
    family: 'Montserrat',
    weights: ['400', '700'],
    usage: 'Headings and titles'
  });

  const openFontPicker = (font = null) => {
    if (font) {
      setEditingFont(font);
      setFontForm(font);
    } else {
      setEditingFont(null);
      setFontForm({
        name: fonts.length === 0 ? 'Primary' : fonts.length === 1 ? 'Secondary' : 'Accent',
        family: 'Montserrat',
        weights: ['400', '700'],
        usage: ''
      });
    }
    setShowFontPicker(true);
  };

  const saveFont = async () => {
    let updatedFonts;

    if (editingFont) {
      updatedFonts = fonts.map(f => f.name === editingFont.name ? fontForm : f);
    } else {
      updatedFonts = [...fonts, fontForm];
    }

    setFonts(updatedFonts);
    const success = await onUpdate({ fonts: updatedFonts });

    if (success) {
      setShowFontPicker(false);
      setEditingFont(null);
    }
  };

  const deleteFont = async (name) => {
    if (!confirm('Are you sure you want to delete this font?')) return;

    const updatedFonts = fonts.filter(f => f.name !== name);
    setFonts(updatedFonts);
    await onUpdate({ fonts: updatedFonts });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Typography</h2>
          <p className="text-gray-400">Manage your brand fonts</p>
        </div>

        <button
          onClick={() => openFontPicker()}
          className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600"
        >
          + Add Font
        </button>
      </div>

      {fonts.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold mb-2">No Fonts Yet</h3>
          <p className="text-gray-400 mb-4">Add fonts to define your brand typography</p>
          <button
            onClick={() => openFontPicker()}
            className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600"
          >
            Add Your First Font
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {fonts.map(font => (
            <div key={font.name} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{font.name} Font</h3>
                  <p className="text-sm text-gray-400">{font.family}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openFontPicker(font)}
                    className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteFont(font.name)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div style={{ fontFamily: font.family }}>
                  <div className="text-4xl font-bold mb-2">The Quick Brown Fox</div>
                  <div className="text-2xl mb-2">Jumps Over The Lazy Dog</div>
                  <div className="text-base">ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789</div>
                </div>

                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Weights:</span> {font.weights.join(', ')}
                  </div>
                  {font.usage && (
                    <div>
                      <span className="text-gray-400">Usage:</span> {font.usage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Font Picker Modal */}
      {showFontPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingFont ? 'Edit Font' : 'Add Font'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Font Name</label>
                <input
                  type="text"
                  value={fontForm.name}
                  onChange={(e) => setFontForm({ ...fontForm, name: e.target.value })}
                  placeholder="e.g., Primary, Secondary, Body"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Font Family</label>
                <select
                  value={fontForm.family}
                  onChange={(e) => setFontForm({ ...fontForm, family: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                >
                  {GOOGLE_FONTS.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Font Weights</label>
                <div className="grid grid-cols-4 gap-2">
                  {FONT_WEIGHTS.map(weight => (
                    <label key={weight} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fontForm.weights.includes(weight)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFontForm({ ...fontForm, weights: [...fontForm.weights, weight] });
                          } else {
                            setFontForm({ ...fontForm, weights: fontForm.weights.filter(w => w !== weight) });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span>{weight}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Usage</label>
                <input
                  type="text"
                  value={fontForm.usage}
                  onChange={(e) => setFontForm({ ...fontForm, usage: e.target.value })}
                  placeholder="e.g., Headings and titles"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Preview</label>
                <div className="bg-gray-700 rounded p-6" style={{ fontFamily: fontForm.family }}>
                  <div className="text-3xl font-bold mb-2">The Quick Brown Fox</div>
                  <div className="text-lg">Jumps Over The Lazy Dog</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveFont}
                disabled={!fontForm.name || !fontForm.family}
                className="flex-1 px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {editingFont ? 'Save Changes' : 'Add Font'}
              </button>
              <button
                onClick={() => setShowFontPicker(false)}
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

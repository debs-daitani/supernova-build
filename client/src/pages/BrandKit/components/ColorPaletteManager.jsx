/**
 * Color Palette Manager
 * Manage brand colors with color picker, contrast checker, and palette generator
 */

import { useState } from 'react';

export default function ColorPaletteManager({ brandKit, onUpdate }) {
  const [colors, setColors] = useState(brandKit.colors || []);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [colorForm, setColorForm] = useState({
    name: '',
    hex: '#FF6B35',
    usage: ''
  });
  const [contrastCheck, setContrastCheck] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#FF6B35');
  const [generatedPalette, setGeneratedPalette] = useState(null);

  const hexToRGB = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const openColorPicker = (color = null) => {
    if (color) {
      setEditingColor(color);
      setColorForm({
        name: color.name,
        hex: color.hex,
        usage: color.usage || ''
      });
    } else {
      setEditingColor(null);
      setColorForm({
        name: '',
        hex: '#FF6B35',
        usage: ''
      });
    }
    setShowColorPicker(true);
  };

  const saveColor = async () => {
    const rgb = hexToRGB(colorForm.hex);

    const newColor = {
      ...colorForm,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    };

    let updatedColors;

    if (editingColor) {
      updatedColors = colors.map(c =>
        c.hex === editingColor.hex ? newColor : c
      );
    } else {
      updatedColors = [...colors, newColor];
    }

    setColors(updatedColors);

    const success = await onUpdate({ colors: updatedColors });

    if (success) {
      setShowColorPicker(false);
      setEditingColor(null);
    }
  };

  const deleteColor = async (hex) => {
    if (!confirm('Are you sure you want to delete this color?')) return;

    const updatedColors = colors.filter(c => c.hex !== hex);
    setColors(updatedColors);
    await onUpdate({ colors: updatedColors });
  };

  const checkColorContrast = async (color1, color2) => {
    try {
      const response = await fetch('/api/brand-kits/tools/check-contrast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color1, color2 })
      });

      const data = await response.json();

      if (data.success) {
        setContrastCheck(data);
      }
    } catch (error) {
      console.error('Error checking contrast:', error);
    }
  };

  const generatePalette = async () => {
    try {
      const response = await fetch('/api/brand-kits/tools/generate-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryColor })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedPalette(data.palette);
      }
    } catch (error) {
      console.error('Error generating palette:', error);
    }
  };

  const applyGeneratedPalette = async () => {
    if (!generatedPalette) return;

    setColors(generatedPalette);
    await onUpdate({ colors: generatedPalette });
    setGeneratedPalette(null);
    setShowGenerator(false);
  };

  const copyHex = (hex) => {
    navigator.clipboard.writeText(hex);
    alert(`Copied ${hex} to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Color Palette</h2>
          <p className="text-gray-400">Manage your brand colors</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowGenerator(true)}
            className="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600"
          >
            ✨ Generate Palette
          </button>
          <button
            onClick={() => openColorPicker()}
            className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600"
          >
            + Add Color
          </button>
        </div>
      </div>

      {/* Colors Grid */}
      {colors.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-bold mb-2">No Colors Yet</h3>
          <p className="text-gray-400 mb-4">
            Add colors to your palette or generate one automatically
          </p>
          <button
            onClick={() => setShowGenerator(true)}
            className="px-6 py-2 bg-purple-500 rounded hover:bg-purple-600"
          >
            Generate Palette
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colors.map(color => (
            <ColorCard
              key={color.hex}
              color={color}
              onEdit={() => openColorPicker(color)}
              onDelete={() => deleteColor(color.hex)}
              onCopyHex={() => copyHex(color.hex)}
              onCheckContrast={(otherColor) => checkColorContrast(color.hex, otherColor)}
            />
          ))}
        </div>
      )}

      {/* Contrast Checker Result */}
      {contrastCheck && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Contrast Check Result</h3>
            <button
              onClick={() => setContrastCheck(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Contrast Ratio</div>
              <div className="text-3xl font-bold">{contrastCheck.ratio}:1</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${contrastCheck.passAA ? '✅' : '❌'}`}>
                {contrastCheck.passAA ? '✅' : '❌'}
              </span>
              <span>WCAG AA (Normal Text) - {contrastCheck.passAA ? 'Pass' : 'Fail'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${contrastCheck.passAAA ? '✅' : '❌'}`}>
                {contrastCheck.passAAA ? '✅' : '❌'}
              </span>
              <span>WCAG AAA (Normal Text) - {contrastCheck.passAAA ? 'Pass' : 'Fail'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${contrastCheck.passAALarge ? '✅' : '❌'}`}>
                {contrastCheck.passAALarge ? '✅' : '❌'}
              </span>
              <span>WCAG AA (Large Text) - {contrastCheck.passAALarge ? 'Pass' : 'Fail'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingColor ? 'Edit Color' : 'Add Color'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Color Name</label>
                <input
                  type="text"
                  value={colorForm.name}
                  onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
                  placeholder="e.g., Primary, Secondary, Accent"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={colorForm.hex}
                    onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })}
                    className="w-20 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colorForm.hex}
                    onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })}
                    placeholder="#FF6B35"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Usage Notes</label>
                <textarea
                  value={colorForm.usage}
                  onChange={(e) => setColorForm({ ...colorForm, usage: e.target.value })}
                  placeholder="e.g., Use for CTAs and headlines"
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500"
                />
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-bold mb-2">Preview</label>
                <div
                  className="w-full h-24 rounded flex items-center justify-center font-bold text-lg"
                  style={{ backgroundColor: colorForm.hex }}
                >
                  <span style={{ color: colorForm.hex === '#FFFFFF' ? '#000' : '#FFF' }}>
                    {colorForm.name || 'Preview'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveColor}
                disabled={!colorForm.name || !colorForm.hex}
                className="flex-1 px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {editingColor ? 'Save Changes' : 'Add Color'}
              </button>
              <button
                onClick={() => setShowColorPicker(false)}
                className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Palette Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Generate Color Palette</h2>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Primary Brand Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 outline-none focus:border-orange-500 font-mono"
                />
                <button
                  onClick={generatePalette}
                  className="px-6 py-2 bg-purple-500 rounded hover:bg-purple-600"
                >
                  Generate
                </button>
              </div>
            </div>

            {generatedPalette && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">Generated Palette</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {generatedPalette.map((color, index) => (
                      <div key={index} className="text-center">
                        <div
                          className="w-full h-24 rounded mb-2"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="text-sm font-bold">{color.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{color.hex}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={applyGeneratedPalette}
                    className="flex-1 px-6 py-2 bg-green-500 rounded hover:bg-green-600"
                  >
                    Apply This Palette
                  </button>
                  <button
                    onClick={() => { setGeneratedPalette(null); setShowGenerator(false); }}
                    className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {!generatedPalette && (
              <button
                onClick={() => setShowGenerator(false)}
                className="w-full px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ColorCard({ color, onEdit, onDelete, onCopyHex, onCheckContrast }) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Color Swatch */}
      <div
        className="h-32 flex items-center justify-center cursor-pointer"
        style={{ backgroundColor: color.hex }}
        onClick={onCopyHex}
        title="Click to copy hex"
      >
        <div className="text-center">
          <div
            className="text-2xl font-bold mb-1"
            style={{ color: color.hex === '#FFFFFF' ? '#000' : '#FFF' }}
          >
            {color.name}
          </div>
          <div
            className="text-sm font-mono"
            style={{ color: color.hex === '#FFFFFF' ? '#000' : '#FFF', opacity: 0.8 }}
          >
            {color.hex}
          </div>
        </div>
      </div>

      {/* Color Info */}
      <div className="p-4">
        <div className="text-xs text-gray-400 mb-2">RGB</div>
        <div className="text-sm font-mono mb-3">{color.rgb}</div>

        {color.usage && (
          <>
            <div className="text-xs text-gray-400 mb-1">Usage</div>
            <div className="text-sm text-gray-300 mb-3">{color.usage}</div>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

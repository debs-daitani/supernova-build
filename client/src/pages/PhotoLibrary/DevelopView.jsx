/**
 * Photo Develop/Edit View
 * Non-destructive editing interface with all adjustment panels
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function DevelopView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [settings, setSettings] = useState(null);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPhoto();
    loadPresets();
  }, [id]);

  const loadPhoto = async () => {
    try {
      setLoading(true);
      const [photoRes, editRes] = await Promise.all([
        fetch(`/api/photos/${id}`),
        fetch(`/api/photos/${id}/edit`)
      ]);

      const photoData = await photoRes.json();
      const editData = await editRes.json();

      setPhoto(photoData.photo);
      setSettings(editData.currentEdit);
    } catch (error) {
      console.error('Error loading photo:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPresets = async () => {
    try {
      const response = await fetch('/api/presets');
      const data = await response.json();
      setPresets(data.presets || []);
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const saveEdits = async () => {
    try {
      setSaving(true);
      await fetch(`/api/photos/${id}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
    } catch (error) {
      console.error('Error saving edits:', error);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = async (presetId) => {
    try {
      const response = await fetch(`/api/presets/${presetId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds: id })
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error applying preset:', error);
    }
  };

  const resetToOriginal = async () => {
    try {
      await fetch(`/api/photos/${id}/revert`, { method: 'POST' });
      loadPhoto();
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  const autoEnhance = async () => {
    try {
      const response = await fetch(`/api/photos/${id}/auto-enhance`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error auto-enhancing:', error);
    }
  };

  if (loading || !photo || !settings) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar - Presets & History */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-4">
          {/* Back Button */}
          <button
            onClick={() => navigate('/photos')}
            className="w-full mb-4 px-3 py-2 text-left hover:bg-gray-700 rounded"
          >
            ← Back to Library
          </button>

          {/* Presets */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-400 mb-2">Presets</h3>
            <div className="space-y-1">
              {presets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 rounded"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={autoEnhance}
              className="w-full bg-orange-500 px-3 py-2 rounded hover:bg-orange-600"
            >
              Auto Enhance
            </button>
            <button
              onClick={resetToOriginal}
              className="w-full bg-gray-700 px-3 py-2 rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBeforeAfter(!showBeforeAfter)}
              className={`px-4 py-2 rounded ${showBeforeAfter ? 'bg-orange-500' : 'bg-gray-700'}`}
            >
              Before/After (Y)
            </button>
            <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">
              Crop (R)
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={saveEdits}
              disabled={saving}
              className="bg-green-500 px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => navigate('/photos/export')}
              className="bg-orange-500 px-6 py-2 rounded hover:bg-orange-600"
            >
              Export
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center bg-black p-8 overflow-auto">
          {showBeforeAfter ? (
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="text-center mb-2 text-gray-400">Before</div>
                <img
                  src={photo.fileUrl}
                  alt="Before"
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="text-center mb-2 text-gray-400">After</div>
                <img
                  src={photo.fileUrl}
                  alt="After"
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            </div>
          ) : (
            <img
              src={photo.fileUrl}
              alt={photo.fileName}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      </div>

      {/* Right Sidebar - Editing Panels */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto p-4 space-y-6">
        {/* Basic Adjustments */}
        <Panel title="Basic">
          <Slider
            label="Exposure"
            value={settings.exposure}
            onChange={(v) => updateSetting('exposure', v)}
            min={-100}
            max={100}
          />
          <Slider
            label="Contrast"
            value={settings.contrast}
            onChange={(v) => updateSetting('contrast', v)}
            min={-100}
            max={100}
          />
          <Slider
            label="Highlights"
            value={settings.highlights}
            onChange={(v) => updateSetting('highlights', v)}
            min={-100}
            max={100}
          />
          <Slider
            label="Shadows"
            value={settings.shadows}
            onChange={(v) => updateSetting('shadows', v)}
            min={-100}
            max={100}
          />
          <Slider
            label="Whites"
            value={settings.whites}
            onChange={(v) => updateSetting('whites', v)}
            min={-100}
            max={100}
          />
          <Slider
            label="Blacks"
            value={settings.blacks}
            onChange={(v) => updateSetting('blacks', v)}
            min={-100}
            max={100}
          />
          <Slider
            label="Clarity"
            value={settings.clarity}
            onChange={(v) => updateSetting('clarity', v)}
            min={-100}
            max={100}
          />
          <Slider
            label="Vibrance"
            value={settings.vibrance}
            onChange={(v) => updateSetting('vibrance', v)}
            min={-100}
            max={100}
          />
          <Slider
            label="Saturation"
            value={settings.saturation}
            onChange={(v) => updateSetting('saturation', v)}
            min={-100}
            max={100}
          />
        </Panel>

        {/* White Balance */}
        <Panel title="White Balance">
          <Slider
            label="Temperature"
            value={settings.temperature}
            onChange={(v) => updateSetting('temperature', v)}
            min={-100}
            max={100}
          />
          <Slider
            label="Tint"
            value={settings.tint}
            onChange={(v) => updateSetting('tint', v)}
            min={-100}
            max={100}
          />
        </Panel>

        {/* Detail */}
        <Panel title="Detail">
          <Slider
            label="Sharpening"
            value={settings.sharpening?.amount || 0}
            onChange={(v) => updateSetting('sharpening', { ...settings.sharpening, amount: v })}
            min={0}
            max={100}
          />
          <Slider
            label="Noise Reduction"
            value={settings.noiseReduction?.luminance || 0}
            onChange={(v) => updateSetting('noiseReduction', { ...settings.noiseReduction, luminance: v })}
            min={0}
            max={100}
          />
        </Panel>

        {/* Effects */}
        <Panel title="Effects">
          <Slider
            label="Vignette"
            value={settings.effects?.vignette || 0}
            onChange={(v) => updateSetting('effects', { ...settings.effects, vignette: v })}
            min={-100}
            max={100}
          />
          <Slider
            label="Grain"
            value={settings.effects?.grain || 0}
            onChange={(v) => updateSetting('effects', { ...settings.effects, grain: v })}
            min={0}
            max={100}
          />
          <Slider
            label="Dehaze"
            value={settings.effects?.dehaze || 0}
            onChange={(v) => updateSetting('effects', { ...settings.effects, dehaze: v })}
            min={-100}
            max={100}
          />
        </Panel>

        {/* Transform */}
        <Panel title="Transform">
          <Slider
            label="Rotation"
            value={settings.transform?.rotation || 0}
            onChange={(v) => updateSetting('transform', { ...settings.transform, rotation: v })}
            min={-180}
            max={180}
          />
          <Slider
            label="Vertical"
            value={settings.transform?.verticalPerspective || 0}
            onChange={(v) => updateSetting('transform', { ...settings.transform, verticalPerspective: v })}
            min={-100}
            max={100}
          />
          <Slider
            label="Horizontal"
            value={settings.transform?.horizontalPerspective || 0}
            onChange={(v) => updateSetting('transform', { ...settings.transform, horizontalPerspective: v })}
            min={-100}
            max={100}
          />
        </Panel>

        {/* Grayscale */}
        <Panel title="Black & White">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.grayscale || false}
              onChange={(e) => updateSetting('grayscale', e.target.checked)}
              className="w-4 h-4"
            />
            <span>Convert to B&W</span>
          </label>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-gray-700 rounded">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left font-bold flex items-center justify-between hover:bg-gray-700"
      >
        <span>{title}</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="p-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

function Slider({ label, value, onChange, min, max }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );
}

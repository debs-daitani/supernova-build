'use client';

import { useState, useEffect } from 'react';
import { X, Zap, Link2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { GigVibe, Tour } from '@/lib/types';
import { getTours, addAction, createAction } from '@/lib/tours';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  defaultTourId?: string | null;
}

export default function QuickActionModal({ isOpen, onClose, onCreated, defaultTourId }: QuickActionModalProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    tourId: defaultTourId ?? '',
    gigVibe: 'medium' as GigVibe,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    estimatedHours: 1,
    scheduledDate: new Date().toISOString().split('T')[0],
    links: [] as string[],
  });
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loadedTours = getTours().filter(t => !t.isArchived);
      setTours(loadedTours);
      if (defaultTourId) {
        setForm(f => ({ ...f, tourId: defaultTourId }));
      }
    }
  }, [isOpen, defaultTourId]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) return;

    const newAction = createAction({
      title: form.title,
      description: form.description,
      tourId: form.tourId || null,
      gigVibe: form.gigVibe,
      difficulty: form.difficulty,
      estimatedHours: form.estimatedHours,
      scheduledDate: form.scheduledDate,
      links: form.links,
    });

    addAction(newAction);

    // Reset form
    setForm({
      title: '',
      description: '',
      tourId: '',
      gigVibe: 'medium',
      difficulty: 'medium',
      estimatedHours: 1,
      scheduledDate: new Date().toISOString().split('T')[0],
      links: [],
    });
    setNewLink('');

    onCreated?.();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-16 pb-8 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-dark-grey-azure rounded-2xl border border-neon-cyan/30 max-w-md w-full my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-cyan/20">
              <Zap className="w-5 h-5 text-neon-cyan" />
            </div>
            <h2 className="text-xl font-supernova text-white">Quick Action</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Action Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Action Name <span className="text-magenta">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What do you need to do?"
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none"
              autoFocus
            />
          </div>

          {/* The Lyrics (Description) */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">The Lyrics</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Notes, details..."
              rows={3}
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none resize-none"
            />
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-gray-400" />
              Links
            </label>
            <div className="space-y-2">
              {form.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-neon-cyan text-sm truncate hover:border-neon-cyan transition-colors"
                  >
                    {link}
                  </a>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, links: form.links.filter((_, i) => i !== index) })}
                    className="p-2 text-gray-400 hover:text-magenta transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newLink.trim()) {
                      e.preventDefault();
                      setForm({ ...form, links: [...form.links, newLink.trim()] });
                      setNewLink('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newLink.trim()) {
                      setForm({ ...form, links: [...form.links, newLink.trim()] });
                      setNewLink('');
                    }
                  }}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add Google Drive, Notion, or any URLs
            </p>
          </div>

          {/* Link to Tour */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-gray-400" />
              Link to Tour
            </label>
            <select
              value={form.tourId}
              onChange={(e) => setForm({ ...form, tourId: e.target.value })}
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-neon-cyan focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">No Tour (Loose Action)</option>
              {tours.map((tour) => (
                <option key={tour.id} value={tour.id}>
                  {tour.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Link this action to an existing tour, or leave as a loose action
            </p>
          </div>

          {/* Gig Vibe Needed */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Gig Vibe Needed</label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as GigVibe[]).map((vibe) => (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => setForm({ ...form, gigVibe: vibe })}
                  className={`flex-1 py-2 rounded-lg font-semibold capitalize transition-all ${
                    form.gigVibe === vibe
                      ? vibe === 'high'
                        ? 'bg-vivid-yellow-green text-black'
                        : vibe === 'medium'
                        ? 'bg-magenta text-white'
                        : 'bg-neon-cyan text-black'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {vibe}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setForm({ ...form, difficulty: diff })}
                  className={`flex-1 py-2 rounded-lg font-semibold capitalize transition-all ${
                    form.difficulty === diff
                      ? 'bg-magenta text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Estimated Hours</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={form.estimatedHours}
              onChange={(e) => setForm({ ...form, estimatedHours: parseFloat(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
            />
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Scheduled Date</label>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim()}
            className="flex-1 py-3 rounded-xl bg-neon-cyan text-black font-bold hover:bg-magenta hover:shadow-[0_0_30px_rgba(255,0,142,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Action
          </button>
        </div>
      </div>
    </div>
  );
}

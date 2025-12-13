'use client';

import { useState, useEffect } from 'react';
import { X, Edit3, Link2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { GigVibe, Tour, Action } from '@/lib/types';
import { getTours, updateAction, deleteAction } from '@/lib/tours';

interface ActionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  action: Action | null;
}

export default function ActionEditModal({ isOpen, onClose, onUpdated, action }: ActionEditModalProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    tourId: '',
    gigVibe: 'medium' as GigVibe,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    estimatedHours: 1,
    scheduledDate: new Date().toISOString().split('T')[0],
    links: [] as string[],
  });
  const [newLink, setNewLink] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && action) {
      const loadedTours = getTours().filter(t => !t.isArchived);
      setTours(loadedTours);
      setForm({
        title: action.title,
        description: action.description || '',
        tourId: action.tourId || '',
        gigVibe: action.gigVibe,
        difficulty: action.difficulty,
        estimatedHours: action.estimatedHours,
        scheduledDate: action.scheduledDate || new Date().toISOString().split('T')[0],
        links: action.links || [],
      });
    }
  }, [isOpen, action]);

  if (!isOpen || !action) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) return;

    updateAction(action.id, {
      title: form.title,
      description: form.description,
      tourId: form.tourId || null,
      gigVibe: form.gigVibe,
      difficulty: form.difficulty,
      estimatedHours: form.estimatedHours,
      scheduledDate: form.scheduledDate,
      links: form.links,
    });

    onUpdated?.();
  };

  const handleDelete = () => {
    deleteAction(action.id);
    setShowDeleteConfirm(false);
    onUpdated?.();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-16 pb-8 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-dark-grey-azure rounded-2xl border border-magenta/30 max-w-md w-full my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-magenta/20">
              <Edit3 className="w-5 h-5 text-magenta" />
            </div>
            <h2 className="text-xl font-supernova text-white">Edit Action</h2>
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
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
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
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none resize-none"
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
                    className="flex-1 px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-neon-cyan text-sm truncate hover:border-magenta transition-colors"
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
                  className="flex-1 px-4 py-2 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none text-sm"
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
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none appearance-none cursor-pointer"
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
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
            />
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Scheduled Date</label>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
            />
          </div>

          {/* Delete Section */}
          <div className="pt-4 border-t border-white/10">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
              >
                Delete this action
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-400 mb-3 text-center">Are you sure? This can't be undone.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 rounded-lg border border-white/20 text-white text-sm font-semibold hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
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
            className="flex-1 py-3 rounded-xl bg-magenta text-white font-bold hover:bg-neon-cyan hover:text-black hover:shadow-[0_0_30px_rgba(0,240,233,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

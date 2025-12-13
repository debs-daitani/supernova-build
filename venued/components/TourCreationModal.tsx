'use client';

import { useState } from 'react';
import { X, Music, FileEdit, Rocket, Star, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { TourStage, GigVibe } from '@/lib/types';
import { addTour, addAction, createTour, createAction } from '@/lib/tours';

interface TourCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const STAGE_OPTIONS: { value: TourStage; label: string; description: string; icon: any; color: string }[] = [
  { value: 'planning', label: 'Planning', description: 'Mapping it out', icon: FileEdit, color: 'azure' },
  { value: 'development', label: 'Development', description: 'Building momentum', icon: Music, color: 'magenta' },
  { value: 'launch', label: 'Launch', description: 'Going live!', icon: Rocket, color: 'vivid-yellow-green' },
];

export default function TourCreationModal({ isOpen, onClose, onCreated }: TourCreationModalProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    stage: 'planning' as TourStage,
    targetDate: '',
    firstActionTitle: '',
    firstActionGigVibe: 'medium' as GigVibe,
    links: [] as string[],
  });
  const [newLink, setNewLink] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.name.trim()) return;

    // Create the tour
    const newTour = createTour({
      name: form.name,
      description: form.description,
      stage: form.stage,
      targetDate: form.targetDate || undefined,
      links: form.links,
    });

    addTour(newTour);

    // Create the first action if provided
    if (form.firstActionTitle.trim()) {
      const newAction = createAction({
        title: form.firstActionTitle,
        tourId: newTour.id,
        gigVibe: form.firstActionGigVibe,
      });
      addAction(newAction);
    }

    // Reset form
    setForm({
      name: '',
      description: '',
      stage: 'planning',
      targetDate: '',
      firstActionTitle: '',
      firstActionGigVibe: 'medium',
      links: [],
    });
    setNewLink('');

    onCreated?.();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-16 pb-8 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-dark-grey-azure rounded-2xl border border-magenta/30 max-w-lg w-full my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-magenta/20">
              <Music className="w-5 h-5 text-magenta" />
            </div>
            <h2 className="text-xl font-supernova text-white">Kick Off a Tour</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Tour Name */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Tour Name <span className="text-magenta">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Website Redesign World Tour"
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
              autoFocus
            />
          </div>

          {/* Stage Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Stage</label>
            <div className="grid grid-cols-3 gap-2">
              {STAGE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = form.stage === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm({ ...form, stage: option.value })}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      isSelected
                        ? option.value === 'planning'
                          ? 'border-azure bg-azure/20'
                          : option.value === 'development'
                          ? 'border-magenta bg-magenta/20'
                          : 'border-vivid-yellow-green bg-vivid-yellow-green/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${
                      isSelected
                        ? option.value === 'planning'
                          ? 'text-azure'
                          : option.value === 'development'
                          ? 'text-magenta'
                          : 'text-vivid-yellow-green'
                        : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* The Lyrics (Description) */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">The Lyrics</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's this tour all about? The vision, the goal..."
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

          {/* Target Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Target Launch Date</label>
            <input
              type="date"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
            />
          </div>

          {/* First Action (Optional) */}
          <div className="p-4 rounded-xl border-2 border-dashed border-white/20 bg-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-neon-cyan" />
              <label className="text-sm font-semibold text-white">First Action (optional)</label>
            </div>
            <input
              type="text"
              value={form.firstActionTitle}
              onChange={(e) => setForm({ ...form, firstActionTitle: e.target.value })}
              placeholder="What's the first step?"
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none mb-3"
            />

            {form.firstActionTitle && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Gig Vibe Needed</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as GigVibe[]).map((vibe) => (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => setForm({ ...form, firstActionGigVibe: vibe })}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm capitalize transition-all ${
                        form.firstActionGigVibe === vibe
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
            disabled={!form.name.trim()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold hover:shadow-[0_0_30px_rgba(255,0,142,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Tour
          </button>
        </div>
      </div>
    </div>
  );
}

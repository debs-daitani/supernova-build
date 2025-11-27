'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task, EnergyLevel, TaskDifficulty } from '@/lib/types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task | null;
  phaseId: string;
}

export default function TaskFormModal({ isOpen, onClose, onSave, task, phaseId }: TaskFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    energyLevel: 'medium' as EnergyLevel,
    estimatedHours: 1,
    difficulty: 'medium' as TaskDifficulty,
    isHyperfocus: false,
    isQuickWin: false,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        energyLevel: task.energyLevel,
        estimatedHours: task.estimatedHours,
        difficulty: task.difficulty,
        isHyperfocus: task.isHyperfocus,
        isQuickWin: task.isQuickWin,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        energyLevel: 'medium',
        estimatedHours: 1,
        difficulty: 'medium',
        isHyperfocus: false,
        isQuickWin: false,
      });
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      phaseId,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gray-900 rounded-2xl border-2 border-electric-purple/30 shadow-[0_0_50px_rgba(157,78,221,0.3)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 bg-black border-2 border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-neon-pink focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Any details or notes..."
              rows={3}
              className="w-full px-4 py-3 bg-black border-2 border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-neon-pink focus:outline-none resize-none"
            />
          </div>

          {/* Energy Level & Hours Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Energy Level
              </label>
              <select
                value={formData.energyLevel}
                onChange={(e) => setFormData({ ...formData, energyLevel: e.target.value as EnergyLevel })}
                className="w-full px-4 py-3 bg-black border-2 border-white/10 rounded-lg text-white focus:border-neon-pink focus:outline-none"
              >
                <option value="high">🔥 High Energy</option>
                <option value="medium">⚡ Medium Energy</option>
                <option value="low">⭐ Low Energy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-black border-2 border-white/10 rounded-lg text-white focus:border-neon-pink focus:outline-none"
              />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Difficulty
            </label>
            <div className="flex gap-3">
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: diff as TaskDifficulty })}
                  className={`
                    flex-1 py-3 rounded-lg border-2 font-semibold transition-all
                    ${formData.difficulty === diff
                      ? diff === 'easy'
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : diff === 'medium'
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                        : 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-white/10 bg-black text-gray-500 hover:border-white/20'
                    }
                  `}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* ADHD Flags */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white mb-2">
              ADHD Flags
            </label>

            {/* Hyperfocus */}
            <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-white/10 cursor-pointer hover:border-blue-500/40 bg-black">
              <input
                type="checkbox"
                checked={formData.isHyperfocus}
                onChange={(e) => setFormData({ ...formData, isHyperfocus: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-gray-600 bg-transparent checked:bg-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-white">🧠 Needs Deep Focus</div>
                <div className="text-xs text-gray-400">Requires uninterrupted concentration</div>
              </div>
            </label>

            {/* Quick Win */}
            <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-white/10 cursor-pointer hover:border-neon-green/40 bg-black">
              <input
                type="checkbox"
                checked={formData.isQuickWin}
                onChange={(e) => setFormData({ ...formData, isQuickWin: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-gray-600 bg-transparent checked:bg-neon-green"
              />
              <div className="flex-1">
                <div className="font-semibold text-white">🚀 Quick Win</div>
                <div className="text-xs text-gray-400">Easy win for motivation boost</div>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border-2 border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-neon-pink to-electric-purple text-black font-bold hover:shadow-[0_0_30px_rgba(255,27,141,0.5)] transition-all"
            >
              {task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

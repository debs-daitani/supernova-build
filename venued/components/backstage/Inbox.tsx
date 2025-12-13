'use client';

import { useState, useEffect } from 'react';
import { Inbox as InboxIcon, CheckSquare, Lightbulb, StickyNote, Trash2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addCrewTask } from '@/lib/crew';
import { CrewTask, EnergyLevel } from '@/lib/types';

interface InboxItem {
  id: number;
  text: string;
  tag: 'task' | 'idea' | 'note' | null;
  timestamp: number;
  processed: boolean;
}

interface InboxProps {
  onRefresh?: () => void;
}

export default function BackstageInbox({ onRefresh }: InboxProps) {
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    energyLevel: 'medium' as EnergyLevel,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    estimatedHours: 1,
    scheduledDate: new Date().toISOString().split('T')[0],
  });

  // Load inbox items
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('venued_inbox');
    if (stored) {
      const allItems: InboxItem[] = JSON.parse(stored);
      const unprocessed = allItems.filter(item => !item.processed);
      setItems(unprocessed);
    }
  };

  const removeItem = (itemId: number) => {
    const stored = localStorage.getItem('venued_inbox');
    if (stored) {
      const allItems: InboxItem[] = JSON.parse(stored);
      const updated = allItems.filter(item => item.id !== itemId);
      localStorage.setItem('venued_inbox', JSON.stringify(updated));
      loadItems();
    }
  };

  const handleDelete = (item: InboxItem) => {
    removeItem(item.id);
    setToast('Deleted');
    setTimeout(() => setToast(null), 2000);
  };

  const handleConvertToTask = (item: InboxItem) => {
    setSelectedItem(item);
    setTaskForm({
      ...taskForm,
      title: item.text.slice(0, 100), // Truncate for task title
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = () => {
    if (!selectedItem || !taskForm.title.trim()) return;

    const newTask: CrewTask = {
      id: `inbox-${Date.now()}`,
      title: taskForm.title,
      description: selectedItem.text.length > 100 ? selectedItem.text : '',
      phaseId: 'inbox',
      energyLevel: taskForm.energyLevel,
      difficulty: taskForm.difficulty,
      estimatedHours: taskForm.estimatedHours,
      isHyperfocus: false,
      isQuickWin: taskForm.estimatedHours <= 0.5,
      dependencies: [],
      completed: false,
      order: 0,
      createdAt: new Date().toISOString(),
      scheduledDate: taskForm.scheduledDate,
      timeSpent: 0,
    };

    addCrewTask(newTask);
    removeItem(selectedItem.id);
    setShowTaskModal(false);
    setSelectedItem(null);
    setToast('Action created!');
    setTimeout(() => setToast(null), 2000);
    if (onRefresh) onRefresh();
  };

  const handleConvertToIdea = (item: InboxItem) => {
    // Store the text to pre-fill in New Releases
    localStorage.setItem('venued_prefill_idea', item.text);
    removeItem(item.id);
    router.push('/entourage?tab=ideas');
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getTagBadge = (tag: InboxItem['tag']) => {
    switch (tag) {
      case 'task':
        return { label: 'Task', color: 'bg-magenta text-black' };
      case 'idea':
        return { label: 'Idea', color: 'bg-neon-cyan text-black' };
      case 'note':
        return { label: 'Note', color: 'bg-vivid-yellow-green text-black' };
      default:
        return { label: 'Uncategorized', color: 'bg-gray-600 text-white' };
    }
  };

  const visibleItems = showAll ? items : items.slice(0, 5);
  const hasMore = items.length > 5;

  return (
    <>
      <div className="mb-8 p-4 sm:p-6 rounded-xl border-2 border-magenta/30 bg-magenta/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <InboxIcon className="w-5 h-5 text-magenta" />
            <h3 className="text-lg font-semibold text-white">Inbox</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-magenta text-black">
              {items.length}
            </span>
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-6">
            <InboxIcon className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 font-josefin">All clear! Use the + button to capture ideas on the fly.</p>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-3">
          {visibleItems.map((item) => {
            const badge = getTagBadge(item.tag);
            const truncatedText = item.text.length > 100
              ? item.text.slice(0, 100) + '...'
              : item.text;

            return (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-[#3d3d3d]/60 border border-white/10"
              >
                {/* Top row: badge and timestamp */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>

                {/* Text */}
                <p className="text-white text-sm mb-3 font-josefin">
                  {truncatedText}
                </p>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleConvertToTask(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-magenta/20 text-magenta text-xs font-semibold hover:bg-magenta/30 transition-colors"
                  >
                    <ArrowRight className="w-3 h-3" />
                    Action
                  </button>
                  <button
                    onClick={() => handleConvertToIdea(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neon-cyan/20 text-neon-cyan text-xs font-semibold hover:bg-neon-cyan/30 transition-colors"
                  >
                    <ArrowRight className="w-3 h-3" />
                    Idea
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-gray-400 text-xs font-semibold hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More/Less button */}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-gray-400 text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show More ({items.length - 5} more)
              </>
            )}
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-dark-grey-azure border border-white/20 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4">
          <p className="text-white text-sm font-semibold">{toast}</p>
        </div>
      )}

      {/* Action Creation Modal */}
      {showTaskModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 pb-8 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-dark-grey-azure rounded-2xl border border-magenta/30 overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-supernova text-white">Create Action</h2>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedItem(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-400 hover:text-white">&times;</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Action Title */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Action Name</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-magenta/50"
                  autoFocus
                />
              </div>

              {/* Gig Vibe Needed */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Gig Vibe Needed</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setTaskForm({ ...taskForm, energyLevel: level })}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                        taskForm.energyLevel === level
                          ? level === 'high' ? 'bg-vivid-yellow-green text-black' :
                            level === 'medium' ? 'bg-magenta text-black' :
                            'bg-neon-cyan text-black'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Estimated Hours</label>
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={taskForm.estimatedHours}
                  onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: parseFloat(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white focus:outline-none focus:border-magenta/50"
                />
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Scheduled Date</label>
                <input
                  type="date"
                  value={taskForm.scheduledDate}
                  onChange={(e) => setTaskForm({ ...taskForm, scheduledDate: e.target.value })}
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white focus:outline-none focus:border-magenta/50"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex gap-3">
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedItem(null);
                }}
                className="flex-1 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTask}
                disabled={!taskForm.title.trim()}
                className="flex-1 py-3 rounded-xl bg-magenta text-black font-bold hover:bg-neon-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Action
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

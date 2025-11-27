'use client';

import { useState, useEffect } from 'react';
import { PenLine, Archive, Trash2, CheckCircle, Filter } from 'lucide-react';
import {
  getBrainDumps,
  addBrainDump,
  updateBrainDump,
  deleteBrainDump,
} from '@/lib/adhd';
import { addCrewTask } from '@/lib/crew';

type FilterType = 'all' | 'unsorted' | 'converted' | 'archived';

export default function BrainDumpSpace() {
  const [dumps, setDumps] = useState(getBrainDumps());
  const [content, setContent] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    setDumps(getBrainDumps());
  }, []);

  const handleSave = () => {
    if (!content.trim()) return;

    addBrainDump({
      content: content.trim(),
      timestamp: new Date().toISOString(),
      converted: false,
      archived: false,
    });

    setDumps(getBrainDumps());
    setContent('');
  };

  const handleConvertToTask = (id: string, dumpContent: string) => {
    // Create a crew task from the dump
    const taskId = `task-${Date.now()}`;
    addCrewTask({
      id: taskId,
      title: dumpContent.slice(0, 100),
      description: dumpContent,
      phaseId: 'inbox',
      energyLevel: 'medium',
      estimatedHours: 1,
      difficulty: 'medium',
      isHyperfocus: false,
      isQuickWin: false,
      dependencies: [],
      completed: false,
      order: 0,
      createdAt: new Date().toISOString(),
      timeSpent: 0,
    });

    updateBrainDump(id, { converted: true, convertedToTaskId: taskId });
    setDumps(getBrainDumps());
  };

  const handleArchive = (id: string) => {
    updateBrainDump(id, { archived: true });
    setDumps(getBrainDumps());
  };

  const handleDelete = (id: string) => {
    deleteBrainDump(id);
    setDumps(getBrainDumps());
  };

  const filteredDumps = dumps.filter(dump => {
    if (filter === 'unsorted') return !dump.converted && !dump.archived;
    if (filter === 'converted') return dump.converted;
    if (filter === 'archived') return dump.archived;
    return true;
  });

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: dumps.length },
    { id: 'unsorted', label: 'Unsorted', count: dumps.filter(d => !d.converted && !d.archived).length },
    { id: 'converted', label: 'Converted', count: dumps.filter(d => d.converted).length },
    { id: 'archived', label: 'Archived', count: dumps.filter(d => d.archived).length },
  ];

  return (
    <div className="space-y-6">
      {/* Brain Dump Input */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-electric-purple/20 to-neon-pink/20 border-2 border-electric-purple/30">
        <div className="flex items-center gap-3 mb-4">
          <PenLine className="w-6 h-6 text-electric-purple" />
          <h3 className="text-xl font-bold text-white">Brain Dump Space</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Just dump it here. No organizing, no pressure. Get it out of your head.
        </p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's bouncing around in your brain? Write it all down..."
          className="w-full h-40 px-4 py-3 bg-black border-2 border-white/10 rounded-lg text-white focus:border-electric-purple focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">{content.length} characters</span>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-6 py-3 bg-electric-purple rounded-lg text-white font-bold hover:bg-white hover:text-black transition-all disabled:opacity-50"
          >
            Save Dump
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === f.id
                ? 'bg-electric-purple text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Dumps List */}
      <div className="space-y-3">
        {filteredDumps.length === 0 ? (
          <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10 text-center text-gray-500">
            {filter === 'all' ? 'No brain dumps yet. Start dumping!' : `No ${filter} dumps.`}
          </div>
        ) : (
          filteredDumps.slice().reverse().map(dump => (
            <div
              key={dump.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                dump.converted
                  ? 'bg-neon-green/5 border-neon-green/30'
                  : dump.archived
                  ? 'bg-white/5 border-white/10 opacity-50'
                  : 'bg-white/5 border-white/10 hover:border-electric-purple/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white mb-2">{dump.content}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{new Date(dump.timestamp).toLocaleString()}</span>
                    {dump.converted && (
                      <span className="px-2 py-1 rounded bg-neon-green/20 text-neon-green flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Converted
                      </span>
                    )}
                    {dump.archived && (
                      <span className="px-2 py-1 rounded bg-gray-500/20 text-gray-400 flex items-center gap-1">
                        <Archive className="w-3 h-3" />
                        Archived
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!dump.converted && !dump.archived && (
                    <button
                      onClick={() => handleConvertToTask(dump.id, dump.content)}
                      className="px-3 py-2 rounded-lg bg-neon-green/20 text-neon-green text-xs font-semibold hover:bg-neon-green/30 transition-all"
                      title="Convert to task"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {!dump.archived && (
                    <button
                      onClick={() => handleArchive(dump.id)}
                      className="px-3 py-2 rounded-lg bg-gray-500/20 text-gray-400 text-xs font-semibold hover:bg-gray-500/30 transition-all"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(dump.id)}
                    className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tips */}
      <div className="p-4 rounded-xl bg-neon-pink/10 border-2 border-neon-pink/30">
        <h3 className="text-sm font-semibold text-neon-pink mb-2">💡 Brain Dump Tips</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Don't organize - just dump everything out</li>
          <li>• You can convert dumps to tasks later when you're ready</li>
          <li>• Archive cleared thoughts to keep your mind clear</li>
          <li>• This is your judgment-free zone</li>
        </ul>
      </div>
    </div>
  );
}

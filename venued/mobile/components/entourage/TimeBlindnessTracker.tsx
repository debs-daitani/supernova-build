'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { EnergyLevel } from '@/lib/types';
import {
  getTimeTrackingEntries,
  addTimeTrackingEntry,
  deleteTimeTrackingEntry,
  calculateTimeBlindnessStats,
} from '@/lib/adhd';

export default function TimeBlindnessTracker() {
  const [entries, setEntries] = useState(getTimeTrackingEntries());
  const [stats, setStats] = useState(calculateTimeBlindnessStats());
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    taskName: '',
    taskType: 'Coding',
    estimatedMinutes: 60,
    actualMinutes: 60,
    energyLevel: 'medium' as EnergyLevel,
  });

  useEffect(() => {
    setEntries(getTimeTrackingEntries());
    setStats(calculateTimeBlindnessStats());
  }, []);

  const handleAdd = () => {
    addTimeTrackingEntry({
      ...formData,
      date: new Date().toISOString().split('T')[0],
    });
    setEntries(getTimeTrackingEntries());
    setStats(calculateTimeBlindnessStats());
    setFormData({
      taskName: '',
      taskType: 'Coding',
      estimatedMinutes: 60,
      actualMinutes: 60,
      energyLevel: 'medium',
    });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    deleteTimeTrackingEntry(id);
    setEntries(getTimeTrackingEntries());
    setStats(calculateTimeBlindnessStats());
  };

  const applyRealityCheck = (estimate: number): number => {
    return Math.round(estimate * stats.averageMultiplier);
  };

  const taskTypes = ['Coding', 'Writing', 'Review', 'Meeting', 'Design', 'Research', 'Admin', 'Other'];

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl bg-gradient-to-br from-neon-pink/20 to-electric-purple/20 border-2 border-neon-pink/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-neon-pink" />
            <h3 className="text-sm font-semibold text-gray-400">Your Reality Multiplier</h3>
          </div>
          <div className="text-4xl font-black text-white">{stats.averageMultiplier.toFixed(1)}x</div>
          <p className="text-xs text-gray-500 mt-1">Based on {stats.totalEntries} tasks</p>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h3 className="text-sm font-semibold text-gray-400">Reality Check Helper</h3>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Estimate (min)"
              className="flex-1 px-3 py-2 bg-black border-2 border-white/10 rounded-lg text-white text-sm focus:border-neon-pink focus:outline-none"
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > 0) {
                  const adjusted = applyRealityCheck(val);
                  e.target.nextElementSibling!.textContent = `→ ${adjusted}min`;
                }
              }}
            />
            <div className="text-neon-green font-bold text-sm flex items-center">→ --min</div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">By Energy Level</h3>
          <div className="space-y-2">
            {(['high', 'medium', 'low'] as EnergyLevel[]).map(level => (
              <div key={level} className="flex items-center justify-between text-xs">
                <span className="capitalize text-gray-400">{level}</span>
                <span className="text-white font-bold">{stats.byEnergyLevel[level]?.toFixed(1) || '1.0'}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 hover:border-electric-purple text-gray-400 hover:text-electric-purple transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Log Time Entry
        </button>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="p-6 rounded-xl bg-white/5 border-2 border-electric-purple/50">
          <h3 className="text-lg font-bold text-white mb-4">New Time Entry</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Task name"
              value={formData.taskName}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              className="px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-neon-pink focus:outline-none"
            />
            <select
              value={formData.taskType}
              onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
              className="px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-neon-pink focus:outline-none"
            >
              {taskTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Estimated (min)</label>
              <input
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-neon-pink focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Actual (min)</label>
              <input
                type="number"
                value={formData.actualMinutes}
                onChange={(e) => setFormData({ ...formData, actualMinutes: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-neon-pink focus:outline-none"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block">Energy Level</label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as EnergyLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, energyLevel: level })}
                  className={`flex-1 py-2 rounded-lg font-semibold capitalize transition-all ${
                    formData.energyLevel === level
                      ? 'bg-electric-purple text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!formData.taskName}
              className="flex-1 py-3 bg-neon-pink rounded-lg text-black font-bold hover:bg-white transition-all disabled:opacity-50"
            >
              Add Entry
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Entries Table */}
      <div className="rounded-xl bg-white/5 border-2 border-white/10 overflow-hidden">
        <div className="p-4 bg-white/5 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-electric-purple" />
            Time Tracking History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Task</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Estimated</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Actual</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Multiplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Energy</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No entries yet. Start logging to see patterns!
                  </td>
                </tr>
              ) : (
                entries.slice().reverse().map(entry => {
                  const multiplier = (entry.actualMinutes / entry.estimatedMinutes).toFixed(1);
                  return (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-sm text-white font-medium">{entry.taskName}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{entry.taskType}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{entry.estimatedMinutes}m</td>
                      <td className="px-4 py-3 text-sm text-white font-semibold">{entry.actualMinutes}m</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${
                          Number(multiplier) > 1.5 ? 'text-red-400' : Number(multiplier) > 1.2 ? 'text-yellow-400' : 'text-neon-green'
                        }`}>
                          {multiplier}x
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs capitalize px-2 py-1 rounded bg-white/10 text-gray-400">
                          {entry.energyLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{entry.date}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Brain, Plus, Star, Clock, Trash2 } from 'lucide-react';
import {
  getHyperfocusSessions,
  addHyperfocusSession,
  deleteHyperfocusSession,
  calculateHyperfocusStats,
} from '@/lib/adhd';

export default function HyperfocusLogger() {
  const [sessions, setSessions] = useState(getHyperfocusSessions());
  const [stats, setStats] = useState(calculateHyperfocusStats());
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    taskName: '',
    taskType: 'Coding',
    trigger: 'Interesting problem',
    duration: 60,
    productivityRating: 5,
    notes: '',
  });

  useEffect(() => {
    setSessions(getHyperfocusSessions());
    setStats(calculateHyperfocusStats());
  }, []);

  const handleAdd = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() - formData.duration * 60 * 1000);

    addHyperfocusSession({
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      duration: formData.duration,
      trigger: formData.trigger,
      taskType: formData.taskType,
      taskName: formData.taskName,
      productivityRating: formData.productivityRating,
      notes: formData.notes,
    });

    setSessions(getHyperfocusSessions());
    setStats(calculateHyperfocusStats());
    setFormData({
      taskName: '',
      taskType: 'Coding',
      trigger: 'Interesting problem',
      duration: 60,
      productivityRating: 5,
      notes: '',
    });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    deleteHyperfocusSession(id);
    setSessions(getHyperfocusSessions());
    setStats(calculateHyperfocusStats());
  };

  const taskTypes = ['Coding', 'Writing', 'Design', 'Research', 'Problem-solving', 'Learning', 'Creative', 'Other'];
  const triggers = [
    'Interesting problem',
    'New technology',
    'Deadline pressure',
    'Creative flow',
    'Challenge accepted',
    'Perfect conditions',
    'Just started',
    'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-electric-purple/20 border-2 border-blue-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-6 h-6 text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-400">Total Sessions</h3>
          </div>
          <div className="text-4xl font-black text-white">{stats.totalSessions}</div>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-neon-green" />
            <h3 className="text-sm font-semibold text-gray-400">Avg Duration</h3>
          </div>
          <div className="text-4xl font-black text-white">{Math.round(stats.averageDuration)}<span className="text-xl text-gray-500">m</span></div>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-yellow-400" />
            <h3 className="text-sm font-semibold text-gray-400">Productivity</h3>
          </div>
          <div className="text-4xl font-black text-white">{stats.productivityAverage.toFixed(1)}<span className="text-xl text-gray-500">/5</span></div>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Best Time</h3>
          <div className="text-2xl font-black text-neon-pink">{stats.bestTimeOfDay}</div>
          <p className="text-xs text-gray-500 mt-1">Peak hyperfocus</p>
        </div>
      </div>

      {/* Common Triggers */}
      {stats.commonTriggers.length > 0 && (
        <div className="p-4 rounded-xl bg-electric-purple/10 border-2 border-electric-purple/30">
          <h3 className="text-sm font-semibold text-electric-purple mb-2">🎯 Your Top Triggers</h3>
          <div className="flex gap-2 flex-wrap">
            {stats.commonTriggers.map(trigger => (
              <span key={trigger} className="px-3 py-1 rounded-full bg-electric-purple/20 text-electric-purple text-sm font-semibold">
                {trigger}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 hover:border-blue-500 text-gray-400 hover:text-blue-400 transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Log Hyperfocus Session
        </button>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="p-6 rounded-xl bg-white/5 border-2 border-blue-500/50">
          <h3 className="text-lg font-bold text-white mb-4">New Hyperfocus Session</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="What did you work on?"
              value={formData.taskName}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              className="col-span-2 px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            <select
              value={formData.taskType}
              onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
              className="px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              {taskTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              className="px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              {triggers.map(trigger => (
                <option key={trigger} value={trigger}>{trigger}</option>
              ))}
            </select>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Productivity Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFormData({ ...formData, productivityRating: rating })}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                      formData.productivityRating >= rating
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white/5 text-gray-600'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none mb-4 h-20"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!formData.taskName}
              className="flex-1 py-3 bg-blue-500 rounded-lg text-white font-bold hover:bg-blue-400 transition-all disabled:opacity-50"
            >
              Log Session
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

      {/* Sessions List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          Recent Sessions
        </h3>
        {sessions.length === 0 ? (
          <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10 text-center text-gray-500">
            No hyperfocus sessions logged yet. Start tracking!
          </div>
        ) : (
          sessions.slice().reverse().map(session => (
            <div key={session.id} className="p-4 rounded-xl bg-white/5 border-2 border-white/10 hover:border-blue-500/30 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-1">{session.taskName}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="px-2 py-1 rounded bg-white/10">{session.taskType}</span>
                    <span>🎯 {session.trigger}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.duration}m
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= session.productivityRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {session.notes && (
                <p className="text-sm text-gray-500 mt-2 italic">{session.notes}</p>
              )}
              <div className="text-xs text-gray-600 mt-2">
                {new Date(session.endTime).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

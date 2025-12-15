'use client';

import { useState, useEffect } from 'react';
import VenuedNav from '../components/VenuedNav';
import {
  Clock,
  Zap,
  Battery,
  Brain,
  Gift,
  Users,
  LineChart,
  Plus,
  X,
  Trash2,
} from 'lucide-react';

interface BrainDump {
  id: string;
  content: string;
  converted: boolean;
  archived: boolean;
  createdAt: string;
}

interface EnergyLog {
  id: string;
  level: string;
  notes: string | null;
  timestamp: string;
}

interface DopamineReward {
  id: string;
  reward: string;
  category: string;
  usageCount: number;
  motivationRating: number | null;
}

type ActiveTool = 'brain-dump' | 'energy' | 'dopamine' | 'time-blindness' | null;

export default function VenuedEntouragePage() {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [brainDumps, setBrainDumps] = useState<BrainDump[]>([]);
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
  const [dopamineRewards, setDopamineRewards] = useState<DopamineReward[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newBrainDump, setNewBrainDump] = useState('');
  const [newReward, setNewReward] = useState({ reward: '', category: 'BREAK' });

  useEffect(() => {
    if (activeTool) {
      fetchToolData(activeTool);
    }
  }, [activeTool]);

  const fetchToolData = async (tool: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/venued/entourage?tool=${tool}`);
      if (res.ok) {
        const data = await res.json();
        if (tool === 'brain-dump') setBrainDumps(data.brainDumps || []);
        if (tool === 'energy') setEnergyLogs(data.energyLogs || []);
        if (tool === 'dopamine') setDopamineRewards(data.dopamineRewards || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBrainDump = async () => {
    if (!newBrainDump.trim()) return;
    try {
      await fetch('/api/venued/entourage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'brain-dump', content: newBrainDump }),
      });
      setNewBrainDump('');
      fetchToolData('brain-dump');
    } catch (error) {
      console.error('Failed to add brain dump:', error);
    }
  };

  const logEnergy = async (level: string) => {
    try {
      await fetch('/api/venued/entourage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'energy', level }),
      });
      fetchToolData('energy');
    } catch (error) {
      console.error('Failed to log energy:', error);
    }
  };

  const addReward = async () => {
    if (!newReward.reward.trim()) return;
    try {
      await fetch('/api/venued/entourage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'dopamine', ...newReward }),
      });
      setNewReward({ reward: '', category: 'BREAK' });
      fetchToolData('dopamine');
    } catch (error) {
      console.error('Failed to add reward:', error);
    }
  };

  const useReward = async (id: string) => {
    try {
      await fetch('/api/venued/entourage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'dopamine', id, used: true }),
      });
      fetchToolData('dopamine');
    } catch (error) {
      console.error('Failed to use reward:', error);
    }
  };

  const tools = [
    {
      id: 'brain-dump',
      name: 'Brain Dump',
      icon: Brain,
      color: '#FF008E',
      description: 'Clear your mental clutter',
    },
    {
      id: 'energy',
      name: 'Energy Tracker',
      icon: Battery,
      color: '#00F0E9',
      description: 'Log your energy levels',
    },
    {
      id: 'dopamine',
      name: 'Dopamine Menu',
      icon: Gift,
      color: '#FFE500',
      description: 'Your reward system',
    },
    {
      id: 'time-blindness',
      name: 'Time Tracker',
      icon: Clock,
      color: '#9D00FF',
      description: 'Track actual vs estimated time',
    },
  ];

  const categories = [
    { value: 'BREAK', label: '☕ Break' },
    { value: 'TREAT', label: '🍫 Treat' },
    { value: 'SOCIAL', label: '👥 Social' },
    { value: 'MOVEMENT', label: '🏃 Movement' },
    { value: 'CREATIVE', label: '🎨 Creative' },
    { value: 'OTHER', label: '✨ Other' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <VenuedNav />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Entourage</h1>
          <p className="text-gray-400">Your ADHD support tools - built for how your brain actually works</p>
        </div>

        {!activeTool ? (
          /* Tool Selection */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as ActiveTool)}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${tool.color}20` }}
                >
                  <tool.icon size={24} style={{ color: tool.color }} />
                </div>
                <h3 className="font-bold text-white mb-1">{tool.name}</h3>
                <p className="text-sm text-gray-400">{tool.description}</p>
              </button>
            ))}
          </div>
        ) : (
          /* Active Tool */
          <div>
            <button
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
            >
              <X size={20} />
              Back to tools
            </button>

            {activeTool === 'brain-dump' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Brain size={24} className="text-[#FF008E]" />
                    Brain Dump
                  </h2>
                  <p className="text-gray-400">Get it out of your head and onto the page. No judgment.</p>
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={newBrainDump}
                    onChange={(e) => setNewBrainDump(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF008E] h-24"
                    placeholder="What's on your mind? Just dump it here..."
                  />
                </div>
                <button
                  onClick={addBrainDump}
                  className="px-6 py-3 rounded-lg font-medium"
                  style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
                >
                  Dump It
                </button>

                {loading ? (
                  <div className="text-gray-400">Loading...</div>
                ) : (
                  <div className="space-y-2 mt-6">
                    {brainDumps.map((dump) => (
                      <div
                        key={dump.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <p className="text-white whitespace-pre-wrap">{dump.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(dump.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTool === 'energy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Battery size={24} className="text-[#00F0E9]" />
                    Energy Tracker
                  </h2>
                  <p className="text-gray-400">How are you feeling right now?</p>
                </div>

                <div className="flex gap-4 justify-center">
                  {[
                    { level: 'HIGH', emoji: '⚡', label: 'High Energy', color: 'bg-green-500' },
                    { level: 'MEDIUM', emoji: '😊', label: 'Medium', color: 'bg-yellow-500' },
                    { level: 'LOW', emoji: '😴', label: 'Low Energy', color: 'bg-red-500' },
                  ].map((option) => (
                    <button
                      key={option.level}
                      onClick={() => logEnergy(option.level)}
                      className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all text-center"
                    >
                      <div className="text-4xl mb-2">{option.emoji}</div>
                      <div className="text-white font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="text-gray-400">Loading...</div>
                ) : (
                  <div className="space-y-2 mt-6">
                    <h3 className="text-lg font-medium text-white">Recent Logs</h3>
                    {energyLogs.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            log.level === 'HIGH'
                              ? 'bg-green-500'
                              : log.level === 'MEDIUM'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span className="text-white">{log.level}</span>
                        <span className="text-gray-400 text-sm ml-auto">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTool === 'dopamine' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Gift size={24} className="text-[#FFE500]" />
                    Dopamine Menu
                  </h2>
                  <p className="text-gray-400">Your personal reward system. Pick something when you earn it!</p>
                </div>

                {/* Add Reward */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="font-medium text-white mb-3">Add New Reward</h3>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="text"
                      value={newReward.reward}
                      onChange={(e) => setNewReward({ ...newReward, reward: e.target.value })}
                      className="flex-1 min-w-[200px] px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFE500]"
                      placeholder="e.g., 10 min break, coffee, scroll TikTok..."
                    />
                    <select
                      value={newReward.category}
                      onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FFE500]"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addReward}
                      className="px-4 py-2 rounded-lg font-medium bg-[#FFE500] text-black"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* Rewards List */}
                {loading ? (
                  <div className="text-gray-400">Loading...</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {dopamineRewards.map((reward) => (
                      <button
                        key={reward.id}
                        onClick={() => useReward(reward.id)}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#FFE500]/50 hover:bg-[#FFE500]/10 transition-all text-left"
                      >
                        <div className="text-2xl mb-2">
                          {categories.find((c) => c.value === reward.category)?.label.split(' ')[0] || '✨'}
                        </div>
                        <div className="text-white font-medium">{reward.reward}</div>
                        <div className="text-xs text-gray-500 mt-1">Used {reward.usageCount}x</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTool === 'time-blindness' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Clock size={24} className="text-[#9D00FF]" />
                    Time Blindness Tracker
                  </h2>
                  <p className="text-gray-400">Learn how long things actually take vs how long you think they take.</p>
                </div>

                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                  <Clock className="mx-auto mb-4 text-[#9D00FF]" size={48} />
                  <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
                  <p className="text-gray-400">
                    This tool will help you track estimated vs actual time for tasks.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

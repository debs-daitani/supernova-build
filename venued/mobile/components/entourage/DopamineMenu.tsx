'use client';

import { useState, useEffect } from 'react';
import { Gift, Plus, Trash2, Star } from 'lucide-react';
import {
  getDopamineRewards,
  addDopamineReward,
  deleteDopamineReward,
  getRandomReward,
  incrementRewardUsage,
} from '@/lib/adhd';
import { DopamineReward } from '@/lib/types';

export default function DopamineMenu() {
  const [rewards, setRewards] = useState(getDopamineRewards());
  const [isAdding, setIsAdding] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [selectedReward, setSelectedReward] = useState<DopamineReward | null>(null);

  const [formData, setFormData] = useState({
    reward: '',
    category: 'break' as DopamineReward['category'],
  });

  useEffect(() => {
    setRewards(getDopamineRewards());
  }, []);

  const handleAdd = () => {
    if (!formData.reward.trim()) return;

    addDopamineReward({
      ...formData,
      usageCount: 0,
    });

    setRewards(getDopamineRewards());
    setFormData({ reward: '', category: 'break' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    deleteDopamineReward(id);
    setRewards(getDopamineRewards());
  };

  const handleSpin = () => {
    setSpinning(true);
    setSelectedReward(null);

    setTimeout(() => {
      const reward = getRandomReward();
      setSelectedReward(reward);
      setSpinning(false);
      if (reward) {
        incrementRewardUsage(reward.id);
        setRewards(getDopamineRewards());
      }
    }, 2000);
  };

  const categories = [
    { id: 'break', label: '5-min Break', emoji: '⏸️' },
    { id: 'treat', label: 'Treat', emoji: '🍫' },
    { id: 'social', label: 'Social', emoji: '💬' },
    { id: 'movement', label: 'Movement', emoji: '🏃' },
    { id: 'creative', label: 'Creative', emoji: '🎨' },
    { id: 'other', label: 'Other', emoji: '✨' },
  ];

  const getCategoryEmoji = (cat: string) => categories.find(c => c.id === cat)?.emoji || '✨';

  return (
    <div className="space-y-6">
      {/* Spin the Wheel */}
      <div className="p-8 rounded-xl bg-gradient-to-br from-yellow-500/20 to-neon-pink/20 border-2 border-yellow-500/30 text-center">
        <Gift className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-white mb-2">Dopamine Menu</h3>
        <p className="text-sm text-gray-400 mb-6">Task done? Spin for your reward!</p>

        <button
          onClick={handleSpin}
          disabled={spinning || rewards.length === 0}
          className={`px-8 py-4 rounded-full text-xl font-black transition-all ${
            spinning
              ? 'bg-gray-500 text-gray-300 animate-spin'
              : 'bg-gradient-to-r from-yellow-400 to-neon-pink text-black hover:shadow-[0_0_30px_rgba(255,193,7,0.6)]'
          } disabled:opacity-50`}
        >
          {spinning ? '🎰' : '🎁 SPIN THE WHEEL'}
        </button>

        {selectedReward && !spinning && (
          <div className="mt-6 p-6 rounded-xl bg-white/10 border-2 border-neon-pink animate-in">
            <div className="text-4xl mb-2">{getCategoryEmoji(selectedReward.category)}</div>
            <h4 className="text-2xl font-bold text-neon-pink mb-2">{selectedReward.reward}</h4>
            <p className="text-sm text-gray-400">You earned it!</p>
          </div>
        )}
      </div>

      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 hover:border-yellow-400 text-gray-400 hover:text-yellow-400 transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Reward
        </button>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="p-6 rounded-xl bg-white/5 border-2 border-yellow-400/50">
          <h3 className="text-lg font-bold text-white mb-4">New Reward</h3>
          <input
            type="text"
            placeholder="Reward name"
            value={formData.reward}
            onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
            className="w-full px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-yellow-400 focus:outline-none mb-4"
          />
          <div className="grid grid-cols-3 gap-2 mb-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFormData({ ...formData, category: cat.id as DopamineReward['category'] })}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  formData.category === cat.id
                    ? 'bg-yellow-400 text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!formData.reward.trim()}
              className="flex-1 py-3 bg-yellow-400 rounded-lg text-black font-bold hover:bg-yellow-300 transition-all disabled:opacity-50"
            >
              Add Reward
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

      {/* Rewards by Category */}
      {categories.map(cat => {
        const catRewards = rewards.filter(r => r.category === cat.id);
        if (catRewards.length === 0) return null;

        return (
          <div key={cat.id} className="p-4 rounded-xl bg-white/5 border-2 border-white/10">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <span className="text-lg">{cat.emoji}</span>
              {cat.label}
            </h3>
            <div className="space-y-2">
              {catRewards.map(reward => (
                <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{reward.reward}</span>
                    {reward.usageCount > 0 && (
                      <span className="text-xs text-gray-500">
                        Used {reward.usageCount}x
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {rewards.length === 0 && !isAdding && (
        <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10 text-center text-gray-500">
          No rewards yet. Add some to get started!
        </div>
      )}

      {/* Most Used */}
      {rewards.some(r => r.usageCount > 0) && (
        <div className="p-4 rounded-xl bg-neon-green/10 border-2 border-neon-green/30">
          <h3 className="text-sm font-semibold text-neon-green mb-2 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Most Motivating
          </h3>
          <div className="space-y-1">
            {rewards
              .filter(r => r.usageCount > 0)
              .sort((a, b) => b.usageCount - a.usageCount)
              .slice(0, 3)
              .map(reward => (
                <div key={reward.id} className="flex items-center justify-between text-sm">
                  <span className="text-white">{reward.reward}</span>
                  <span className="text-neon-green font-bold">{reward.usageCount}x</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

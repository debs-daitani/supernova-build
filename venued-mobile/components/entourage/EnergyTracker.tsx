'use client';

import { useState, useEffect } from 'react';
import { Zap, Flame, Star, Plus } from 'lucide-react';
import { EnergyLevel } from '@/lib/types';
import {
  getEnergyLogs,
  addEnergyLog,
  calculateEnergyStats,
} from '@/lib/adhd';

export default function EnergyTracker() {
  const [logs, setLogs] = useState(getEnergyLogs());
  const [stats, setStats] = useState(calculateEnergyStats());

  useEffect(() => {
    setLogs(getEnergyLogs());
    setStats(calculateEnergyStats());
  }, []);

  const handleQuickLog = (level: EnergyLevel) => {
    addEnergyLog({
      timestamp: new Date().toISOString(),
      level,
    });
    setLogs(getEnergyLogs());
    setStats(calculateEnergyStats());
  };

  const energyConfig = {
    high: { icon: Flame, color: 'text-neon-pink', bg: 'bg-neon-pink/20', border: 'border-neon-pink', emoji: '🔥' },
    medium: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400', emoji: '⚡' },
    low: { icon: Star, color: 'text-electric-purple', bg: 'bg-electric-purple/20', border: 'border-electric-purple', emoji: '⭐' },
  };

  // Get today's energy curve
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(log => log.timestamp.startsWith(today));

  return (
    <div className="space-y-6">
      {/* Quick Log Buttons */}
      <div className="grid grid-cols-3 gap-4">
        {(['high', 'medium', 'low'] as EnergyLevel[]).map(level => {
          const config = energyConfig[level];
          const Icon = config.icon;
          return (
            <button
              key={level}
              onClick={() => handleQuickLog(level)}
              className={`p-6 rounded-xl border-2 ${config.border}/30 ${config.bg} hover:${config.border}/50 transition-all group`}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className={`w-8 h-8 ${config.color}`} />
                <span className={`text-lg font-bold ${config.color} capitalize`}>{level}</span>
                <span className="text-3xl">{config.emoji}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Insights */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-electric-purple/20 to-neon-pink/20 border-2 border-electric-purple/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-electric-purple" />
          Your Energy Patterns
        </h3>
        <div className="space-y-2">
          {stats.patterns.map((pattern, i) => (
            <div key={i} className="flex items-center gap-2 text-white">
              <span className="text-neon-green">•</span>
              <span>{pattern}</span>
            </div>
          ))}
        </div>
        {stats.peakTimes.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-white/10">
            <p className="text-sm text-gray-400 mb-2">Peak Energy Times:</p>
            <div className="flex gap-2 flex-wrap">
              {stats.peakTimes.map(time => (
                <span key={time} className="px-3 py-1 rounded-full bg-neon-pink/20 text-neon-pink text-sm font-semibold">
                  {time}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Energy Heatmap by Hour */}
      <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Energy by Time of Day</h3>
        <div className="grid grid-cols-12 gap-2">
          {Array.from({ length: 24 }, (_, hour) => {
            const level = stats.averageByHour[hour];
            const config = level ? energyConfig[level] : null;
            return (
              <div key={hour} className="flex flex-col items-center">
                <div
                  className={`w-full h-16 rounded ${config ? config.bg : 'bg-white/5'} ${config ? `border-2 ${config.border}/30` : 'border border-white/10'} flex items-center justify-center`}
                >
                  {config && <span className="text-lg">{config.emoji}</span>}
                </div>
                <span className="text-xs text-gray-500 mt-1">{hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Energy Curve */}
      {todayLogs.length > 0 && (
        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Today's Energy</h3>
          <div className="space-y-2">
            {todayLogs.map(log => {
              const config = energyConfig[log.level];
              const Icon = config.icon;
              const time = new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className="text-white font-semibold capitalize">{log.level}</span>
                  <span className="text-gray-500 text-sm ml-auto">{time}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="p-4 rounded-xl bg-neon-green/10 border-2 border-neon-green/30">
        <h3 className="text-sm font-semibold text-neon-green mb-2">💡 Scheduling Tips</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Schedule high-energy tasks during your peak times</li>
          <li>• Save low-energy tasks (admin, email) for your valleys</li>
          <li>• Track for at least a week to see clear patterns</li>
          <li>• Your energy is data - use it to your advantage!</li>
        </ul>
      </div>
    </div>
  );
}

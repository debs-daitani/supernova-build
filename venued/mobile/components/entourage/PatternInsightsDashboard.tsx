'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Brain, Zap, Calendar } from 'lucide-react';
import {
  calculateTimeBlindnessStats,
  calculateHyperfocusStats,
  calculateEnergyStats,
} from '@/lib/adhd';

export default function PatternInsightsDashboard() {
  const [timeStats, setTimeStats] = useState(calculateTimeBlindnessStats());
  const [hyperfocusStats, setHyperfocusStats] = useState(calculateHyperfocusStats());
  const [energyStats, setEnergyStats] = useState(calculateEnergyStats());
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    setTimeStats(calculateTimeBlindnessStats());
    setHyperfocusStats(calculateHyperfocusStats());
    setEnergyStats(calculateEnergyStats());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-electric-purple" />
          <h3 className="text-2xl font-black text-white">Pattern Insights</h3>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                dateRange === range
                  ? 'bg-electric-purple text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-neon-pink/20 to-electric-purple/20 border-2 border-neon-pink/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-neon-pink" />
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/10">
            <div className="text-3xl font-black text-neon-pink mb-1">
              {timeStats.averageMultiplier.toFixed(1)}x
            </div>
            <div className="text-sm text-gray-300">Your reality multiplier</div>
            <div className="text-xs text-gray-500 mt-1">
              {timeStats.averageMultiplier > 2
                ? 'Tasks take 2x longer than estimated'
                : timeStats.averageMultiplier > 1.5
                ? 'Mild time blindness detected'
                : 'Pretty accurate estimator!'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white/10">
            <div className="text-3xl font-black text-blue-400 mb-1">
              {Math.round(hyperfocusStats.averageDuration)}m
            </div>
            <div className="text-sm text-gray-300">Avg hyperfocus duration</div>
            <div className="text-xs text-gray-500 mt-1">
              {hyperfocusStats.totalSessions} sessions tracked
            </div>
          </div>

          {energyStats.peakTimes.length > 0 && (
            <div className="p-4 rounded-lg bg-white/10">
              <div className="text-xl font-black text-neon-green mb-1">
                {energyStats.peakTimes[0]}
              </div>
              <div className="text-sm text-gray-300">Peak energy time</div>
              <div className="text-xs text-gray-500 mt-1">
                Schedule high-focus tasks here
              </div>
            </div>
          )}

          {hyperfocusStats.bestTimeOfDay !== 'No data yet' && (
            <div className="p-4 rounded-lg bg-white/10">
              <div className="text-xl font-black text-yellow-400 mb-1">
                {hyperfocusStats.bestTimeOfDay}
              </div>
              <div className="text-sm text-gray-300">Best hyperfocus time</div>
              <div className="text-xs text-gray-500 mt-1">
                Most productive sessions
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Blindness Breakdown */}
      <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-neon-pink" />
          Time Blindness by Task Type
        </h3>
        <div className="space-y-3">
          {Object.entries(timeStats.byTaskType).length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No data yet. Start tracking time!
            </div>
          ) : (
            Object.entries(timeStats.byTaskType).map(([type, multiplier]) => (
              <div key={type} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-400">{type}</div>
                <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-pink to-electric-purple flex items-center justify-end px-3 transition-all"
                    style={{ width: `${Math.min((multiplier / 3) * 100, 100)}%` }}
                  >
                    <span className="text-white font-bold text-xs">{multiplier.toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Energy Distribution */}
      <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Energy Patterns
        </h3>
        <div className="space-y-4">
          {energyStats.patterns.map((pattern, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="text-2xl">
                {pattern.includes('morning') ? '🌅' : pattern.includes('night') ? '🌙' : pattern.includes('peak') ? '⚡' : '💡'}
              </div>
              <div className="text-white">{pattern}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hyperfocus Triggers */}
      {hyperfocusStats.commonTriggers.length > 0 && (
        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            Top Hyperfocus Triggers
          </h3>
          <div className="flex gap-3 flex-wrap">
            {hyperfocusStats.commonTriggers.map(trigger => (
              <div key={trigger} className="px-4 py-2 rounded-full bg-blue-500/20 border-2 border-blue-500/30 text-blue-400 font-semibold">
                {trigger}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            These conditions help you get into flow state. Try to recreate them!
          </p>
        </div>
      )}

      {/* Recommendations */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-neon-green/20 to-blue-500/20 border-2 border-neon-green/30">
        <h3 className="text-lg font-bold text-white mb-4">🎯 Personalized Recommendations</h3>
        <div className="space-y-3">
          {timeStats.averageMultiplier > 1.5 && (
            <div className="p-4 rounded-lg bg-white/10">
              <div className="font-semibold text-neon-pink mb-1">Time Estimation</div>
              <div className="text-sm text-gray-300">
                Multiply your estimates by {timeStats.averageMultiplier.toFixed(1)}x to get realistic timelines.
                You consistently underestimate - that's okay, now you have data!
              </div>
            </div>
          )}

          {energyStats.peakTimes.length > 0 && (
            <div className="p-4 rounded-lg bg-white/10">
              <div className="font-semibold text-yellow-400 mb-1">Energy Scheduling</div>
              <div className="text-sm text-gray-300">
                Your energy peaks at {energyStats.peakTimes.join(', ')}. Schedule your most important
                or challenging tasks during these windows.
              </div>
            </div>
          )}

          {hyperfocusStats.totalSessions > 0 && (
            <div className="p-4 rounded-lg bg-white/10">
              <div className="font-semibold text-blue-400 mb-1">Hyperfocus Optimization</div>
              <div className="text-sm text-gray-300">
                You enter hyperfocus best around {hyperfocusStats.bestTimeOfDay}.
                Protect this time for deep work and complex problems.
              </div>
            </div>
          )}

          {timeStats.totalEntries < 10 && (
            <div className="p-4 rounded-lg bg-white/10">
              <div className="font-semibold text-gray-400 mb-1">Keep Tracking</div>
              <div className="text-sm text-gray-300">
                Track at least 10 tasks to get more accurate pattern insights. You're at {timeStats.totalEntries} so far!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

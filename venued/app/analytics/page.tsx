'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Brain,
  Zap,
  Clock,
  Target,
  Calendar,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Filter,
} from 'lucide-react';
import { getUserStats } from '@/lib/achievements';
import {
  calculateTimeBlindnessStats,
  calculateHyperfocusStats,
  calculateEnergyStats,
  getTimeTrackingEntries,
  getHyperfocusSessions,
  getEnergyLogs,
} from '@/lib/adhd';
import { getCrewTasks } from '@/lib/crew';
import { getProjects } from '@/lib/storage';

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [stats, setStats] = useState(getUserStats());
  const [timeBlindness, setTimeBlindness] = useState(calculateTimeBlindnessStats());
  const [hyperfocusStats, setHyperfocusStats] = useState(calculateHyperfocusStats());
  const [energyStats, setEnergyStats] = useState(calculateEnergyStats());
  const [tasks, setTasks] = useState(getCrewTasks());
  const [projects, setProjects] = useState(getProjects());

  useEffect(() => {
    setStats(getUserStats());
    setTimeBlindness(calculateTimeBlindnessStats());
    setHyperfocusStats(calculateHyperfocusStats());
    setEnergyStats(calculateEnergyStats());
    setTasks(getCrewTasks());
    setProjects(getProjects());
    setIsLoading(false);
  }, []);

  // Calculate completion rate over time
  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  // Calculate productivity score (0-100)
  const productivityScore = useMemo(() => {
    const completionScore = completionRate;
    const focusScore = stats.hyperfocusSessions > 0 ? Math.min((stats.hyperfocusSessions / 10) * 100, 100) : 0;
    const trackingScore = stats.timeTrackingEntries > 0 ? Math.min((stats.timeTrackingEntries / 20) * 100, 100) : 0;

    return Math.round((completionScore + focusScore + trackingScore) / 3);
  }, [stats, completionRate]);

  // Group tasks by completion date for trend analysis
  const taskCompletionTrend = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed && t.completedAt);
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const dayGroups: { [key: string]: number } = {};

    completedTasks.forEach(task => {
      if (task.completedAt) {
        const date = new Date(task.completedAt);
        if (date >= last30Days) {
          const dateStr = date.toISOString().split('T')[0];
          dayGroups[dateStr] = (dayGroups[dateStr] || 0) + 1;
        }
      }
    });

    return Object.entries(dayGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14); // Last 14 days
  }, [tasks]);

  // Energy distribution
  const energyDistribution = useMemo(() => {
    const logs = getEnergyLogs();
    const distribution = { high: 0, medium: 0, low: 0 };
    logs.forEach(log => {
      distribution[log.level]++;
    });
    const total = logs.length || 1;
    return {
      high: Math.round((distribution.high / total) * 100),
      medium: Math.round((distribution.medium / total) * 100),
      low: Math.round((distribution.low / total) * 100),
    };
  }, []);

  // Recommendations based on data
  const recommendations = useMemo(() => {
    const recs: Array<{ title: string; description: string; type: 'tip' | 'warning' | 'success' }> = [];

    // Time blindness recommendations
    if (timeBlindness.averageMultiplier > 2.0) {
      recs.push({
        title: 'Time Estimation Alert',
        description: `Your tasks take ${timeBlindness.averageMultiplier.toFixed(1)}x longer than estimated. Try doubling your time estimates.`,
        type: 'warning',
      });
    } else if (timeBlindness.averageMultiplier < 1.2 && timeBlindness.totalEntries > 5) {
      recs.push({
        title: 'Great Time Awareness!',
        description: 'Your time estimates are getting accurate. Keep tracking!',
        type: 'success',
      });
    }

    // Energy recommendations
    if (energyStats.peakTimes.length > 0) {
      recs.push({
        title: 'Peak Energy Windows',
        description: `Schedule your hardest tasks during ${energyStats.peakTimes.join(', ')}. That's when your energy peaks!`,
        type: 'tip',
      });
    }

    // Hyperfocus recommendations
    if (hyperfocusStats.totalSessions > 5 && hyperfocusStats.commonTriggers.length > 0) {
      recs.push({
        title: 'Hyperfocus Triggers Found',
        description: `You hyperfocus most with: ${hyperfocusStats.commonTriggers.join(', ')}. Use these to your advantage!`,
        type: 'success',
      });
    }

    // Productivity recommendations
    if (completionRate < 50 && tasks.length > 5) {
      recs.push({
        title: 'Too Many Open Tasks',
        description: 'Try focusing on 3-5 tasks at a time. Smaller batches = better momentum.',
        type: 'warning',
      });
    }

    // Streak recommendations
    if (stats.streak === 0 && stats.completedTasks > 0) {
      recs.push({
        title: 'Start a Streak',
        description: 'Complete at least one task today to start building momentum!',
        type: 'tip',
      });
    } else if (stats.streak >= 7) {
      recs.push({
        title: `${stats.streak}-Day Streak!`,
        description: "You're on fire! Keep the momentum going.",
        type: 'success',
      });
    }

    return recs;
  }, [timeBlindness, energyStats, hyperfocusStats, completionRate, tasks.length, stats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-electric-purple animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-10 h-10 text-electric-purple" />
            <h1 className="text-4xl sm:text-5xl font-black text-white">Analytics</h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-400">
            Deep insights into your productivity patterns and ADHD tracking
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-electric-purple to-neon-pink mt-4" />
        </div>

        {/* Time Range Filter */}
        <div className="mb-8 flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-electric-purple text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {range === 'all' ? 'All Time' : `Last ${range.replace('d', ' days')}`}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-xl bg-gradient-to-br from-neon-pink/20 to-neon-pink/10 border-2 border-neon-pink/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-400">Productivity Score</h3>
              <Target className="w-5 h-5 text-neon-pink" />
            </div>
            <div className="text-4xl font-black text-white mb-1">{productivityScore}</div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-neon-pink rounded-full transition-all duration-500"
                style={{ width: `${productivityScore}%` }}
              />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-electric-purple/20 to-electric-purple/10 border-2 border-electric-purple/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-400">Completion Rate</h3>
              <Award className="w-5 h-5 text-electric-purple" />
            </div>
            <div className="text-4xl font-black text-white mb-1">{completionRate}%</div>
            <p className="text-xs text-gray-400">
              {tasks.filter(t => t.completed).length} of {tasks.length} tasks
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-green/10 border-2 border-neon-green/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-400">Focus Time</h3>
              <Brain className="w-5 h-5 text-neon-green" />
            </div>
            <div className="text-4xl font-black text-white mb-1">
              {Math.round(stats.totalFocusMinutes / 60)}h
            </div>
            <p className="text-xs text-gray-400">
              {stats.hyperfocusSessions} hyperfocus sessions
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-400/20 to-yellow-400/10 border-2 border-yellow-400/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-400">Current Streak</h3>
              <Calendar className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-4xl font-black text-white mb-1">{stats.streak}</div>
            <p className="text-xs text-gray-400">days in a row</p>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-neon-green" />
              Personalized Recommendations
            </h2>
            <div className="grid gap-4">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-xl border-2 ${
                    rec.type === 'success'
                      ? 'bg-neon-green/10 border-neon-green/30'
                      : rec.type === 'warning'
                      ? 'bg-yellow-400/10 border-yellow-400/30'
                      : 'bg-electric-purple/10 border-electric-purple/30'
                  }`}
                >
                  <h3 className="text-lg font-bold text-white mb-2">{rec.title}</h3>
                  <p className="text-gray-300">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Completion Trend */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-electric-purple" />
            Task Completion Trend (Last 14 Days)
          </h2>
          <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
            {taskCompletionTrend.length > 0 ? (
              <div className="space-y-3">
                {taskCompletionTrend.map(([date, count]) => {
                  const maxCount = Math.max(...taskCompletionTrend.map(([, c]) => c));
                  const percentage = (count / maxCount) * 100;
                  const formattedDate = new Date(date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div key={date} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{formattedDate}</span>
                        <span className="text-white font-bold">{count} tasks</span>
                      </div>
                      <div className="h-6 bg-black/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-electric-purple to-neon-pink rounded-full transition-all duration-500 flex items-center justify-end px-2"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 15 && (
                            <span className="text-xs font-bold text-white">{count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No completed tasks in the last 14 days. Start completing tasks to see trends!
              </div>
            )}
          </div>
        </div>

        {/* ADHD Insights */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Time Blindness */}
          <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-neon-pink" />
              Time Blindness Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Multiplier</span>
                <span className="text-2xl font-black text-white">
                  {timeBlindness.averageMultiplier.toFixed(1)}x
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Entries Tracked</span>
                <span className="text-lg font-bold text-white">{timeBlindness.totalEntries}</span>
              </div>

              {timeBlindness.totalEntries > 0 && (
                <>
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">By Energy Level</h4>
                    <div className="space-y-2">
                      {Object.entries(timeBlindness.byEnergyLevel).map(([level, multiplier]) => (
                        <div key={level} className="flex justify-between">
                          <span className="text-gray-300 capitalize">{level}</span>
                          <span className="text-white font-semibold">{multiplier.toFixed(1)}x</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {Object.keys(timeBlindness.byTaskType).length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">
                        By Task Type
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(timeBlindness.byTaskType).map(([type, multiplier]) => (
                          <div key={type} className="flex justify-between">
                            <span className="text-gray-300">{type}</span>
                            <span className="text-white font-semibold">{multiplier.toFixed(1)}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Hyperfocus Stats */}
          <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6 text-electric-purple" />
              Hyperfocus Insights
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Sessions</span>
                <span className="text-2xl font-black text-white">
                  {hyperfocusStats.totalSessions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Duration</span>
                <span className="text-lg font-bold text-white">
                  {Math.round(hyperfocusStats.averageDuration)} min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Productivity</span>
                <span className="text-lg font-bold text-white">
                  {hyperfocusStats.productivityAverage.toFixed(1)}/5
                </span>
              </div>

              {hyperfocusStats.totalSessions > 0 && (
                <>
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">
                      Best Time of Day
                    </h4>
                    <p className="text-white font-bold">{hyperfocusStats.bestTimeOfDay}</p>
                  </div>

                  {hyperfocusStats.commonTriggers.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">
                        Common Triggers
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {hyperfocusStats.commonTriggers.map(trigger => (
                          <span
                            key={trigger}
                            className="px-3 py-1 rounded-full bg-electric-purple/20 text-electric-purple text-sm font-semibold"
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Energy Distribution */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-neon-green" />
            Energy Distribution
          </h2>
          <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
            {energyStats.peakTimes.length > 0 ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">High Energy</span>
                      <span className="text-neon-green font-bold">{energyDistribution.high}%</span>
                    </div>
                    <div className="h-4 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon-green rounded-full transition-all duration-500"
                        style={{ width: `${energyDistribution.high}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Medium Energy</span>
                      <span className="text-yellow-400 font-bold">{energyDistribution.medium}%</span>
                    </div>
                    <div className="h-4 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${energyDistribution.medium}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Low Energy</span>
                      <span className="text-red-400 font-bold">{energyDistribution.low}%</span>
                    </div>
                    <div className="h-4 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full transition-all duration-500"
                        style={{ width: `${energyDistribution.low}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Energy Patterns</h4>
                  <div className="space-y-2">
                    {energyStats.patterns.map((pattern, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 rounded-lg bg-white/5 text-gray-300"
                      >
                        {pattern}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Start logging energy levels to see your patterns!
              </div>
            )}
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Projects</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="text-white font-bold">{stats.totalProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Completed</span>
                <span className="text-neon-green font-bold">{stats.completedProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate</span>
                <span className="text-white font-bold">
                  {stats.totalProjects > 0
                    ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Tasks</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="text-white font-bold">{stats.totalTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Completed</span>
                <span className="text-neon-green font-bold">{stats.completedTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">In Progress</span>
                <span className="text-yellow-400 font-bold">
                  {stats.totalTasks - stats.completedTasks}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Tracking</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Time Entries</span>
                <span className="text-white font-bold">{stats.timeTrackingEntries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Energy Logs</span>
                <span className="text-white font-bold">{stats.energyLogsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Brain Dumps</span>
                <span className="text-white font-bold">{stats.brainDumpsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

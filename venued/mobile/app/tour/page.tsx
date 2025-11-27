'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  Flame,
  Zap,
  Star,
  Brain,
  Rocket,
  TrendingUp,
} from 'lucide-react';
import { CrewTask, DayWorkload } from '@/lib/types';
import { getCrewTasks, updateCrewTask } from '@/lib/crew';
import {
  getWeekDays,
  formatDate,
  formatDateKey,
  isToday,
  isPast,
  calculateDayWorkload,
  detectConflicts,
  getSuggestions,
  getWeekWorkloadSummary,
  getRealisticEstimate,
} from '@/lib/tour';

export default function Tour() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [tasks, setTasks] = useState<CrewTask[]>([]);
  const [showRealistic, setShowRealistic] = useState(false);

  useEffect(() => {
    setTasks(getCrewTasks());
  }, []);

  const weekDays = getWeekDays(currentWeekStart);
  const weekSummary = getWeekWorkloadSummary(currentWeekStart);
  const selectedDayWorkload = selectedDay ? calculateDayWorkload(selectedDay) : null;

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
    setSelectedDay(null);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentWeekStart(new Date());
    setSelectedDay(null);
  };

  const handleDayClick = (date: Date) => {
    const dateKey = formatDateKey(date);
    setSelectedDay(dateKey === selectedDay ? null : dateKey);
  };

  const getEnergyIcon = (level: string) => {
    if (level === 'high') return Flame;
    if (level === 'medium') return Zap;
    return Star;
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1800px] mx-auto py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-10 h-10 text-neon-pink" />
              <h1 className="text-5xl font-black text-white tracking-tight">Tour</h1>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousWeek}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 rounded-lg bg-neon-pink text-black font-bold hover:bg-white transition-all"
              >
                Today
              </button>
              <button
                onClick={goToNextWeek}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          <p className="text-xl text-gray-400 max-w-2xl mb-4">
            Your strategic timeline. Plan like a tour manager, execute like a headliner.
          </p>

          {/* Week Summary Bar */}
          <div className="flex items-center gap-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-green" />
              <span className="text-white font-semibold">
                {weekSummary.totalHours.toFixed(1)}h this week
              </span>
              <span className="text-gray-400">({weekSummary.avgHoursPerDay.toFixed(1)}h/day avg)</span>
            </div>
            {weekSummary.overloadedDays > 0 && (
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">{weekSummary.overloadedDays} overloaded days</span>
              </div>
            )}
            {weekSummary.unrealisticDays > 0 && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">{weekSummary.unrealisticDays} unrealistic days</span>
              </div>
            )}
            <button
              onClick={() => setShowRealistic(!showRealistic)}
              className={`ml-auto px-4 py-2 rounded-lg font-semibold transition-all ${
                showRealistic
                  ? 'bg-electric-purple text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {showRealistic ? 'Realistic View' : 'Optimistic View'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Week View */}
          <div className="flex-1">
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day, index) => {
                const dateKey = formatDateKey(day);
                const workload = calculateDayWorkload(dateKey);
                const conflicts = detectConflicts(dateKey);
                const suggestions = getSuggestions(dateKey);
                const dayIsToday = isToday(day);
                const dayIsPast = isPast(day);
                const isSelected = selectedDay === dateKey;

                const displayHours = showRealistic
                  ? getRealisticEstimate(workload.totalHours)
                  : workload.totalHours;

                return (
                  <div key={index} className="space-y-2">
                    {/* Day Header */}
                    <div
                      onClick={() => handleDayClick(day)}
                      className={`p-4 rounded-t-xl border-2 cursor-pointer transition-all ${
                        dayIsToday
                          ? 'border-neon-pink bg-neon-pink/10'
                          : isSelected
                          ? 'border-electric-purple bg-electric-purple/10'
                          : workload.isUnrealistic
                          ? 'border-red-500/50 bg-red-500/10'
                          : workload.isOverloaded
                          ? 'border-yellow-500/50 bg-yellow-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="text-center mb-2">
                        <div className="text-sm text-gray-400 uppercase tracking-wide">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-2xl font-black ${dayIsToday ? 'text-neon-pink' : 'text-white'}`}>
                          {day.getDate()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {day.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>

                      {/* Hours Display */}
                      {workload.totalHours > 0 && (
                        <div className="text-center">
                          <div
                            className={`text-lg font-black ${
                              workload.isUnrealistic
                                ? 'text-red-400'
                                : workload.isOverloaded
                                ? 'text-yellow-400'
                                : 'text-neon-green'
                            }`}
                          >
                            {displayHours.toFixed(1)}h
                          </div>
                          {showRealistic && workload.totalHours !== displayHours && (
                            <div className="text-xs text-gray-500 line-through">
                              {workload.totalHours.toFixed(1)}h
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tasks */}
                    <div className={`p-2 rounded-b-xl border-2 border-t-0 min-h-[200px] ${
                      dayIsToday
                        ? 'border-neon-pink bg-black/30'
                        : isSelected
                        ? 'border-electric-purple bg-black/30'
                        : workload.isUnrealistic
                        ? 'border-red-500/50 bg-black/30'
                        : workload.isOverloaded
                        ? 'border-yellow-500/50 bg-black/30'
                        : 'border-white/10 bg-black/20'
                    }`}>
                      <div className="space-y-2">
                        {workload.tasks.length === 0 ? (
                          <div className="text-center py-8 text-gray-600 text-sm">
                            Free day
                          </div>
                        ) : (
                          workload.tasks.map(task => {
                            const EnergyIcon = getEnergyIcon(task.energyLevel);
                            return (
                              <div
                                key={task.id}
                                className={`p-2 rounded border ${
                                  task.completed
                                    ? 'bg-neon-green/10 border-neon-green/30 opacity-60'
                                    : 'bg-gray-800/50 border-white/10 hover:border-electric-purple/40'
                                } transition-all cursor-pointer`}
                              >
                                <div className="flex items-start gap-2">
                                  <EnergyIcon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                                    task.energyLevel === 'high'
                                      ? 'text-neon-pink'
                                      : task.energyLevel === 'medium'
                                      ? 'text-yellow-400'
                                      : 'text-electric-purple'
                                  }`} />
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-xs font-semibold ${
                                      task.completed ? 'line-through text-gray-500' : 'text-white'
                                    } truncate`}>
                                      {task.title}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-[10px] text-gray-500">
                                        {task.estimatedHours}h
                                      </span>
                                      {task.isHyperfocus && (
                                        <Brain className="w-2.5 h-2.5 text-blue-400" />
                                      )}
                                      {task.isQuickWin && (
                                        <Rocket className="w-2.5 h-2.5 text-neon-green" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Today Marker */}
                    {dayIsToday && (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neon-pink/20 border border-neon-pink">
                          <div className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                          <span className="text-xs font-bold text-neon-pink">TODAY</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar - Day Details */}
          {selectedDay && selectedDayWorkload && (
            <div className="w-96 flex-shrink-0 space-y-6 sticky top-24">
              {/* Day Info */}
              <div className="p-6 rounded-xl border-2 border-electric-purple/30 bg-electric-purple/10">
                <h3 className="text-2xl font-black text-white mb-2">
                  {new Date(selectedDay).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Hours</span>
                    <span className="text-2xl font-black text-white">
                      {selectedDayWorkload.totalHours.toFixed(1)}h
                    </span>
                  </div>
                  {showRealistic && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Realistic Estimate</span>
                      <span className="font-bold text-yellow-400">
                        {getRealisticEstimate(selectedDayWorkload.totalHours).toFixed(1)}h
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tasks</span>
                    <span className="font-bold text-white">{selectedDayWorkload.tasks.length}</span>
                  </div>
                </div>
              </div>

              {/* Energy Distribution */}
              <div className="p-6 rounded-xl border-2 border-white/10 bg-gray-900/30">
                <h4 className="font-bold text-white mb-4">Energy Distribution</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-neon-pink flex items-center gap-1">
                        <Flame className="w-4 h-4" /> High
                      </span>
                      <span className="text-white font-semibold">
                        {selectedDayWorkload.energyDistribution.high.toFixed(1)}h
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon-pink"
                        style={{
                          width: `${
                            selectedDayWorkload.totalHours > 0
                              ? (selectedDayWorkload.energyDistribution.high / selectedDayWorkload.totalHours) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-yellow-400 flex items-center gap-1">
                        <Zap className="w-4 h-4" /> Medium
                      </span>
                      <span className="text-white font-semibold">
                        {selectedDayWorkload.energyDistribution.medium.toFixed(1)}h
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${
                            selectedDayWorkload.totalHours > 0
                              ? (selectedDayWorkload.energyDistribution.medium / selectedDayWorkload.totalHours) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-electric-purple flex items-center gap-1">
                        <Star className="w-4 h-4" /> Low
                      </span>
                      <span className="text-white font-semibold">
                        {selectedDayWorkload.energyDistribution.low.toFixed(1)}h
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-electric-purple"
                        style={{
                          width: `${
                            selectedDayWorkload.totalHours > 0
                              ? (selectedDayWorkload.energyDistribution.low / selectedDayWorkload.totalHours) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Conflicts */}
              {detectConflicts(selectedDay).length > 0 && (
                <div className="p-6 rounded-xl border-2 border-red-500/30 bg-red-500/10">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Warnings
                  </h4>
                  <div className="space-y-2">
                    {detectConflicts(selectedDay).map((conflict, i) => (
                      <div key={i} className="text-sm text-red-200">
                        {conflict}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {getSuggestions(selectedDay).length > 0 && (
                <div className="p-6 rounded-xl border-2 border-blue-500/30 bg-blue-500/10">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-400" />
                    Suggestions
                  </h4>
                  <div className="space-y-2">
                    {getSuggestions(selectedDay).map((suggestion, i) => (
                      <div key={i} className="text-sm text-blue-200">
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ADHD Reality Check Footer */}
        <div className="mt-8 p-6 rounded-xl border-2 border-electric-purple/30 bg-gradient-to-r from-electric-purple/10 to-neon-pink/10">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 text-electric-purple flex-shrink-0" />
            <div>
              <h4 className="font-bold text-white mb-2">ADHD Reality Check</h4>
              <p className="text-gray-400 text-sm mb-2">
                Remember: We typically underestimate time by 1.8x. Toggle "Realistic View" to see adjusted estimates.
              </p>
              <p className="text-gray-400 text-sm">
                💡 Tip: Build in buffer time, schedule breaks, and don't pack days back-to-back.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Users, List, Zap, Clock, Shuffle, Flame, Star, TrendingUp, CheckCircle2, Trophy } from 'lucide-react';
import { CrewTask, CrewView, DateFilter, EnergyLevel } from '@/lib/types';
import {
  getCrewTasks,
  toggleCrewTaskComplete,
  updateCrewTask,
  calculateCrewStats,
  initializeSampleCrewTasks,
  celebrateAllComplete
} from '@/lib/crew';
import CrewTaskCard from '@/components/crew/CrewTaskCard';
import FocusTimer from '@/components/crew/FocusTimer';

export default function Crew() {
  const [tasks, setTasks] = useState<CrewTask[]>([]);
  const [view, setView] = useState<CrewView>('list');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>('medium');
  const [focusTask, setFocusTask] = useState<CrewTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeSampleCrewTasks();
    const loadedTasks = getCrewTasks();
    setTasks(loadedTasks);
    setIsLoading(false);
  }, []);

  const stats = calculateCrewStats();

  // Filter tasks by date
  const getDateFilteredTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return tasks.filter(task => {
      if (dateFilter === 'today') return task.scheduledDate === today;
      if (dateFilter === 'tomorrow') return task.scheduledDate === tomorrow;
      // 'week' - return all for now
      return true;
    });
  };

  const filteredTasks = getDateFilteredTasks();
  const incompleteTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  // Energy-matched tasks
  const energyMatchedTasks = incompleteTasks.filter(t => t.energyLevel === currentEnergy);

  const handleToggleComplete = (taskId: string) => {
    const updatedTask = toggleCrewTaskComplete(taskId);
    if (updatedTask) {
      setTasks(getCrewTasks());

      // Check if all tasks complete
      const remaining = getCrewTasks().filter(t => !t.completed && t.scheduledDate === new Date().toISOString().split('T')[0]);
      if (remaining.length === 0) {
        celebrateAllComplete();
      }
    }
  };

  const handleStartFocus = (task: CrewTask) => {
    setFocusTask(task);
  };

  const handleFocusComplete = (minutes: number) => {
    if (focusTask) {
      updateCrewTask(focusTask.id, {
        timeSpent: focusTask.timeSpent + minutes,
      });
      setTasks(getCrewTasks());
    }
    setFocusTask(null);
  };

  const handlePickOne = () => {
    if (incompleteTasks.length === 0) return;

    const energyMatched = incompleteTasks.filter(t => t.energyLevel === currentEnergy);
    const pool = energyMatched.length > 0 ? energyMatched : incompleteTasks;
    const randomTask = pool[Math.floor(Math.random() * pool.length)];

    // Scroll to task and highlight it
    setFocusTask(randomTask);
    setTimeout(() => {
      const element = document.getElementById(`task-${randomTask.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Render tasks by energy level
  const renderEnergyColumns = () => {
    const energyLevels: EnergyLevel[] = ['high', 'medium', 'low'];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {energyLevels.map(level => {
          const energyTasks = incompleteTasks.filter(t => t.energyLevel === level);
          const config = {
            high: { icon: Flame, color: 'neon-pink', label: 'High Energy', emoji: '🔥' },
            medium: { icon: Zap, color: 'yellow-400', label: 'Medium Energy', emoji: '⚡' },
            low: { icon: Star, color: 'electric-purple', label: 'Low Energy', emoji: '⭐' },
          };
          const { icon: Icon, color, label, emoji } = config[level];

          return (
            <div key={level} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 text-${color}`} />
                  <h3 className="text-lg font-bold text-white">{emoji} {label}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full bg-${color}/20 text-${color} text-sm font-semibold`}>
                  {energyTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {energyTasks.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-gray-700 bg-gray-900/30 text-center">
                    <p className="text-gray-500 text-sm">No {level} energy tasks</p>
                  </div>
                ) : (
                  energyTasks.map(task => (
                    <div key={task.id} id={`task-${task.id}`}>
                      <CrewTaskCard
                        task={task}
                        onToggleComplete={() => handleToggleComplete(task.id)}
                        onStartFocus={() => handleStartFocus(task)}
                        isActive={focusTask?.id === task.id}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className="space-y-3">
        {incompleteTasks.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-gray-700 bg-gray-900/30 text-center">
            <Trophy className="w-16 h-16 text-neon-green mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">All Clear!</h3>
            <p className="text-gray-400">No tasks for {dateFilter}. You're crushing it! 🎸</p>
          </div>
        ) : (
          incompleteTasks.map(task => (
            <div key={task.id} id={`task-${task.id}`}>
              <CrewTaskCard
                task={task}
                onToggleComplete={() => handleToggleComplete(task.id)}
                onStartFocus={() => handleStartFocus(task)}
                isActive={focusTask?.id === task.id}
              />
            </div>
          ))
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your crew...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-[1800px] mx-auto py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-neon-green" />
              <h1 className="text-5xl font-black text-white tracking-tight">Crew</h1>
            </div>

            {/* View Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  view === 'list'
                    ? 'bg-neon-pink text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <List className="w-4 h-4 inline mr-2" />
                List
              </button>
              <button
                onClick={() => setView('energy')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  view === 'energy'
                    ? 'bg-neon-pink text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                Energy
              </button>
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-3 mb-4">
            {(['today', 'tomorrow', 'week'] as DateFilter[]).map(filter => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                  dateFilter === filter
                    ? 'bg-electric-purple text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Tasks Area */}
          <div className="flex-1">
            {view === 'list' && renderListView()}
            {view === 'energy' && renderEnergyColumns()}

            {/* Completed Section */}
            {completedTasks.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-neon-green" />
                  Completed ({completedTasks.length})
                </h3>
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <div key={task.id} className="opacity-60">
                      <CrewTaskCard
                        task={task}
                        onToggleComplete={() => handleToggleComplete(task.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-6 sticky top-24">
            {/* Focus Timer */}
            <FocusTimer
              task={focusTask}
              onComplete={handleFocusComplete}
              onStop={() => setFocusTask(null)}
            />

            {/* Stats */}
            <div className="p-6 rounded-xl border-2 border-white/10 bg-gray-900/30">
              <h3 className="text-lg font-bold text-white mb-4">Today's Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-2xl font-black text-neon-green">
                    {stats.todayCompleted}/{stats.todayTotal}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-pink to-neon-green"
                    style={{ width: `${stats.todayTotal > 0 ? (stats.todayCompleted / stats.todayTotal) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Focus Time</span>
                  <span className="font-bold text-white">{stats.focusMinutes}m</span>
                </div>
              </div>
            </div>

            {/* Energy Selector */}
            <div className="p-6 rounded-xl border-2 border-white/10 bg-gray-900/30">
              <h3 className="text-lg font-bold text-white mb-4">Current Energy</h3>
              <div className="space-y-2">
                {(['high', 'medium', 'low'] as EnergyLevel[]).map(level => {
                  const config = {
                    high: { icon: Flame, color: 'neon-pink', label: 'High', emoji: '🔥' },
                    medium: { icon: Zap, color: 'yellow-400', label: 'Medium', emoji: '⚡' },
                    low: { icon: Star, color: 'electric-purple', label: 'Low', emoji: '⭐' },
                  };
                  const { icon: Icon, color, label, emoji } = config[level];
                  const matchingTasks = incompleteTasks.filter(t => t.energyLevel === level).length;

                  return (
                    <button
                      key={level}
                      onClick={() => setCurrentEnergy(level)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold transition-all ${
                        currentEnergy === level
                          ? `bg-${color}/20 text-${color} border-2 border-${color}/40`
                          : 'bg-white/5 text-gray-400 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{emoji} {label}</span>
                      </div>
                      <span className="text-xs">{matchingTasks} tasks</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={handlePickOne}
                disabled={incompleteTasks.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-neon-pink to-electric-purple text-black font-bold hover:shadow-[0_0_30px_rgba(255,27,141,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle className="w-5 h-5" />
                Pick One For Me
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-white/10 px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-green" />
              <span className="text-white font-semibold">
                {stats.todayCompleted} / {stats.todayTotal} completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-electric-purple" />
              <span className="text-white font-semibold">{stats.focusMinutes}m focused</span>
            </div>
            {energyMatchedTasks.length > 0 && (
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">
                  {energyMatchedTasks.length} tasks match your energy
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

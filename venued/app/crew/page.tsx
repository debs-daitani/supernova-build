'use client';

import { useState, useEffect } from 'react';
import { Users, List, Zap, Clock, Shuffle, Flame, Star, TrendingUp, CheckCircle2, Trophy, Plus, Rocket, Music, ChevronDown, ChevronUp, ExternalLink, Edit3 } from 'lucide-react';
import { CrewTask, CrewView, DateFilter, EnergyLevel, Tour, Action, GigVibe } from '@/lib/types';
import {
  getCrewTasks,
  toggleCrewTaskComplete,
  updateCrewTask,
  calculateCrewStats,
  initializeSampleCrewTasks,
  celebrateAllComplete,
  addCrewTask
} from '@/lib/crew';
import { getTours, getActions, getLooseActions, getActionsByTourId, toggleActionComplete, calculateTourProgress } from '@/lib/tours';
import CrewTaskCard from '@/components/crew/CrewTaskCard';
import FocusTimer from '@/components/crew/FocusTimer';
import LFGChoiceModal from '@/components/LFGChoiceModal';
import QuickActionModal from '@/components/QuickActionModal';
import ActionEditModal from '@/components/ActionEditModal';

// Helper to safely extract hostname from URL
const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    // If invalid URL, just show truncated string
    return url.length > 20 ? url.substring(0, 20) + '...' : url;
  }
};

export default function Crew() {
  const [tasks, setTasks] = useState<CrewTask[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [expandedTours, setExpandedTours] = useState<Set<string>>(new Set());
  const [view, setView] = useState<CrewView>('list');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>('medium');
  const [focusTask, setFocusTask] = useState<CrewTask | null>(null);
  const [focusAction, setFocusAction] = useState<Action | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFuckItMode, setShowFuckItMode] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showLFGModal, setShowLFGModal] = useState(false);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [selectedTourForAction, setSelectedTourForAction] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    energyLevel: 'medium' as EnergyLevel,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    estimatedHours: 1,
    scheduledDate: new Date().toISOString().split('T')[0],
  });
  const [fuckItTask, setFuckItTask] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    initializeSampleCrewTasks();
    loadData();
    setIsLoading(false);
  }, []);

  const loadData = () => {
    const loadedTasks = getCrewTasks();
    setTasks(loadedTasks);
    const loadedTours = getTours().filter(t => !t.isArchived);
    setTours(loadedTours);
    const loadedActions = getActions();
    setActions(loadedActions);
  };

  const stats = calculateCrewStats();

  // Filter tasks by date
  const getDateFilteredTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return tasks.filter(task => {
      if (dateFilter === 'today') return task.scheduledDate === today;
      if (dateFilter === 'tomorrow') return task.scheduledDate === tomorrow;
      return true;
    });
  };

  const filteredTasks = getDateFilteredTasks().filter(task => {
    if (priorityFilter === 'all') return true;
    // Map energy level to priority for filtering
    return task.energyLevel === priorityFilter ||
           (task.difficulty === 'hard' && priorityFilter === 'high') ||
           (task.difficulty === 'medium' && priorityFilter === 'medium') ||
           (task.difficulty === 'easy' && priorityFilter === 'low');
  });

  const incompleteTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);
  const energyMatchedTasks = incompleteTasks.filter(t => t.energyLevel === currentEnergy);

  const handleToggleComplete = (taskId: string) => {
    const updatedTask = toggleCrewTaskComplete(taskId);
    if (updatedTask) {
      setTasks(getCrewTasks());
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

  const handleFuckItDoIt = () => {
    if (!fuckItTask.title.trim()) return;

    // Create new task with 48-hour deadline
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 48);

    const newFuckItTask: CrewTask = {
      id: `fuckit-${Date.now()}`,
      title: fuckItTask.title,
      description: fuckItTask.description || 'FUCK IT - DO IT challenge task',
      phaseId: 'fuckit',
      energyLevel: 'high',
      difficulty: 'hard',
      estimatedHours: 48,
      isHyperfocus: true,
      isQuickWin: false,
      dependencies: [],
      completed: false,
      order: 0,
      createdAt: new Date().toISOString(),
      scheduledDate: new Date().toISOString().split('T')[0],
      timeSpent: 0,
    };

    addCrewTask(newFuckItTask);
    setTasks(getCrewTasks());
    setFocusTask(newFuckItTask);
    setShowFuckItMode(false);
    setFuckItTask({ title: '', description: '' });
  };

  const handlePickOne = () => {
    if (incompleteTasks.length === 0) return;
    const energyMatched = incompleteTasks.filter(t => t.energyLevel === currentEnergy);
    const pool = energyMatched.length > 0 ? energyMatched : incompleteTasks;
    const randomTask = pool[Math.floor(Math.random() * pool.length)];
    setFocusTask(randomTask);
    setTimeout(() => {
      const element = document.getElementById(`task-${randomTask.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleAddNewTask = () => {
    if (!newTask.title.trim()) return;

    addCrewTask({
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      phaseId: 'general',
      energyLevel: newTask.energyLevel,
      difficulty: newTask.difficulty,
      estimatedHours: newTask.estimatedHours,
      isHyperfocus: false,
      isQuickWin: newTask.difficulty === 'easy',
      dependencies: [],
      completed: false,
      order: 0,
      createdAt: new Date().toISOString(),
      scheduledDate: newTask.scheduledDate,
      timeSpent: 0,
    });

    setTasks(getCrewTasks());
    setNewTask({
      title: '',
      description: '',
      energyLevel: 'medium',
      difficulty: 'medium',
      estimatedHours: 1,
      scheduledDate: new Date().toISOString().split('T')[0],
    });
    setShowAddTask(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-josefin">Loading your crew...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="header-gradient-crew rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-supernova text-white tracking-tight">
                    CREW
                  </h1>
                  <p className="text-base sm:text-lg font-arp-display text-white/80 mt-1">
                    Your project planning hub
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLFGModal(true)}
                className="w-full sm:w-auto group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold rounded-full hover:shadow-[0_0_30px_rgba(255,0,142,0.6)] transition-all duration-300"
              >
                <span className="text-xl">🤘</span>
                LFG!
              </button>
            </div>
          </div>
        </div>

        {/* Add New Action Modal */}
        {showAddTask && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 pb-8 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-dark-grey-azure rounded-2xl border border-magenta/30 max-w-md w-full p-6 my-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-supernova text-white">Add New Action</h2>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-400 hover:text-white">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Action Name *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="What do you need to do?"
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">The Lyrics</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Notes, details, links..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Gig Vibe Needed</label>
                  <div className="flex gap-2">
                    {(['high', 'medium', 'low'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setNewTask({ ...newTask, energyLevel: level })}
                        className={`flex-1 py-2 rounded-lg font-semibold capitalize transition-all ${
                          newTask.energyLevel === level
                            ? level === 'high'
                              ? 'bg-vivid-yellow-green text-black'
                              : level === 'medium'
                              ? 'bg-magenta text-white'
                              : 'bg-vivid-cyan text-black'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Difficulty</label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setNewTask({ ...newTask, difficulty: diff })}
                        className={`flex-1 py-2 rounded-lg font-semibold capitalize transition-all ${
                          newTask.difficulty === diff
                            ? 'bg-magenta text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Estimated Hours</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Scheduled Date</label>
                  <input
                    type="date"
                    value={newTask.scheduledDate}
                    onChange={(e) => setNewTask({ ...newTask, scheduledDate: e.target.value })}
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 py-3 rounded-lg border-2 border-white/10 text-white font-semibold hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 py-3 rounded-lg bg-magenta text-black font-bold hover:bg-neon-cyan transition-all disabled:opacity-50"
                >
                  Add Action
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Date Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['today', 'tomorrow', 'week'] as DateFilter[]).map(filter => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-2 rounded-full font-semibold capitalize transition-all mobile-touch-target ${
                dateFilter === filter
                  ? 'bg-magenta text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              priorityFilter === 'all'
                ? 'bg-magenta text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPriorityFilter('high')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              priorityFilter === 'high'
                ? 'bg-vivid-yellow-green text-black'
                : 'bg-white/5 text-vivid-yellow-green hover:bg-vivid-yellow-green/20'
            }`}
          >
            High
          </button>
          <button
            onClick={() => setPriorityFilter('medium')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              priorityFilter === 'medium'
                ? 'bg-vivid-pink text-white'
                : 'bg-white/5 text-vivid-pink hover:bg-vivid-pink/20'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setPriorityFilter('low')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              priorityFilter === 'low'
                ? 'bg-vivid-cyan text-black'
                : 'bg-white/5 text-vivid-cyan hover:bg-vivid-cyan/20'
            }`}
          >
            Low
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Active Tours Section */}
            {tours.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Music className="w-5 h-5 text-magenta" />
                  Active Tours
                </h3>
                {tours.map((tour) => {
                  const tourActions = actions.filter(a => a.tourId === tour.id);
                  const incompleteActions = tourActions.filter(a => !a.completed);
                  const completedActions = tourActions.filter(a => a.completed);
                  const progress = calculateTourProgress(tour);
                  const isExpanded = expandedTours.has(tour.id);

                  return (
                    <div
                      key={tour.id}
                      className={`rounded-xl border-2 transition-all ${
                        tour.stage === 'planning'
                          ? 'border-azure/30 bg-azure/5'
                          : tour.stage === 'development'
                          ? 'border-magenta/30 bg-magenta/5'
                          : 'border-vivid-yellow-green/30 bg-vivid-yellow-green/5'
                      }`}
                    >
                      {/* Tour Header */}
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedTours);
                          if (isExpanded) {
                            newExpanded.delete(tour.id);
                          } else {
                            newExpanded.add(tour.id);
                          }
                          setExpandedTours(newExpanded);
                        }}
                        className="w-full p-4 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            tour.stage === 'planning'
                              ? 'bg-azure/20 text-azure'
                              : tour.stage === 'development'
                              ? 'bg-magenta/20 text-magenta'
                              : 'bg-vivid-yellow-green/20 text-vivid-yellow-green'
                          }`}>
                            <Music className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{tour.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span className="capitalize">{tour.stage}</span>
                              <span>•</span>
                              <span>{incompleteActions.length} actions remaining</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-lg font-bold text-white">{progress}%</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Progress Bar */}
                      <div className="px-4 pb-4">
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              tour.stage === 'planning'
                                ? 'bg-azure'
                                : tour.stage === 'development'
                                ? 'bg-magenta'
                                : 'bg-vivid-yellow-green'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Expanded Actions */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3">
                          {incompleteActions.length === 0 && completedActions.length === 0 ? (
                            <div className="text-center py-4 text-gray-400">
                              <p className="mb-2">No actions yet. Add your first step!</p>
                              <button
                                onClick={() => {
                                  setSelectedTourForAction(tour.id);
                                  setShowQuickActionModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-magenta/20 text-magenta rounded-lg text-sm font-semibold hover:bg-magenta/30 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                Add Action
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Incomplete Actions */}
                              {incompleteActions.map((action) => (
                                <div
                                  key={action.id}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 group"
                                >
                                  <button
                                    onClick={() => {
                                      toggleActionComplete(action.id);
                                      loadData();
                                    }}
                                    className="w-6 h-6 rounded-full border-2 border-gray-500 hover:border-vivid-yellow-green transition-colors flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">{action.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                      <span className={`px-1.5 py-0.5 rounded ${
                                        action.gigVibe === 'high'
                                          ? 'bg-vivid-yellow-green/20 text-vivid-yellow-green'
                                          : action.gigVibe === 'medium'
                                          ? 'bg-magenta/20 text-magenta'
                                          : 'bg-neon-cyan/20 text-neon-cyan'
                                      }`}>
                                        {action.gigVibe}
                                      </span>
                                      {action.scheduledDate && (
                                        <span>{new Date(action.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                      )}
                                    </div>
                                    {action.links && action.links.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {action.links.map((link, i) => (
                                          <a
                                            key={i}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neon-cyan/10 text-neon-cyan text-xs rounded hover:bg-neon-cyan/20 transition-colors"
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                            <span className="truncate max-w-[80px]">{getHostname(link)}</span>
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditingAction(action);
                                      setShowEditModal(true);
                                    }}
                                    className="p-2 text-gray-500 hover:text-magenta opacity-0 group-hover:opacity-100 transition-all"
                                    title="Edit action"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}

                              {/* Add Action Button */}
                              <button
                                onClick={() => {
                                  setSelectedTourForAction(tour.id);
                                  setShowQuickActionModal(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-white/20 text-gray-400 hover:border-magenta/50 hover:text-magenta transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                Add Action
                              </button>

                              {/* Completed Actions */}
                              {completedActions.length > 0 && (
                                <div className="pt-2 border-t border-white/10">
                                  <p className="text-xs text-gray-500 mb-2">{completedActions.length} completed</p>
                                  {completedActions.slice(0, 3).map((action) => (
                                    <div
                                      key={action.id}
                                      className="flex items-center gap-3 p-2 opacity-60"
                                    >
                                      <button
                                        onClick={() => {
                                          toggleActionComplete(action.id);
                                          loadData();
                                        }}
                                        className="w-5 h-5 rounded-full bg-vivid-yellow-green flex items-center justify-center flex-shrink-0"
                                      >
                                        <CheckCircle2 className="w-3 h-3 text-black" />
                                      </button>
                                      <span className="text-sm text-gray-400 line-through truncate">{action.title}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Loose Actions Section */}
            {(() => {
              const looseActions = actions.filter(a => a.tourId === null && !a.completed);
              const completedLooseActions = actions.filter(a => a.tourId === null && a.completed);

              if (looseActions.length === 0 && completedLooseActions.length === 0 && tours.length > 0) {
                return null;
              }

              return (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-neon-cyan" />
                    Loose Actions
                  </h3>

                  {looseActions.length === 0 && incompleteTasks.length === 0 ? (
                    <div className="p-8 sm:p-12 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/30 text-center">
                      <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-vivid-yellow-green mx-auto mb-4" />
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">All Clear!</h3>
                      <p className="text-gray-400">No actions scheduled. You're rocking it!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* New Actions */}
                      {looseActions.map((action) => (
                        <div
                          key={action.id}
                          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 group"
                        >
                          <button
                            onClick={() => {
                              toggleActionComplete(action.id);
                              loadData();
                            }}
                            className="w-6 h-6 rounded-full border-2 border-gray-500 hover:border-vivid-yellow-green transition-colors flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white">{action.title}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span className={`px-2 py-0.5 rounded ${
                                action.gigVibe === 'high'
                                  ? 'bg-vivid-yellow-green/20 text-vivid-yellow-green'
                                  : action.gigVibe === 'medium'
                                  ? 'bg-magenta/20 text-magenta'
                                  : 'bg-neon-cyan/20 text-neon-cyan'
                              }`}>
                                {action.gigVibe}
                              </span>
                              {action.scheduledDate && (
                                <span>{new Date(action.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                              )}
                            </div>
                            {action.links && action.links.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {action.links.map((link, i) => (
                                  <a
                                    key={i}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-neon-cyan/10 text-neon-cyan text-xs rounded hover:bg-neon-cyan/20 transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="truncate max-w-[100px]">{getHostname(link)}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setEditingAction(action);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-magenta opacity-0 group-hover:opacity-100 transition-all"
                            title="Edit action"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Legacy Tasks (from old system) */}
                      {incompleteTasks.map(task => (
                        <div key={task.id} id={`task-${task.id}`}>
                          <CrewTaskCard
                            task={task}
                            onToggleComplete={() => handleToggleComplete(task.id)}
                            onStartFocus={() => handleStartFocus(task)}
                            isActive={focusTask?.id === task.id}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Completed Section */}
            {(completedTasks.length > 0 || actions.filter(a => a.completed).length > 0) && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-vivid-yellow-green" />
                  Completed ({completedTasks.length + actions.filter(a => a.completed && a.tourId === null).length})
                </h3>
                <div className="space-y-2">
                  {/* Completed new actions */}
                  {actions.filter(a => a.completed && a.tourId === null).slice(0, 5).map(action => (
                    <div
                      key={action.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 opacity-60"
                    >
                      <button
                        onClick={() => {
                          toggleActionComplete(action.id);
                          loadData();
                        }}
                        className="w-5 h-5 rounded-full bg-vivid-yellow-green flex items-center justify-center flex-shrink-0"
                      >
                        <CheckCircle2 className="w-3 h-3 text-black" />
                      </button>
                      <span className="text-sm text-gray-400 line-through">{action.title}</span>
                    </div>
                  ))}
                  {/* Legacy completed tasks */}
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

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Focus Timer */}
            <FocusTimer
              task={focusTask}
              onComplete={handleFocusComplete}
              onStop={() => setFocusTask(null)}
            />

            {/* Today's Stats */}
            <div className="p-4 sm:p-6 rounded-xl border-2 border-white/10 bg-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Today's Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-2xl font-bold text-vivid-yellow-green">
                    {stats.todayCompleted}/{stats.todayTotal}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-magenta to-vivid-yellow-green transition-all"
                    style={{ width: `${stats.todayTotal > 0 ? (stats.todayCompleted / stats.todayTotal) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Focus Time</span>
                  <span className="font-bold text-white">{stats.focusMinutes}m</span>
                </div>
              </div>
            </div>

            
            {/* Pick One For Me */}
            <button
              onClick={handlePickOne}
              disabled={incompleteTasks.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-magenta to-vivid-pink text-white font-bold hover:shadow-[0_0_30px_rgba(255,0,142,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shuffle className="w-5 h-5" />
              Pick One For Me
            </button>
          </div>
        </div>

        {/* FUCK IT - DO IT Section */}
        <div className="mt-8 mb-24 md:mb-8">
          <div className="max-w-2xl mx-auto p-6 rounded-xl border-2 border-magenta/30 bg-gradient-to-br from-magenta/20 to-neon-cyan/20">
            <button
              type="button"
              onClick={() => setShowFuckItMode(true)}
              className="w-full py-5 px-6 rounded-xl bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold text-2xl hover:shadow-[0_0_40px_rgba(255,0,142,0.6)] transition-all mb-3 cursor-pointer"
            >
              <span className="text-2xl mr-2">🤘</span>
              FUCK IT - DO IT!
            </button>
            <p className="text-sm text-gray-400 text-center font-josefin">
              48-hour commitment challenge
            </p>
          </div>
        </div>

        {/* FUCK IT Modal */}
        {showFuckItMode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-dark-grey-azure rounded-2xl border-2 border-magenta/50 max-w-md w-full p-6">
              <div className="text-center mb-6">
                <span className="text-6xl mb-4 block">🤘</span>
                <h2 className="text-3xl font-supernova text-magenta mb-2">FUCK IT - DO IT!</h2>
                <p className="text-gray-400 font-josefin text-sm">
                  48-hour commitment. No overthinking. No excuses. Just action.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">What are you committing to? *</label>
                  <input
                    type="text"
                    value={fuckItTask.title}
                    onChange={(e) => setFuckItTask({ ...fuckItTask, title: e.target.value })}
                    placeholder="e.g., Launch the website, Finish the pitch deck"
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-magenta/30 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Why does this matter? (optional)</label>
                  <textarea
                    value={fuckItTask.description}
                    onChange={(e) => setFuckItTask({ ...fuckItTask, description: e.target.value })}
                    placeholder="Your motivation for getting this done..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-magenta/10 border border-magenta/30 mb-6">
                <p className="text-sm text-magenta font-semibold text-center">
                  ⏰ You have 48 hours starting NOW
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFuckItMode(false);
                    setFuckItTask({ title: '', description: '' });
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10"
                >
                  Not yet
                </button>
                <button
                  type="button"
                  onClick={handleFuckItDoIt}
                  disabled={!fuckItTask.title.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold hover:shadow-[0_0_30px_rgba(255,0,142,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  LET'S GO! 🤘
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Stats Bar - Desktop only */}
        <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-dark-grey-azure/95 backdrop-blur-md border-t border-white/10 px-6 py-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-vivid-yellow-green" />
                <span className="text-white font-semibold">
                  {stats.todayCompleted} / {stats.todayTotal} completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-vivid-pink" />
                <span className="text-white font-semibold">{stats.focusMinutes}m focused</span>
              </div>
              {energyMatchedTasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-vivid-yellow-green" />
                  <span className="text-vivid-yellow-green font-semibold">
                    {energyMatchedTasks.length} tasks match your energy
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LFG Choice Modal */}
        <LFGChoiceModal
          isOpen={showLFGModal}
          onClose={() => setShowLFGModal(false)}
          onCreated={() => {
            loadData();
            setShowLFGModal(false);
          }}
        />

        {/* Quick Action Modal for adding to a specific tour */}
        <QuickActionModal
          isOpen={showQuickActionModal}
          onClose={() => {
            setShowQuickActionModal(false);
            setSelectedTourForAction(null);
          }}
          onCreated={() => {
            loadData();
            setShowQuickActionModal(false);
            setSelectedTourForAction(null);
          }}
          defaultTourId={selectedTourForAction}
        />

        {/* Action Edit Modal */}
        <ActionEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingAction(null);
          }}
          onUpdated={() => {
            loadData();
            setShowEditModal(false);
            setEditingAction(null);
          }}
          action={editingAction}
        />
      </div>
    </div>
  );
}

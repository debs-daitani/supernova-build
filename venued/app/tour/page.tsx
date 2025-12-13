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
  Plus,
  X,
  Edit3,
} from 'lucide-react';
import { CrewTask, DayWorkload } from '@/lib/types';
import { getCrewTasks, updateCrewTask, addCrewTask } from '@/lib/crew';
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

// Day colors from brand spec
const dayColors: Record<string, { color: string; glowClass: string }> = {
  monday: { color: '#C9005C', glowClass: 'day-glow-monday' },
  tuesday: { color: '#FF008E', glowClass: 'day-glow-tuesday' },
  wednesday: { color: '#00F0E9', glowClass: 'day-glow-wednesday' },
  thursday: { color: '#00A29D', glowClass: 'day-glow-thursday' },
  friday: { color: '#366F7E', glowClass: 'day-glow-friday' },
  saturday: { color: '#37454E', glowClass: '' },
  sunday: { color: '#3D3D3D', glowClass: '' },
};

export default function Tour() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [tasks, setTasks] = useState<CrewTask[]>([]);
  const [showRealistic, setShowRealistic] = useState(true);
  const [showMonthView, setShowMonthView] = useState(false);
  const [editingTask, setEditingTask] = useState<CrewTask | null>(null);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    energyLevel: 'medium' as 'high' | 'medium' | 'low',
    estimatedHours: 1,
  });

  // Get Monday of the current week
  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  useEffect(() => {
    setTasks(getCrewTasks());
  }, []);

  // Get week days starting from Monday
  const getWeekDaysFromMonday = (startDate: Date): Date[] => {
    const days: Date[] = [];
    const monday = getMonday(startDate);
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDaysFromMonday(currentWeekStart);
  const weekSummary = getWeekWorkloadSummary(currentWeekStart);
  const selectedDayWorkload = selectedDay ? calculateDayWorkload(selectedDay) : null;

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(getMonday(newDate));
    setSelectedDay(null);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(getMonday(newDate));
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
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

  const getDayColorInfo = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return dayColors[dayName] || { color: '#3D3D3D', glowClass: '' };
  };

  // Get month calendar days
  const getMonthDays = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Get day of week for first day (0 = Sunday, adjust for Monday start)
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    // Add empty slots for days before the first
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleTaskEdit = (task: CrewTask) => {
    setEditingTask(task);
  };

  const handleSaveTask = (updatedFields: Partial<CrewTask>) => {
    if (editingTask) {
      updateCrewTask(editingTask.id, updatedFields);
      setTasks(getCrewTasks());
      setEditingTask(null);
    }
  };

  const handleAddNewTask = () => {
    if (!newTask.title.trim() || !selectedDay) return;

    addCrewTask({
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: '',
      phaseId: 'general',
      energyLevel: newTask.energyLevel,
      difficulty: 'medium',
      estimatedHours: newTask.estimatedHours,
      isHyperfocus: false,
      isQuickWin: false,
      dependencies: [],
      completed: false,
      order: 0,
      createdAt: new Date().toISOString(),
      scheduledDate: selectedDay,
      timeSpent: 0,
    });

    setTasks(getCrewTasks());
    setNewTask({
      title: '',
      energyLevel: 'medium',
      estimatedHours: 1,
    });
    setShowAddTask(false);
  };

  const openAddTaskModal = () => {
    setShowAddTask(true);
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="header-gradient-tour rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-supernova text-white tracking-tight">
                    TOUR
                  </h1>
                  <p className="text-base sm:text-lg font-arp-display text-white/80 mt-1">
                    Your strategic timeline
                  </p>
                </div>
              </div>

              {/* Week Navigation */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors mobile-touch-target"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 rounded-lg bg-vivid-cyan text-black font-bold hover:bg-white transition-all"
                >
                  Today
                </button>
                <button
                  onClick={goToNextWeek}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors mobile-touch-target"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reality Buffer Banner */}
        <div className="mb-6 p-4 rounded-xl bg-vivid-yellow-green/10 border border-vivid-yellow-green/30">
          <p className="text-center text-vivid-yellow-green font-semibold text-sm sm:text-base">
            Times shown = your estimate x 1.8 (VARIANT reality buffer)
          </p>
        </div>

        {/* Week Summary Bar */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-vivid-yellow-green" />
            <span className="text-white font-semibold">
              {weekSummary.totalHours.toFixed(1)}h this week
            </span>
            <span className="text-gray-400 text-sm">({weekSummary.avgHoursPerDay.toFixed(1)}h/day avg)</span>
          </div>
          {weekSummary.overloadedDays > 0 && (
            <div className="flex items-center gap-2 text-vivid-yellow-green">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">{weekSummary.overloadedDays} overloaded days</span>
            </div>
          )}
          {weekSummary.unrealisticDays > 0 && (
            <div className="flex items-center gap-2 text-vivid-pink">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">{weekSummary.unrealisticDays} unrealistic days</span>
            </div>
          )}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowMonthView(!showMonthView)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                showMonthView
                  ? 'bg-azure text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              View Month
            </button>
          </div>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4 mb-6">
          {weekDays.map((day, index) => {
            const dateKey = formatDateKey(day);
            const workload = calculateDayWorkload(dateKey);
            const dayIsToday = isToday(day);
            const dayIsPast = isPast(day);
            const isSelected = selectedDay === dateKey;
            const colorInfo = getDayColorInfo(day);
            const displayHours = showRealistic
              ? getRealisticEstimate(workload.totalHours)
              : workload.totalHours;

            return (
              <div key={index} className="space-y-2">
                {/* Day Header */}
                <button
                  onClick={() => handleDayClick(day)}
                  className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all ${
                    dayIsToday
                      ? 'border-magenta bg-magenta/20'
                      : isSelected
                      ? 'border-vivid-cyan bg-vivid-cyan/10'
                      : workload.isUnrealistic
                      ? 'border-vivid-pink/50 bg-vivid-pink/10'
                      : workload.isOverloaded
                      ? 'border-vivid-yellow-green/50 bg-vivid-yellow-green/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  } ${colorInfo.glowClass}`}
                  style={{ boxShadow: dayIsToday ? `0 0 20px ${colorInfo.color}50` : undefined }}
                >
                  <div className="text-center">
                    <div
                      className="text-xs sm:text-sm font-bold uppercase tracking-wide mb-1"
                      style={{ color: colorInfo.color }}
                    >
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-xl sm:text-2xl font-bold ${dayIsToday ? 'text-magenta' : 'text-white'}`}>
                      {day.getDate()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>

                  {/* Hours Display */}
                  {workload.totalHours > 0 && (
                    <div className="text-center mt-2">
                      <div
                        className={`text-sm sm:text-lg font-bold ${
                          workload.isUnrealistic
                            ? 'text-vivid-pink'
                            : workload.isOverloaded
                            ? 'text-vivid-yellow-green'
                            : 'text-vivid-cyan'
                        }`}
                      >
                        {displayHours.toFixed(1)}h
                      </div>
                      <div className="text-xs text-gray-500">
                        {workload.tasks.length} tasks
                      </div>
                    </div>
                  )}

                  {/* Today Marker */}
                  {dayIsToday && (
                    <div className="mt-2 flex justify-center">
                      <span className="px-2 py-0.5 rounded-full bg-magenta text-black text-xs font-bold">
                        TODAY
                      </span>
                    </div>
                  )}
                </button>

                {/* Tasks Preview - Desktop only */}
                <div className="hidden lg:block space-y-1 max-h-32 overflow-y-auto">
                  {workload.tasks.slice(0, 3).map(task => {
                    const EnergyIcon = getEnergyIcon(task.energyLevel);
                    return (
                      <div
                        key={task.id}
                        className={`p-2 rounded text-xs ${
                          task.completed
                            ? 'bg-vivid-yellow-green/10 border border-vivid-yellow-green/30 opacity-60'
                            : 'bg-gray-800/50 border border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <EnergyIcon className={`w-3 h-3 ${
                            task.energyLevel === 'high' ? 'text-vivid-yellow-green' :
                            task.energyLevel === 'medium' ? 'text-magenta' :
                            'text-vivid-cyan'
                          }`} />
                          <span className={`truncate ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                            {task.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {workload.tasks.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">+{workload.tasks.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Details */}
        {selectedDay && selectedDayWorkload && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Day Info */}
            <div className="p-6 rounded-xl border-2 border-vivid-cyan/30 bg-vivid-cyan/10">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {new Date(selectedDay).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Hours</span>
                  <span className="text-2xl font-bold text-white">
                    {selectedDayWorkload.totalHours.toFixed(1)}h
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Realistic Estimate</span>
                  <span className="font-bold text-vivid-yellow-green">
                    {getRealisticEstimate(selectedDayWorkload.totalHours).toFixed(1)}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tasks</span>
                  <span className="font-bold text-white">{selectedDayWorkload.tasks.length}</span>
                </div>
              </div>

              {/* Add Task Button */}
              <button
                onClick={openAddTaskModal}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-magenta text-white font-bold hover:bg-white hover:text-black transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Task to This Day
              </button>
            </div>

            {/* Tasks List */}
            <div className="p-6 rounded-xl border-2 border-white/10 bg-white/5">
              <h4 className="font-bold text-white mb-4">Tasks</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedDayWorkload.tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tasks scheduled</p>
                ) : (
                  selectedDayWorkload.tasks.map(task => {
                    const EnergyIcon = getEnergyIcon(task.energyLevel);
                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg ${
                          task.completed
                            ? 'bg-vivid-yellow-green/10 border border-vivid-yellow-green/30'
                            : 'bg-gray-800/50 border border-white/10 hover:border-magenta/50'
                        } cursor-pointer transition-all group`}
                        onClick={() => handleTaskEdit(task)}
                      >
                        <div className="flex items-center gap-2">
                          <EnergyIcon className={`w-4 h-4 ${
                            task.energyLevel === 'high' ? 'text-vivid-yellow-green' :
                            task.energyLevel === 'medium' ? 'text-magenta' :
                            'text-vivid-cyan'
                          }`} />
                          <span className={task.completed ? 'line-through text-gray-500' : 'text-white'}>
                            {task.title}
                          </span>
                          <span className="ml-auto text-xs text-gray-500">
                            {task.estimatedHours}h
                          </span>
                          <Edit3 className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* VARIANT Reality Check Footer */}
        <div className="p-6 rounded-xl border-2 border-vivid-pink/30 bg-gradient-to-r from-vivid-pink/10 to-magenta/10">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 text-vivid-pink flex-shrink-0" />
            <div>
              <h4 className="font-bold text-white mb-2">VARIANT Reality Check</h4>
              <p className="text-gray-400 text-sm mb-2">
                Remember: We typically underestimate time by 1.8x. The times shown above include this buffer.
              </p>
              <p className="text-gray-400 text-sm">
                Tip: Build in buffer time, schedule breaks, and don't pack days back-to-back.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Month View Modal */}
      {showMonthView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-grey-azure rounded-2xl border border-magenta/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1))}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h2 className="text-2xl font-supernova text-white">
                  {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1))}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
              <button
                onClick={() => setShowMonthView(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {getMonthDays(currentMonthDate).map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }
                const dateKey = formatDateKey(day);
                const workload = calculateDayWorkload(dateKey);
                const dayIsToday = isToday(day);
                const colorInfo = getDayColorInfo(day);

                return (
                  <button
                    key={dateKey}
                    onClick={() => {
                      setCurrentWeekStart(getMonday(day));
                      setSelectedDay(dateKey);
                      setShowMonthView(false);
                    }}
                    className={`aspect-square p-2 rounded-lg border transition-all ${
                      dayIsToday
                        ? 'border-magenta bg-magenta/20'
                        : workload.totalHours > 0
                        ? 'border-white/20 bg-white/5'
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="text-sm font-bold text-white">{day.getDate()}</div>
                    {workload.totalHours > 0 && (
                      <div className="text-xs text-vivid-cyan mt-1">
                        {workload.totalHours.toFixed(1)}h
                      </div>
                    )}
                    {workload.tasks.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {workload.tasks.length} tasks
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowMonthView(false)}
              className="mt-6 w-full py-3 bg-magenta text-black font-bold rounded-xl hover:bg-neon-cyan transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-grey-azure rounded-2xl border border-magenta/30 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Task</h2>
              <button
                onClick={() => setEditingTask(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Task Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Scheduled Date</label>
                <input
                  type="date"
                  value={editingTask.scheduledDate || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, scheduledDate: e.target.value })}
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Estimated Hours</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={editingTask.estimatedHours}
                  onChange={(e) => setEditingTask({ ...editingTask, estimatedHours: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Energy Level</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEditingTask({ ...editingTask, energyLevel: level })}
                      className={`flex-1 py-2 rounded-lg font-semibold capitalize transition-all ${
                        editingTask.energyLevel === level
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
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingTask(null)}
                className="flex-1 py-3 rounded-lg border-2 border-white/10 text-white font-semibold hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveTask({
                  title: editingTask.title,
                  scheduledDate: editingTask.scheduledDate,
                  estimatedHours: editingTask.estimatedHours,
                  energyLevel: editingTask.energyLevel,
                })}
                className="flex-1 py-3 rounded-lg bg-magenta text-black font-bold hover:bg-neon-cyan transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-grey-azure rounded-2xl border border-magenta/30 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Task for {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h2>
              <button
                onClick={() => setShowAddTask(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Task Name *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="What do you need to do?"
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Energy Level</label>
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
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

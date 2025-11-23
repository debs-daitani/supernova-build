'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2,
  Clock,
  Zap,
  Target,
} from 'lucide-react';
import { getCrewTasks } from '@/lib/crew';
import { getProjects } from '@/lib/storage';
import { CrewTask, Project, EnergyLevel } from '@/lib/types';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: CrewTask[];
  deadlines: Project[];
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<CrewTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  useEffect(() => {
    setTasks(getCrewTasks());
    setProjects(getProjects());
  }, []);

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start on Sunday

    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday

    const days: CalendarDay[] = [];
    const currentDay = new Date(startDate);

    while (currentDay <= endDate) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const currentDayCopy = new Date(currentDay);
      currentDayCopy.setHours(0, 0, 0, 0);

      // Get tasks for this day
      const dayTasks = tasks.filter(t => t.scheduledDate === dateStr);

      // Get project deadlines for this day
      const deadlines = projects.filter(p => p.targetDate === dateStr);

      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDayCopy.getTime() === today.getTime(),
        tasks: dayTasks,
        deadlines,
      });

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  }, [currentDate, tasks, projects]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
  };

  const energyColor = (level: EnergyLevel) => {
    switch (level) {
      case 'high':
        return 'text-neon-green border-neon-green/30 bg-neon-green/10';
      case 'medium':
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'low':
        return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      default:
        return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const monthYearString = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CalendarIcon className="w-10 h-10 text-neon-pink" />
            <h1 className="text-4xl sm:text-5xl font-black text-white">Calendar</h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-400">
            Your tasks and deadlines in one view
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-neon-pink to-electric-purple mt-4" />
        </div>

        {/* Calendar Controls */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">{monthYearString}</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 rounded-lg bg-electric-purple hover:bg-neon-pink text-white font-semibold transition-all"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white/5 border-2 border-white/10 overflow-hidden">
              {/* Week day headers */}
              <div className="grid grid-cols-7 bg-white/5 border-b border-white/10">
                {weekDays.map(day => (
                  <div
                    key={day}
                    className="p-3 text-center text-sm font-semibold text-gray-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  const hasEvents = day.tasks.length > 0 || day.deadlines.length > 0;
                  const isSelected = selectedDay?.date.getTime() === day.date.getTime();

                  return (
                    <button
                      key={index}
                      onClick={() => handleDayClick(day)}
                      className={`
                        relative p-2 sm:p-3 min-h-[80px] sm:min-h-[100px] border-r border-b border-white/10
                        transition-all hover:bg-white/10
                        ${day.isCurrentMonth ? 'text-white' : 'text-gray-600'}
                        ${day.isToday ? 'bg-neon-pink/10 ring-2 ring-inset ring-neon-pink/30' : ''}
                        ${isSelected ? 'bg-electric-purple/20' : ''}
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-sm font-semibold ${
                              day.isToday ? 'text-neon-pink' : ''
                            }`}
                          >
                            {day.date.getDate()}
                          </span>
                          {hasEvents && (
                            <div className="flex gap-0.5">
                              {day.deadlines.length > 0 && (
                                <div className="w-1.5 h-1.5 rounded-full bg-neon-pink" />
                              )}
                              {day.tasks.length > 0 && (
                                <div className="w-1.5 h-1.5 rounded-full bg-electric-purple" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Task previews */}
                        <div className="flex-1 space-y-1 overflow-hidden">
                          {day.deadlines.slice(0, 1).map(project => (
                            <div
                              key={project.id}
                              className="text-xs px-1.5 py-0.5 rounded bg-neon-pink/20 text-neon-pink truncate"
                            >
                              <Target className="w-2.5 h-2.5 inline mr-1" />
                              {project.name}
                            </div>
                          ))}
                          {day.tasks.slice(0, 2).map(task => (
                            <div
                              key={task.id}
                              className="text-xs px-1.5 py-0.5 rounded bg-electric-purple/20 text-electric-purple truncate"
                            >
                              {task.completed ? '✓' : '○'} {task.title}
                            </div>
                          ))}
                          {(day.tasks.length + day.deadlines.length) > 3 && (
                            <div className="text-xs text-gray-500">
                              +{day.tasks.length + day.deadlines.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Day Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedDay ? (
                <div className="rounded-xl bg-white/5 border-2 border-white/10 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {selectedDay.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>

                  {/* Deadlines */}
                  {selectedDay.deadlines.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-neon-pink" />
                        Deadlines
                      </h4>
                      <div className="space-y-2">
                        {selectedDay.deadlines.map(project => (
                          <div
                            key={project.id}
                            className="p-3 rounded-lg bg-neon-pink/10 border border-neon-pink/30"
                          >
                            <div className="font-semibold text-white mb-1">
                              {project.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {project.priority.toUpperCase()} priority
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks */}
                  {selectedDay.tasks.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-electric-purple" />
                        Tasks ({selectedDay.tasks.filter(t => !t.completed).length} remaining)
                      </h4>
                      <div className="space-y-2">
                        {selectedDay.tasks.map(task => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border ${
                              task.completed
                                ? 'bg-neon-green/10 border-neon-green/30 opacity-60'
                                : energyColor(task.energyLevel)
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div
                                  className={`font-semibold text-sm mb-1 ${
                                    task.completed ? 'line-through' : ''
                                  }`}
                                >
                                  {task.title}
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  {task.scheduledTime && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {task.scheduledTime}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    {task.energyLevel}
                                  </span>
                                  {task.estimatedHours && (
                                    <span>{task.estimatedHours}h</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No tasks scheduled for this day
                    </div>
                  )}

                  {selectedDay.deadlines.length === 0 && selectedDay.tasks.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Nothing scheduled for this day</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-white/5 border-2 border-white/10 p-6 text-center">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                  <p className="text-gray-400">Select a day to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Legend</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neon-pink" />
              <span className="text-sm text-gray-300">Project Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-electric-purple" />
              <span className="text-sm text-gray-300">Scheduled Task</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neon-green" />
              <span className="text-sm text-gray-300">High Energy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-sm text-gray-300">Medium Energy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

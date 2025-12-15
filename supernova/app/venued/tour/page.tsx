'use client';

import { useState, useEffect } from 'react';
import VenuedNav from '../components/VenuedNav';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  Zap,
  AlertTriangle,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  energyLevel: string;
  estimatedMins: number | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  project?: { id: string; name: string; color: string | null } | null;
}

export default function VenuedTourPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));

  function getWeekStart(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getWeekDays(weekStart: Date) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }

  useEffect(() => {
    fetchTasks();
  }, [currentWeek]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/venued/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await fetch(`/api/venued/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const weekDays = getWeekDays(currentWeek);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getTasksForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter((t) => t.scheduledDate?.startsWith(dateStr));
  };

  const getDayWorkload = (dayTasks: Task[]) => {
    const totalMins = dayTasks.reduce((sum, t) => sum + (t.estimatedMins || 30), 0);
    const hours = totalMins / 60;
    if (hours > 8) return 'overloaded';
    if (hours > 6) return 'heavy';
    if (hours > 3) return 'moderate';
    return 'light';
  };

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'overloaded':
        return 'border-red-500 bg-red-500/10';
      case 'heavy':
        return 'border-orange-500 bg-orange-500/10';
      case 'moderate':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-green-500 bg-green-500/10';
    }
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen bg-black">
      <VenuedNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              const prev = new Date(currentWeek);
              prev.setDate(prev.getDate() - 7);
              setCurrentWeek(prev);
            }}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white">
              {weekDays[0].toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} -{' '}
              {weekDays[6].toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCurrentWeek(getWeekStart(new Date()))}
              className="text-sm text-[#00F0E9] hover:underline"
            >
              Go to today
            </button>
          </div>

          <button
            onClick={() => {
              const next = new Date(currentWeek);
              next.setDate(next.getDate() + 7);
              setCurrentWeek(next);
            }}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Workload Legend */}
        <div className="flex gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400">Light (&lt;3h)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-400">Moderate (3-6h)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-400">Heavy (6-8h)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-400">Overloaded (&gt;8h)</span>
          </div>
        </div>

        {/* Week Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const dayTasks = getTasksForDay(day);
              const workload = getDayWorkload(dayTasks);
              const isToday = day.getTime() === today.getTime();
              const isPast = day < today;
              const totalMins = dayTasks.reduce((sum, t) => sum + (t.estimatedMins || 30), 0);

              return (
                <div
                  key={i}
                  className={`rounded-xl border-2 overflow-hidden ${getWorkloadColor(workload)} ${
                    isToday ? 'ring-2 ring-[#00F0E9]' : ''
                  } ${isPast ? 'opacity-60' : ''}`}
                >
                  {/* Day Header */}
                  <div className={`p-3 text-center border-b border-white/10 ${isToday ? 'bg-[#00F0E9]/20' : ''}`}>
                    <div className="text-xs text-gray-400">{dayNames[i]}</div>
                    <div className={`text-lg font-bold ${isToday ? 'text-[#00F0E9]' : 'text-white'}`}>
                      {day.getDate()}
                    </div>
                    <div className="text-xs text-gray-500">{Math.round(totalMins / 60 * 10) / 10}h</div>
                  </div>

                  {/* Tasks */}
                  <div className="p-2 space-y-1 min-h-[150px] max-h-[300px] overflow-y-auto">
                    {dayTasks.length === 0 ? (
                      <div className="text-center py-4 text-gray-600 text-xs">No tasks</div>
                    ) : (
                      dayTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(task)}
                          className={`p-2 rounded text-xs cursor-pointer transition-all ${
                            task.completed
                              ? 'bg-white/5 text-gray-500 line-through'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-1">
                            {task.completed ? (
                              <CheckCircle2 size={12} className="text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-gray-500 flex-shrink-0 mt-0.5" />
                            )}
                            <span className="break-words">{task.title}</span>
                          </div>
                          {task.scheduledTime && (
                            <div className="text-gray-500 text-[10px] ml-4">{task.scheduledTime}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Workload Warning */}
                  {workload === 'overloaded' && (
                    <div className="p-2 bg-red-500/20 border-t border-red-500/30 flex items-center gap-1 text-xs text-red-400">
                      <AlertTriangle size={12} />
                      Overloaded!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ADHD Reality Check */}
        <div className="mt-8 bg-gradient-to-r from-[#FF008E]/20 to-[#00F0E9]/20 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">🧠 ADHD Reality Check</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Plan for 50% less than you think you can do</li>
            <li>• Include buffer time between tasks</li>
            <li>• Schedule high-energy tasks when you're at your peak</li>
            <li>• Don't stack too many "deep focus" tasks in one day</li>
            <li>• Leave at least one day for overflow/catch-up</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

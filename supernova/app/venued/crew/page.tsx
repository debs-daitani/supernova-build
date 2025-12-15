'use client';

import { useState, useEffect } from 'react';
import VenuedNav from '../components/VenuedNav';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Battery,
  BatteryLow,
  BatteryMedium,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  energyLevel: string;
  estimatedMins: number | null;
  difficulty: string;
  isHyperfocus: boolean;
  isQuickWin: boolean;
  completed: boolean;
  completedAt: string | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  timeSpent: number;
  project?: { id: string; name: string; color: string | null } | null;
}

export default function VenuedCrewPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'quick-wins'>('today');
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const fetchTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      let url = '/api/venued/tasks?completed=false';
      if (filter === 'today') {
        url += `&scheduledDate=${today}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let filteredTasks = data.tasks || [];
        if (filter === 'quick-wins') {
          filteredTasks = filteredTasks.filter((t: Task) => t.isQuickWin);
        }
        setTasks(filteredTasks);
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

  const createQuickTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      await fetch('/api/venued/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          scheduledDate: today,
          isQuickWin: true,
        }),
      });
      setNewTaskTitle('');
      fetchTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const getEnergyIcon = (level: string) => {
    switch (level) {
      case 'HIGH':
        return <Battery className="text-green-400" size={16} />;
      case 'MEDIUM':
        return <BatteryMedium className="text-yellow-400" size={16} />;
      default:
        return <BatteryLow className="text-red-400" size={16} />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black">
      <VenuedNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Focus Timer */}
        {focusTask && (
          <div className="bg-gradient-to-r from-[#FF008E]/20 to-[#00F0E9]/20 rounded-xl p-6 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Currently Focusing On</div>
                <div className="text-xl font-bold text-white">{focusTask.title}</div>
              </div>
              <div className="text-4xl font-mono text-white">{formatTime(timerSeconds)}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimerActive(!timerActive)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                {timerActive ? <Pause size={18} /> : <Play size={18} />}
                {timerActive ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  setTimerSeconds(0);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                <RotateCcw size={18} />
                Reset
              </button>
              <button
                onClick={() => {
                  toggleTask(focusTask);
                  setFocusTask(null);
                  setTimerActive(false);
                  setTimerSeconds(0);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium ml-auto"
                style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
              >
                <CheckCircle2 size={18} />
                Complete
              </button>
            </div>
          </div>
        )}

        {/* Quick Add */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createQuickTask()}
            placeholder="Quick add task..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0E9]"
          />
          <button
            onClick={createQuickTask}
            className="px-4 py-3 rounded-lg font-medium"
            style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'today', label: "Today's Tasks" },
            { key: 'quick-wins', label: 'Quick Wins' },
            { key: 'all', label: 'All Tasks' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-[#FF008E] text-black'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <CheckCircle2 className="mx-auto mb-4 text-green-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
            <p className="text-gray-400">No pending tasks. Add one above or take a break!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-white/5 border-white/5 opacity-60'
                    : 'bg-white/5 border-white/10 hover:border-[#00F0E9]/50'
                }`}
              >
                <button onClick={() => toggleTask(task)}>
                  {task.completed ? (
                    <CheckCircle2 className="text-green-400" size={24} />
                  ) : (
                    <Circle className="text-gray-400 hover:text-[#00F0E9]" size={24} />
                  )}
                </button>

                <div className="flex-1">
                  <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    {getEnergyIcon(task.energyLevel)}
                    {task.estimatedMins && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {task.estimatedMins}m
                      </span>
                    )}
                    {task.isQuickWin && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                        Quick Win
                      </span>
                    )}
                    {task.isHyperfocus && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                        Deep Focus
                      </span>
                    )}
                    {task.project && (
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ backgroundColor: `${task.project.color}30`, color: task.project.color || '#FF008E' }}
                      >
                        {task.project.name}
                      </span>
                    )}
                  </div>
                </div>

                {!task.completed && (
                  <button
                    onClick={() => {
                      setFocusTask(task);
                      setTimerSeconds(0);
                      setTimerActive(true);
                    }}
                    className="p-2 rounded-lg bg-white/10 text-[#00F0E9] hover:bg-white/20"
                    title="Start Focus Timer"
                  >
                    <Zap size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

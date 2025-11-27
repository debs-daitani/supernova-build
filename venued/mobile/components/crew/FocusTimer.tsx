'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, Clock } from 'lucide-react';
import { CrewTask } from '@/lib/types';

interface FocusTimerProps {
  task: CrewTask | null;
  onComplete: (minutes: number) => void;
  onStop: () => void;
}

export default function FocusTimer({ task, onComplete, onStop }: FocusTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    // Reset when task changes
    if (task) {
      setSeconds(0);
      setIsRunning(false);
    }
  }, [task?.id]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      onComplete(minutes);
    }
    setSeconds(0);
    setIsRunning(false);
    onStop();
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!task) {
    return (
      <div className="p-6 rounded-xl border-2 border-white/10 bg-gray-900/30 text-center">
        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Select a task to start focus mode</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border-2 border-electric-purple/30 bg-gradient-to-br from-electric-purple/10 to-transparent">
      {/* Task Info */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">{task.title}</h3>
        <p className="text-sm text-gray-400">Focus Mode Active</p>
      </div>

      {/* Timer Display */}
      <div className="mb-6 text-center">
        <div className="text-6xl font-black text-white tracking-wider mb-2 font-mono">
          {formatTime(seconds)}
        </div>
        <div className="text-sm text-gray-400">
          {task.estimatedHours}h estimated • {task.timeSpent}m tracked
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-neon-pink text-black font-bold hover:bg-white transition-all"
          >
            <Play className="w-5 h-5" />
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-all"
          >
            <Pause className="w-5 h-5" />
            Pause
          </button>
        )}

        <button
          onClick={handleStop}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-white/20 text-white font-semibold hover:bg-white/5 transition-all"
        >
          <StopCircle className="w-5 h-5" />
          Stop
        </button>
      </div>

      {/* Progress Ring */}
      {isRunning && (
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-pink to-electric-purple transition-all duration-1000"
              style={{ width: `${Math.min((seconds / (task.estimatedHours * 3600)) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

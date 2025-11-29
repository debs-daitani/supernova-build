'use client';

import { useState } from 'react';
import { Compass, Shuffle, ListTree, Grid3x3, Minimize2 } from 'lucide-react';
import { getCrewTasks } from '@/lib/crew';

type Tool = 'picker' | 'breakdown' | 'priority' | 'next' | null;

export default function ExecutiveFunctionHelper() {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [randomTask, setRandomTask] = useState<string>('');
  const [breakdownInput, setBreakdownInput] = useState('');
  const [breakdownSteps, setBreakdownSteps] = useState<string[]>([]);

  const handleRandomPick = () => {
    const tasks = getCrewTasks().filter(t => !t.completed);
    if (tasks.length === 0) {
      setRandomTask('No tasks available! Create some tasks first.');
      return;
    }
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    setRandomTask(task.title);
  };

  const handleBreakdown = () => {
    if (!breakdownInput.trim()) return;

    // Simple breakdown generator
    const steps = [
      '1. Gather all materials and information needed',
      '2. Set up workspace and remove distractions',
      '3. Define the first tiny action (5 min or less)',
      '4. Do that tiny action',
      '5. Check: What\'s the next tiny action?',
      '6. Repeat steps 4-5 until done',
    ];
    setBreakdownSteps(steps);
  };

  const handleWhatNext = () => {
    const tasks = getCrewTasks().filter(t => !t.completed);

    // Prioritize by: quick wins, then high energy, then scheduled
    const quickWins = tasks.filter(t => t.isQuickWin);
    if (quickWins.length > 0) {
      setRandomTask(`Quick Win: ${quickWins[0].title}`);
      return;
    }

    const scheduled = tasks.filter(t => t.scheduledDate);
    if (scheduled.length > 0) {
      setRandomTask(`Scheduled: ${scheduled[0].title}`);
      return;
    }

    if (tasks.length > 0) {
      setRandomTask(tasks[0].title);
    } else {
      setRandomTask('No tasks found! Time to plan.');
    }
  };

  const tools = [
    { id: 'picker' as Tool, name: 'Random Picker', icon: Shuffle, desc: 'Can\'t decide? Let me pick one.' },
    { id: 'breakdown' as Tool, name: 'Task Breakdown', icon: ListTree, desc: 'Break overwhelming task into steps' },
    { id: 'priority' as Tool, name: 'Priority Matrix', icon: Grid3x3, desc: 'Sort by urgent/important' },
    { id: 'next' as Tool, name: 'What\'s Next?', icon: Compass, desc: 'Smart suggestion algorithm' },
  ];

  return (
    <div className="space-y-6">
      {/* Big Stuck Button */}
      <div className="text-center">
        <button
          onClick={() => setActiveTool(activeTool ? null : 'picker')}
          className="px-12 py-6 bg-gradient-to-r from-neon-pink to-electric-purple rounded-2xl text-white text-2xl font-black hover:shadow-[0_0_40px_rgba(255,27,141,0.6)] transition-all"
        >
          I'M STUCK 🆘
        </button>
        <p className="text-gray-500 text-sm mt-2">Decision paralysis? Executive dysfunction? We got you.</p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-2 gap-4">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                activeTool === tool.id
                  ? 'border-electric-purple bg-electric-purple/20'
                  : 'border-white/10 bg-white/5 hover:border-electric-purple/50'
              }`}
            >
              <Icon className={`w-8 h-8 mb-3 ${activeTool === tool.id ? 'text-electric-purple' : 'text-gray-400'}`} />
              <h3 className="text-white font-bold mb-1">{tool.name}</h3>
              <p className="text-sm text-gray-400">{tool.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Tool Panels */}
      {activeTool === 'picker' && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-neon-pink/20 to-electric-purple/20 border-2 border-neon-pink/30 animate-in">
          <h3 className="text-xl font-bold text-white mb-4">🎲 Random Task Picker</h3>
          <button
            onClick={handleRandomPick}
            className="w-full py-4 bg-neon-pink rounded-lg text-black font-bold hover:bg-white transition-all mb-4"
          >
            Pick One For Me
          </button>
          {randomTask && (
            <div className="p-4 rounded-lg bg-white/10 text-white text-center font-semibold">
              "{randomTask}"
            </div>
          )}
        </div>
      )}

      {activeTool === 'breakdown' && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-electric-purple/20 border-2 border-blue-500/30 animate-in">
          <h3 className="text-xl font-bold text-white mb-4">🔨 Task Breakdown Wizard</h3>
          <input
            type="text"
            placeholder="Enter overwhelming task..."
            value={breakdownInput}
            onChange={(e) => setBreakdownInput(e.target.value)}
            className="w-full px-4 py-3 bg-black border-2 border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none mb-4"
          />
          <button
            onClick={handleBreakdown}
            className="w-full py-3 bg-blue-500 rounded-lg text-white font-bold hover:bg-blue-400 transition-all mb-4"
          >
            Break It Down
          </button>
          {breakdownSteps.length > 0 && (
            <div className="space-y-2">
              {breakdownSteps.map((step, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/10 text-white text-sm">
                  {step}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTool === 'priority' && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/20 to-electric-purple/20 border-2 border-yellow-500/30 animate-in">
          <h3 className="text-xl font-bold text-white mb-4">📊 Priority Matrix</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-red-500/20 border-2 border-red-500/50">
              <h4 className="text-red-400 font-bold mb-2">Urgent + Important</h4>
              <p className="text-sm text-gray-400">Do first</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/20 border-2 border-yellow-500/50">
              <h4 className="text-yellow-400 font-bold mb-2">Not Urgent + Important</h4>
              <p className="text-sm text-gray-400">Schedule</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/20 border-2 border-blue-500/50">
              <h4 className="text-blue-400 font-bold mb-2">Urgent + Not Important</h4>
              <p className="text-sm text-gray-400">Delegate</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-500/20 border-2 border-gray-500/50">
              <h4 className="text-gray-400 font-bold mb-2">Not Urgent + Not Important</h4>
              <p className="text-sm text-gray-400">Delete</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4 text-center">Drag your tasks into these categories (coming soon!)</p>
        </div>
      )}

      {activeTool === 'next' && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-neon-green/20 to-electric-purple/20 border-2 border-neon-green/30 animate-in">
          <h3 className="text-xl font-bold text-white mb-4">🧭 What's Next?</h3>
          <button
            onClick={handleWhatNext}
            className="w-full py-4 bg-neon-green rounded-lg text-black font-bold hover:bg-white transition-all mb-4"
          >
            Tell Me What To Do
          </button>
          {randomTask && (
            <div className="p-4 rounded-lg bg-white/10">
              <p className="text-sm text-gray-400 mb-2">Smart suggestion based on:</p>
              <ul className="text-xs text-gray-500 space-y-1 mb-3">
                <li>• Quick wins for momentum</li>
                <li>• Scheduled deadlines</li>
                <li>• Energy levels</li>
                <li>• Task dependencies</li>
              </ul>
              <div className="p-3 rounded-lg bg-neon-green/20 text-white font-semibold text-center">
                {randomTask}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Clock, Brain, Zap, Compass, PenLine, Gift, Users, BarChart3 } from 'lucide-react';
import TimeBlindnessTracker from '@/components/entourage/TimeBlindnessTracker';
import HyperfocusLogger from '@/components/entourage/HyperfocusLogger';
import EnergyTracker from '@/components/entourage/EnergyTracker';
import ExecutiveFunctionHelper from '@/components/entourage/ExecutiveFunctionHelper';
import BrainDumpSpace from '@/components/entourage/BrainDumpSpace';
import DopamineMenu from '@/components/entourage/DopamineMenu';
import BodyDoublingSimulator from '@/components/entourage/BodyDoublingSimulator';
import PatternInsightsDashboard from '@/components/entourage/PatternInsightsDashboard';
import { generateSampleADHDData } from '@/lib/adhd';

type Tool =
  | 'time'
  | 'hyperfocus'
  | 'energy'
  | 'executive'
  | 'brain'
  | 'dopamine'
  | 'body'
  | 'insights';

export default function Entourage() {
  const [activeTool, setActiveTool] = useState<Tool>('insights');

  useEffect(() => {
    // Initialize sample data on first visit
    generateSampleADHDData();
  }, []);

  const tools = [
    {
      id: 'insights' as Tool,
      name: 'Pattern Insights',
      icon: BarChart3,
      color: 'from-electric-purple/20 to-neon-pink/20',
      borderColor: 'border-electric-purple/30',
      iconColor: 'text-electric-purple',
      description: 'See your patterns and get personalized insights',
    },
    {
      id: 'time' as Tool,
      name: 'Time Blindness',
      icon: Clock,
      color: 'from-neon-pink/20 to-electric-purple/20',
      borderColor: 'border-neon-pink/30',
      iconColor: 'text-neon-pink',
      description: 'Track estimates vs reality',
    },
    {
      id: 'hyperfocus' as Tool,
      name: 'Hyperfocus',
      icon: Brain,
      color: 'from-blue-500/20 to-electric-purple/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      description: 'Log your flow states',
    },
    {
      id: 'energy' as Tool,
      name: 'Energy',
      icon: Zap,
      color: 'from-yellow-400/20 to-electric-purple/20',
      borderColor: 'border-yellow-400/30',
      iconColor: 'text-yellow-400',
      description: 'Track energy patterns',
    },
    {
      id: 'executive' as Tool,
      name: 'Executive Function',
      icon: Compass,
      color: 'from-neon-green/20 to-electric-purple/20',
      borderColor: 'border-neon-green/30',
      iconColor: 'text-neon-green',
      description: 'Break through paralysis',
    },
    {
      id: 'brain' as Tool,
      name: 'Brain Dump',
      icon: PenLine,
      color: 'from-electric-purple/20 to-neon-pink/20',
      borderColor: 'border-electric-purple/30',
      iconColor: 'text-electric-purple',
      description: 'Capture everything',
    },
    {
      id: 'dopamine' as Tool,
      name: 'Dopamine Menu',
      icon: Gift,
      color: 'from-yellow-500/20 to-neon-pink/20',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
      description: 'Reward yourself',
    },
    {
      id: 'body' as Tool,
      name: 'Body Doubling',
      icon: Users,
      color: 'from-blue-500/20 to-electric-purple/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      description: 'Work alongside someone',
    },
  ];

  const renderTool = () => {
    switch (activeTool) {
      case 'time':
        return <TimeBlindnessTracker />;
      case 'hyperfocus':
        return <HyperfocusLogger />;
      case 'energy':
        return <EnergyTracker />;
      case 'executive':
        return <ExecutiveFunctionHelper />;
      case 'brain':
        return <BrainDumpSpace />;
      case 'dopamine':
        return <DopamineMenu />;
      case 'body':
        return <BodyDoublingSimulator />;
      case 'insights':
        return <PatternInsightsDashboard />;
      default:
        return <PatternInsightsDashboard />;
    }
  };

  const activeToolConfig = tools.find(t => t.id === activeTool)!;

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-white mb-4">
            THE ENTOURAGE
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your support crew. ADHD-specific tools for time blindness, hyperfocus tracking,
            energy management, and brain dumps.
          </p>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {tools.map(tool => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  isActive
                    ? `bg-gradient-to-br ${tool.color} ${tool.borderColor} shadow-lg`
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <Icon className={`w-8 h-8 mb-3 ${isActive ? tool.iconColor : 'text-gray-400'}`} />
                <h3 className={`text-sm font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {tool.name}
                </h3>
                <p className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                  {tool.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Tool Panel */}
        <div className={`rounded-2xl border-2 ${activeToolConfig.borderColor} bg-gradient-to-br ${activeToolConfig.color} p-8`}>
          <div className="flex items-center gap-3 mb-6">
            {(() => {
              const Icon = activeToolConfig.icon;
              return <Icon className={`w-8 h-8 ${activeToolConfig.iconColor}`} />;
            })()}
            <h2 className="text-3xl font-black text-white">{activeToolConfig.name}</h2>
          </div>

          {/* Tool Content */}
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            {renderTool()}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">🎯 How to Use the Entourage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-neon-pink mb-2">Track Your Patterns</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Log time estimates vs actual to find your multiplier</li>
                <li>• Track energy throughout the day to find peak times</li>
                <li>• Record hyperfocus sessions to identify triggers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-electric-purple mb-2">Get Unstuck</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Use Executive Function tools when paralyzed</li>
                <li>• Brain dump to clear your head</li>
                <li>• Body double when you need company</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-neon-green mb-2">Stay Motivated</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Build your dopamine menu for rewards</li>
                <li>• Celebrate wins (no matter how small)</li>
                <li>• Use insights to work with your brain, not against it</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">Learn & Optimize</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Check Pattern Insights for personalized recommendations</li>
                <li>• Adjust your schedule based on energy patterns</li>
                <li>• Use your reality multiplier for better planning</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

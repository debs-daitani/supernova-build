'use client';

import { AlertTriangle, CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react';
import { Phase } from '@/lib/types';

interface RealityCheckProps {
  phases: Phase[];
  targetDate: string;
}

export default function RealityCheck({ phases, targetDate }: RealityCheckProps) {
  // Calculate stats
  const allTasks = phases.flatMap(p => p.tasks);
  const totalHours = allTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const completedTasks = allTasks.filter(t => t.completed).length;
  const totalTasks = allTasks.length;

  // Energy distribution
  const energyDistribution = {
    high: allTasks.filter(t => t.energyLevel === 'high').length,
    medium: allTasks.filter(t => t.energyLevel === 'medium').length,
    low: allTasks.filter(t => t.energyLevel === 'low').length,
  };

  // Time calculations
  const daysUntilTarget = Math.ceil(
    (new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const hoursPerDay = daysUntilTarget > 0 ? totalHours / daysUntilTarget : 0;

  // Generate warnings
  const warnings = [];
  if (hoursPerDay > 8) {
    warnings.push({
      type: 'danger',
      message: `${hoursPerDay.toFixed(1)}h/day required - That's unsustainable!`,
      suggestion: 'Consider extending your deadline or reducing scope',
    });
  } else if (hoursPerDay > 5) {
    warnings.push({
      type: 'warning',
      message: `${hoursPerDay.toFixed(1)}h/day needed - Tight but doable`,
      suggestion: 'Build in buffer time for unexpected delays',
    });
  }

  if (energyDistribution.high > totalTasks * 0.5) {
    warnings.push({
      type: 'warning',
      message: 'Too many high-energy tasks',
      suggestion: 'Balance with some low-energy wins to avoid burnout',
    });
  }

  const quickWins = allTasks.filter(t => t.isQuickWin).length;
  if (quickWins === 0 && totalTasks > 5) {
    warnings.push({
      type: 'info',
      message: 'No quick wins identified',
      suggestion: 'Add some easy wins for motivation boosts',
    });
  }

  return (
    <div className="sticky top-24 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-white mb-2">Reality Check</h3>
        <p className="text-sm text-gray-400">Keep it real, keep it achievable</p>
      </div>

      {/* Total Time */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-electric-purple/10 to-transparent border-2 border-electric-purple/30">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-electric-purple" />
          <span className="font-semibold text-white">Total Time</span>
        </div>
        <div className="text-3xl font-black text-white">{totalHours}h</div>
        <div className="text-xs text-gray-400 mt-1">
          {hoursPerDay > 0 ? `${hoursPerDay.toFixed(1)}h per day` : 'Set a target date'}
        </div>
      </div>

      {/* Progress */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-neon-green/10 to-transparent border-2 border-neon-green/30">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-neon-green" />
          <span className="font-semibold text-white">Progress</span>
        </div>
        <div className="text-3xl font-black text-white">
          {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {completedTasks} of {totalTasks} tasks done
        </div>
      </div>

      {/* Energy Distribution */}
      <div className="p-4 rounded-xl bg-white/5 border-2 border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="font-semibold text-white">Energy Mix</span>
        </div>
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neon-pink">🔥 High</span>
              <span className="text-white font-semibold">{energyDistribution.high}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-neon-pink"
                style={{ width: `${totalTasks > 0 ? (energyDistribution.high / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-yellow-400">⚡ Medium</span>
              <span className="text-white font-semibold">{energyDistribution.medium}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400"
                style={{ width: `${totalTasks > 0 ? (energyDistribution.medium / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-electric-purple">⭐ Low</span>
              <span className="text-white font-semibold">{energyDistribution.low}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-electric-purple"
                style={{ width: `${totalTasks > 0 ? (energyDistribution.low / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Warnings & Suggestions */}
      {warnings.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">Heads Up</h4>
          {warnings.map((warning, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border-2 ${
                warning.type === 'danger'
                  ? 'border-red-500/30 bg-red-500/10'
                  : warning.type === 'warning'
                  ? 'border-yellow-500/30 bg-yellow-500/10'
                  : 'border-blue-500/30 bg-blue-500/10'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={`w-4 h-4 mt-0.5 ${
                    warning.type === 'danger'
                      ? 'text-red-400'
                      : warning.type === 'warning'
                      ? 'text-yellow-400'
                      : 'text-blue-400'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-1">
                    {warning.message}
                  </p>
                  <p className="text-xs text-gray-400">{warning.suggestion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-lg border-2 border-neon-green/30 bg-neon-green/10">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-neon-green" />
            <p className="text-sm font-semibold text-white">Looking good!</p>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Your timeline seems realistic
          </p>
        </div>
      )}
    </div>
  );
}

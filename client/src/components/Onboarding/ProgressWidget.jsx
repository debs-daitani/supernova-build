/**
 * ProgressWidget Component
 * Shows onboarding progress on dashboard
 * Tracks: Account Setup, Quick Wins, Platform Mastery
 */

import { useState, useEffect } from 'react';

export default function ProgressWidget({ userId }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/onboarding/progress');
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
      // Use fallback data
      setProgress(getFallbackProgress());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
        <span>📊</span>
        Your Progress
      </h3>

      <div className="space-y-4">

        {/* Account Setup */}
        <ProgressBar
          label="Account Setup"
          percent={progress.setupPercent || 0}
          color="green"
          isComplete={progress.setupComplete}
        />

        {/* Quick Wins */}
        <ProgressBar
          label="Quick Wins"
          percent={progress.quickWinsPercent || 0}
          color="orange"
          subtitle={`${progress.quickWinsCompleted || 0} of ${progress.quickWinsTotal || 5}`}
          icon="🔥"
        />

        {/* Platform Mastery */}
        <ProgressBar
          label="Platform Mastery"
          percent={progress.masteryPercent || 0}
          color="purple"
          subtitle={progress.masteryLevel || 'Beginner'}
          icon="🎯"
        />

      </div>

      {/* Motivational message */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-700 flex items-start gap-2">
          <span className="text-lg">🚀</span>
          <span>
            {getMotivationalMessage(progress)}
          </span>
        </div>
      </div>

      {/* Action button if not complete */}
      {!progress.setupComplete && (
        <div className="mt-4">
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-all"
          >
            Continue Setup →
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Progress Bar
 */
function ProgressBar({ label, percent, color, subtitle, isComplete, icon }) {
  const colors = {
    green: {
      bg: 'bg-green-500',
      text: 'text-green-500',
      light: 'bg-green-100'
    },
    orange: {
      bg: 'bg-orange-500',
      text: 'text-orange-500',
      light: 'bg-orange-100'
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-500',
      light: 'bg-purple-100'
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-500',
      light: 'bg-blue-100'
    }
  };

  const colorClasses = colors[color] || colors.orange;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-gray-900">{label}</span>
        <span className="text-sm">
          {isComplete ? (
            <span className="text-green-500 font-bold flex items-center gap-1">
              100% ✅
            </span>
          ) : (
            <span className={`font-bold flex items-center gap-1 ${colorClasses.text}`}>
              {percent}% {icon && <span>{icon}</span>}
            </span>
          )}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`${colorClasses.bg} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      {subtitle && (
        <div className={`text-xs mt-1 ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
          {isComplete ? 'Complete' : subtitle}
        </div>
      )}
    </div>
  );
}

/**
 * Get motivational message based on progress
 */
function getMotivationalMessage(progress) {
  const totalPercent = Math.round(
    ((progress.setupPercent || 0) +
    (progress.quickWinsPercent || 0) +
    (progress.masteryPercent || 0)) / 3
  );

  if (totalPercent >= 90) {
    return "You're crushing it! You're in the top 10% of users! 🌟";
  } else if (totalPercent >= 75) {
    return `Keep going! You're ahead of ${progress.percentileRank || 85}% of new users!`;
  } else if (totalPercent >= 50) {
    return "Great progress! You're well on your way to mastery!";
  } else if (totalPercent >= 25) {
    return "Nice start! Complete Quick Wins to boost your progress!";
  } else {
    return "Welcome! Let's get you set up and ready to succeed!";
  }
}

/**
 * Fallback progress data
 */
function getFallbackProgress() {
  return {
    setupPercent: 60,
    setupComplete: false,
    quickWinsPercent: 20,
    quickWinsCompleted: 1,
    quickWinsTotal: 5,
    masteryPercent: 15,
    masteryLevel: 'Beginner',
    percentileRank: 50
  };
}

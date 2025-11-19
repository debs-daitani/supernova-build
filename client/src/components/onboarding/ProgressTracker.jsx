import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import onboardingService from '../../services/onboarding';

export default function ProgressTracker({ visible = true, onClose }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (visible) {
      loadProgress();
    }
  }, [visible]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await onboardingService.getProgress();
      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const milestones = [
    {
      id: 'welcome',
      title: 'Welcome',
      icon: '👋',
      completed: progress?.hasCompletedWelcome,
      action: null
    },
    {
      id: 'tour',
      title: 'Dashboard Tour',
      icon: '🎯',
      completed: progress?.hasCompletedTour,
      action: () => navigate('/dashboard')
    },
    {
      id: 'quick_wins',
      title: 'Quick Wins',
      icon: '✅',
      completed: progress?.hasSeenQuickWins,
      action: null
    },
    {
      id: 'first_action',
      title: getFirstActionTitle(progress?.primaryGoal),
      icon: getFirstActionIcon(progress?.primaryGoal),
      completed: getFirstActionCompleted(progress),
      action: () => navigate(getFirstActionUrl(progress?.primaryGoal))
    }
  ];

  function getFirstActionTitle(goal) {
    switch (goal) {
      case 'website': return 'Create Website';
      case 'courses': return 'Create Course';
      case 'ecommerce': return 'Add Product';
      case 'crm': return 'Add Contact';
      default: return 'First Action';
    }
  }

  function getFirstActionIcon(goal) {
    switch (goal) {
      case 'website': return '🌐';
      case 'courses': return '🎓';
      case 'ecommerce': return '🛒';
      case 'crm': return '📊';
      default: return '🚀';
    }
  }

  function getFirstActionCompleted(progress) {
    if (!progress) return false;

    switch (progress.primaryGoal) {
      case 'website': return progress.firstWebsiteCreated;
      case 'courses': return progress.firstCourseCreated;
      case 'ecommerce': return progress.firstProductAdded;
      case 'crm': return progress.firstContactAdded;
      default: return false;
    }
  }

  function getFirstActionUrl(goal) {
    switch (goal) {
      case 'website': return '/websites/create';
      case 'courses': return '/courses/create';
      case 'ecommerce': return '/products/create';
      case 'crm': return '/contacts/create';
      default: return '/dashboard';
    }
  }

  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const milestonesPercent = (completedMilestones / totalMilestones) * 100;

  if (!visible || loading || !progress) return null;

  // Auto-hide if 100% complete
  if (progress.progressPercent >= 100 && completedMilestones === totalMilestones) {
    return null;
  }

  if (collapsed) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-2 text-sm font-medium hover:text-purple-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Onboarding Progress: {progress.progressPercent}%
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold">Getting Started</h3>
              <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs font-semibold">
                {progress.progressPercent}% Complete
              </span>
            </div>
            <p className="text-sm text-purple-100">
              Complete your onboarding to unlock the full power of The dAItaniverse
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(true)}
              className="text-white hover:text-purple-200 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-purple-200 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500 rounded-full flex items-center justify-end pr-2"
              style={{ width: `${Math.max(milestonesPercent, 5)}%` }}
            >
              {milestonesPercent > 15 && (
                <span className="text-purple-600 text-xs font-bold">
                  {Math.round(milestonesPercent)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {milestones.map((milestone) => (
            <button
              key={milestone.id}
              onClick={() => !milestone.completed && milestone.action && milestone.action()}
              disabled={milestone.completed || !milestone.action}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                milestone.completed
                  ? 'bg-white bg-opacity-20 border-white border-opacity-30'
                  : 'bg-white bg-opacity-10 border-white border-opacity-20 hover:bg-opacity-20'
              } ${!milestone.completed && milestone.action ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="text-2xl">{milestone.icon}</div>
                {milestone.completed && (
                  <div className="ml-auto">
                    <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-sm font-semibold">
                {milestone.title}
              </div>
              {!milestone.completed && milestone.action && (
                <div className="text-xs text-purple-200 mt-1">
                  Click to start →
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Encouragement */}
        {completedMilestones > 0 && completedMilestones < totalMilestones && (
          <div className="mt-4 text-center">
            <p className="text-sm text-purple-100">
              🎉 Great progress! {totalMilestones - completedMilestones} more step{totalMilestones - completedMilestones !== 1 ? 's' : ''} to go!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

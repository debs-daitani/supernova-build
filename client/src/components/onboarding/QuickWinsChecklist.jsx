import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import onboardingService from '../../services/onboarding';

export default function QuickWinsChecklist({ visible = true, onClose }) {
  const navigate = useNavigate();
  const [quickWins, setQuickWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (visible) {
      loadQuickWins();
    }
  }, [visible]);

  const loadQuickWins = async () => {
    try {
      setLoading(true);
      const data = await onboardingService.getQuickWins();
      setQuickWins(data);

      // Mark as seen
      await onboardingService.completeStep('quick-wins-seen', 'quick_wins');
    } catch (error) {
      console.error('Failed to load quick wins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (quickWin) => {
    if (quickWin.completed) return;

    try {
      await onboardingService.completeQuickWin(quickWin.id);

      // Update local state
      setQuickWins(quickWins.map(qw =>
        qw.id === quickWin.id
          ? { ...qw, completed: true, completedAt: new Date() }
          : qw
      ));

      // Show celebration
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 2000);

      // If all complete, celebrate extra
      const allComplete = quickWins.filter(qw => qw.id !== quickWin.id).every(qw => qw.completed);
      if (allComplete) {
        setTimeout(() => {
          alert('🎉 Congratulations! You\'ve completed all your Quick Wins! You\'re crushing it!');
        }, 500);
      }
    } catch (error) {
      console.error('Failed to complete quick win:', error);
      alert('Failed to mark as complete. Please try again.');
    }
  };

  const handleAction = (quickWin) => {
    if (quickWin.actionUrl) {
      navigate(quickWin.actionUrl);
    }
  };

  const completedCount = quickWins.filter(qw => qw.completed).length;
  const totalCount = quickWins.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (!visible) return null;

  return (
    <>
      {/* Celebration overlay */}
      {celebrating && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce text-8xl">🎉</div>
        </div>
      )}

      {/* Widget */}
      <div className="fixed bottom-6 right-6 z-40 w-96 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden transition-all duration-300">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-bold text-lg">Quick Wins</h3>
                <p className="text-xs text-purple-100">
                  {completedCount} of {totalCount} completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.();
                }}
                className="text-white hover:text-purple-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <svg
                className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Content */}
        {expanded && (
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Loading your quick wins...</p>
              </div>
            ) : quickWins.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-3">🎯</div>
                <p className="text-gray-600">No quick wins available yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {quickWins.map((quickWin, index) => (
                  <div
                    key={quickWin.id}
                    className={`p-4 transition-all ${
                      quickWin.completed ? 'bg-gray-50' : 'hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleComplete(quickWin)}
                        disabled={quickWin.completed}
                        className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          quickWin.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-purple-300 hover:border-purple-500'
                        }`}
                      >
                        {quickWin.completed && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-semibold text-gray-900 mb-1 ${
                            quickWin.completed ? 'line-through text-gray-500' : ''
                          }`}
                        >
                          {quickWin.title}
                        </h4>
                        {!quickWin.completed && quickWin.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {quickWin.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs">
                          {quickWin.estimatedTime && (
                            <span className="text-purple-600 font-medium">
                              ⏱️ {quickWin.estimatedTime}
                            </span>
                          )}
                          {quickWin.rewardPoints > 0 && (
                            <span className="text-green-600 font-medium">
                              +{quickWin.rewardPoints} pts
                            </span>
                          )}
                        </div>

                        {/* Action button */}
                        {!quickWin.completed && quickWin.actionUrl && (
                          <button
                            onClick={() => handleAction(quickWin)}
                            className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-semibold"
                          >
                            {quickWin.actionText || 'Get Started'} →
                          </button>
                        )}

                        {quickWin.completed && quickWin.completedAt && (
                          <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            {!loading && quickWins.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                {completedCount === totalCount ? (
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎊</div>
                    <p className="text-sm font-semibold text-green-600">
                      All done! You're crushing it!
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {totalCount - completedCount} task{totalCount - completedCount !== 1 ? 's' : ''} remaining
                    </span>
                    <button
                      onClick={loadQuickWins}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Refresh
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

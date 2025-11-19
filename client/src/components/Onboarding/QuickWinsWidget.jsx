/**
 * QuickWinsWidget Component
 * Floating widget in bottom-right corner showing 5 quick tasks
 */

import { useState, useEffect } from 'react';

export default function QuickWinsWidget({ userId, goal }) {
  const [isOpen, setIsOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickWins();
  }, []);

  const fetchQuickWins = async () => {
    try {
      const response = await fetch('/api/onboarding/quick-wins');
      if (!response.ok) {
        throw new Error('Failed to fetch quick wins');
      }
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching quick wins:', error);
      // Use fallback tasks if API fails
      setTasks(getFallbackTasks(goal));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const progress = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const percent = total > 0 ? Math.round((progress / total) * 100) : 0;

  // Hide widget if all tasks complete
  if (progress === total && total > 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <div className={`bg-white rounded-lg shadow-2xl border-2 border-orange-500 transition-all duration-300 ${
        isOpen ? 'w-96' : 'w-auto'
      }`}>

        {/* Header */}
        <div
          className="bg-orange-500 text-white p-4 rounded-t-lg cursor-pointer flex justify-between items-center hover:bg-orange-600 transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-bold">Quick Wins</span>
            {!isOpen && progress > 0 && (
              <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded">
                {progress}/{total}
              </span>
            )}
          </div>

          <button className="text-white hover:text-orange-100 transition-all text-xl font-bold">
            {isOpen ? '−' : '+'}
          </button>
        </div>

        {/* Content */}
        {isOpen && (
          <div className="p-4">

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress: {progress} of {total}</span>
                <span className="font-bold text-orange-500">{percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.map((task, i) => (
                <TaskItem key={i} task={task} />
              ))}
            </div>

            {/* Celebration if all done */}
            {progress === total && total > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg text-center animate-bounce-in">
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-bold text-lg">You Did It!</div>
                <div className="text-sm text-gray-700">
                  All Quick Wins complete! You're a rockstar! 🎸
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * Individual Task Item
 */
function TaskItem({ task }) {
  const handleAction = () => {
    if (task.actionUrl) {
      window.location.href = task.actionUrl;
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
        task.completed
          ? 'bg-green-50 border border-green-200'
          : 'bg-gray-50 border border-gray-200 hover:border-orange-300'
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">
        {task.completed ? (
          <span className="text-green-500 text-xl">✅</span>
        ) : (
          <span className="text-gray-400 text-xl">⬜</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {task.title}
        </div>
        {task.completed ? (
          <div className="text-xs text-green-600">
            Completed {task.completedAgo || 'recently'}
          </div>
        ) : (
          <div className="text-xs text-gray-500 mt-1">
            {task.description}
          </div>
        )}
      </div>

      {!task.completed && task.actionUrl && (
        <button
          onClick={handleAction}
          className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-all whitespace-nowrap flex-shrink-0"
        >
          Start →
        </button>
      )}
    </div>
  );
}

/**
 * Fallback tasks if API is unavailable
 */
function getFallbackTasks(goal) {
  const baseTasks = [
    {
      title: 'Complete Your Profile',
      description: 'Add your bio and profile picture',
      completed: false,
      actionUrl: '/settings/profile'
    },
    {
      title: 'Chat with SUPERNova AI',
      description: 'Ask your first question',
      completed: false,
      actionUrl: '/chat'
    }
  ];

  const goalSpecificTasks = {
    website: [
      {
        title: 'Create Your First Page',
        description: 'Build a simple landing page',
        completed: false,
        actionUrl: '/pages/new'
      },
      {
        title: 'Write a Blog Post',
        description: 'Share your first thoughts',
        completed: false,
        actionUrl: '/blog/new'
      },
      {
        title: 'Connect Your Domain',
        description: 'Link your custom domain',
        completed: false,
        actionUrl: '/settings/domain'
      }
    ],
    ecommerce: [
      {
        title: 'Add Your First Product',
        description: 'List what you\'re selling',
        completed: false,
        actionUrl: '/products/new'
      },
      {
        title: 'Set Up Payment Gateway',
        description: 'Connect Stripe or PayPal',
        completed: false,
        actionUrl: '/settings/payments'
      },
      {
        title: 'Create a Store Page',
        description: 'Build your product showcase',
        completed: false,
        actionUrl: '/pages/new?template=store'
      }
    ],
    course: [
      {
        title: 'Create Your First Course',
        description: 'Start your course outline',
        completed: false,
        actionUrl: '/courses/new'
      },
      {
        title: 'Upload a Lesson',
        description: 'Add video or text content',
        completed: false,
        actionUrl: '/courses/lessons/new'
      },
      {
        title: 'Set Course Pricing',
        description: 'Decide your course price',
        completed: false,
        actionUrl: '/courses/pricing'
      }
    ],
    crm: [
      {
        title: 'Add Your First Contact',
        description: 'Start building your list',
        completed: false,
        actionUrl: '/contacts/new'
      },
      {
        title: 'Create a Pipeline',
        description: 'Set up your sales stages',
        completed: false,
        actionUrl: '/crm/pipelines'
      },
      {
        title: 'Import Contacts',
        description: 'Upload your existing list',
        completed: false,
        actionUrl: '/contacts/import'
      }
    ]
  };

  const specificTasks = goalSpecificTasks[goal] || goalSpecificTasks.website;
  return [...baseTasks, ...specificTasks].slice(0, 5);
}

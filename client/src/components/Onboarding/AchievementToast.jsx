/**
 * AchievementToast Component
 * Popup notification when user unlocks a badge
 * Appears top-right, auto-dismisses after 5 seconds
 */

import { useEffect, useState } from 'react';

export default function AchievementToast({ achievement, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const badge = getBadgeInfo(achievement.badgeType || achievement.type);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleViewAll = () => {
    window.location.href = '/achievements';
  };

  const handleShare = async () => {
    const shareText = `I just unlocked the "${badge.title}" badge on The dAItaniverse! ${badge.emoji}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'New Achievement!',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Achievement copied to clipboard!');
    }
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-2xl border-2 p-4 min-w-[320px] max-w-sm animate-slide-bounce`}
        style={{ borderColor: badge.borderColor }}
      >
        <div className="flex items-center gap-3">
          <div className="text-4xl flex-shrink-0">{badge.emoji}</div>

          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase font-bold" style={{ color: badge.textColor }}>
              New Badge Unlocked!
            </div>
            <div className="text-lg font-bold text-gray-900 truncate">{badge.title}</div>
            {achievement.description && (
              <div className="text-sm text-gray-600">{achievement.description}</div>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-all flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
          <button
            onClick={handleViewAll}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white transition-all"
            style={{ backgroundColor: badge.bgColor }}
          >
            View All Badges
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm transition-all"
            title="Share achievement"
          >
            🔗
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-bounce {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          60% {
            transform: translateX(-10px);
            opacity: 1;
          }
          80% {
            transform: translateX(5px);
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-bounce {
          animation: slide-bounce 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * Get badge information by type
 */
function getBadgeInfo(badgeType) {
  const badges = {
    // Onboarding & First Actions
    FIRST_LOGIN: {
      emoji: '👋',
      title: 'Welcome Aboard!',
      bgColor: '#3b82f6',
      borderColor: '#3b82f6',
      textColor: '#3b82f6'
    },
    PROFILE_COMPLETE: {
      emoji: '✨',
      title: 'Profile Complete!',
      bgColor: '#8b5cf6',
      borderColor: '#8b5cf6',
      textColor: '#8b5cf6'
    },
    FIRST_PAGE: {
      emoji: '📄',
      title: 'First Page Created!',
      bgColor: '#3b82f6',
      borderColor: '#3b82f6',
      textColor: '#3b82f6'
    },
    FIRST_BLOG: {
      emoji: '✍️',
      title: 'First Blog Post!',
      bgColor: '#8b5cf6',
      borderColor: '#8b5cf6',
      textColor: '#8b5cf6'
    },
    FIRST_PRODUCT: {
      emoji: '🛍️',
      title: 'First Product Listed!',
      bgColor: '#10b981',
      borderColor: '#10b981',
      textColor: '#10b981'
    },
    FIRST_SALE: {
      emoji: '💰',
      title: 'First Sale!',
      bgColor: '#10b981',
      borderColor: '#10b981',
      textColor: '#10b981'
    },
    FIRST_COURSE: {
      emoji: '🎓',
      title: 'First Course Created!',
      bgColor: '#8b5cf6',
      borderColor: '#8b5cf6',
      textColor: '#8b5cf6'
    },
    FIRST_CONTACT: {
      emoji: '👤',
      title: 'First Contact Added!',
      bgColor: '#3b82f6',
      borderColor: '#3b82f6',
      textColor: '#3b82f6'
    },

    // Streaks
    STREAK_3: {
      emoji: '🔥',
      title: '3-Day Streak!',
      bgColor: '#f59e0b',
      borderColor: '#f59e0b',
      textColor: '#f59e0b'
    },
    STREAK_7: {
      emoji: '🔥',
      title: '7-Day Streak!',
      bgColor: '#f97316',
      borderColor: '#f97316',
      textColor: '#f97316'
    },
    STREAK_30: {
      emoji: '🔥',
      title: '30-Day Streak!',
      bgColor: '#dc2626',
      borderColor: '#dc2626',
      textColor: '#dc2626'
    },
    STREAK_100: {
      emoji: '🔥',
      title: '100-Day Streak!',
      bgColor: '#7c2d12',
      borderColor: '#7c2d12',
      textColor: '#7c2d12'
    },

    // Milestones
    PAGES_10: {
      emoji: '📚',
      title: '10 Pages Published!',
      bgColor: '#3b82f6',
      borderColor: '#3b82f6',
      textColor: '#3b82f6'
    },
    PRODUCTS_10: {
      emoji: '🏪',
      title: '10 Products Listed!',
      bgColor: '#10b981',
      borderColor: '#10b981',
      textColor: '#10b981'
    },
    SALES_10: {
      emoji: '💵',
      title: '10 Sales!',
      bgColor: '#10b981',
      borderColor: '#10b981',
      textColor: '#10b981'
    },
    SALES_100: {
      emoji: '💸',
      title: '100 Sales!',
      bgColor: '#059669',
      borderColor: '#059669',
      textColor: '#059669'
    },
    REVENUE_1K: {
      emoji: '💰',
      title: '$1,000 Revenue!',
      bgColor: '#10b981',
      borderColor: '#10b981',
      textColor: '#10b981'
    },
    REVENUE_10K: {
      emoji: '💎',
      title: '$10,000 Revenue!',
      bgColor: '#059669',
      borderColor: '#059669',
      textColor: '#059669'
    },
    CONTACTS_100: {
      emoji: '👥',
      title: '100 Contacts!',
      bgColor: '#3b82f6',
      borderColor: '#3b82f6',
      textColor: '#3b82f6'
    },
    CONTACTS_1000: {
      emoji: '🌟',
      title: '1,000 Contacts!',
      bgColor: '#2563eb',
      borderColor: '#2563eb',
      textColor: '#2563eb'
    },

    // Engagement
    COURSE_COMPLETE: {
      emoji: '🎓',
      title: 'Course Completed!',
      bgColor: '#8b5cf6',
      borderColor: '#8b5cf6',
      textColor: '#8b5cf6'
    },
    STUDENT_FIRST: {
      emoji: '👨‍🎓',
      title: 'First Student Enrolled!',
      bgColor: '#8b5cf6',
      borderColor: '#8b5cf6',
      textColor: '#8b5cf6'
    },
    STUDENT_100: {
      emoji: '🎉',
      title: '100 Students!',
      bgColor: '#7c3aed',
      borderColor: '#7c3aed',
      textColor: '#7c3aed'
    },
    EMAIL_SENT_100: {
      emoji: '📧',
      title: '100 Emails Sent!',
      bgColor: '#3b82f6',
      borderColor: '#3b82f6',
      textColor: '#3b82f6'
    },

    // Special
    QUICK_WINS_COMPLETE: {
      emoji: '🏆',
      title: 'Quick Wins Complete!',
      bgColor: '#f59e0b',
      borderColor: '#f59e0b',
      textColor: '#f59e0b'
    },
    SUPERNOVA_CHAT: {
      emoji: '🤖',
      title: 'SUPERNova Friend!',
      bgColor: '#8b5cf6',
      borderColor: '#8b5cf6',
      textColor: '#8b5cf6'
    },
    EARLY_ADOPTER: {
      emoji: '🚀',
      title: 'Early Adopter!',
      bgColor: '#f97316',
      borderColor: '#f97316',
      textColor: '#f97316'
    },
    COMMUNITY_MEMBER: {
      emoji: '👋',
      title: 'Community Member!',
      bgColor: '#3b82f6',
      borderColor: '#3b82f6',
      textColor: '#3b82f6'
    }
  };

  return badges[badgeType] || {
    emoji: '🏆',
    title: 'Achievement Unlocked!',
    bgColor: '#f97316',
    borderColor: '#f97316',
    textColor: '#f97316'
  };
}

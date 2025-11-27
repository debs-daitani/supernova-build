'use client';

import { useEffect, useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import {
  initializeNotifications,
  requestNotificationPermission,
  getNotificationPermission,
  showNotification,
  notificationTemplates,
  isNotificationSupported,
} from '@/lib/notifications';
import { getUserPreferences } from '@/lib/preferences';

export default function NotificationManager() {
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (!isNotificationSupported()) return;

    const currentPermission = getNotificationPermission();
    setPermission(currentPermission);

    // Check if user has enabled notifications in preferences but hasn't granted browser permission
    const prefs = getUserPreferences();
    if (prefs.enableNotifications && currentPermission === 'default') {
      // Show custom prompt after a delay
      setTimeout(() => {
        setShowPermissionPrompt(true);
      }, 3000);
    }

    // Initialize notifications if already granted
    if (currentPermission === 'granted' && prefs.enableNotifications) {
      initializeNotifications();
    }
  }, []);

  const handleEnableNotifications = async () => {
    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);
    setShowPermissionPrompt(false);

    if (newPermission === 'granted') {
      // Show welcome notification
      showNotification({
        title: 'Notifications Enabled!',
        body: "You'll now get reminders for tasks, focus sessions, and energy check-ins.",
        type: 'achievement-unlocked',
      });

      // Initialize notification system
      await initializeNotifications();
    }
  };

  const handleDismiss = () => {
    setShowPermissionPrompt(false);
    // Don't ask again for 7 days
    localStorage.setItem('venued_notification_prompt_dismissed', Date.now().toString());
  };

  // Don't show if permission already granted or denied, or if dismissed recently
  if (permission !== 'default' || !showPermissionPrompt) {
    return null;
  }

  // Check if dismissed recently (within 7 days)
  const dismissed = localStorage.getItem('venued_notification_prompt_dismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed, 10);
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - dismissedTime < sevenDaysMs) {
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-fade-in">
      <div className="p-6 rounded-xl bg-gradient-to-br from-electric-purple/20 to-neon-pink/20 border-2 border-electric-purple/30 backdrop-blur-lg shadow-[0_0_30px_rgba(157,78,221,0.3)]">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-electric-purple flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">
              Enable Notifications?
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Get helpful reminders for tasks, focus sessions, and ADHD check-ins. We'll only send notifications you actually need.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleEnableNotifications}
                className="flex-1 px-4 py-2 bg-electric-purple rounded-lg text-white font-semibold hover:bg-neon-pink transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Enable
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/20 transition-all"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

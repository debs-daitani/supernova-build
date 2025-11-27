import { getUserPreferences } from './preferences';

export type NotificationType =
  | 'task-reminder'
  | 'focus-start'
  | 'focus-end'
  | 'deadline-alert'
  | 'energy-checkin'
  | 'streak-milestone'
  | 'achievement-unlocked';

export interface NotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  tag?: string;
}

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

// Check if notifications are enabled in preferences
export const areNotificationsEnabled = (): boolean => {
  const prefs = getUserPreferences();
  return prefs.enableNotifications;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

// Check current notification permission
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

// Show a notification
export const showNotification = async (payload: NotificationPayload): Promise<void> => {
  // Check if notifications are enabled in user preferences
  if (!areNotificationsEnabled()) {
    return;
  }

  // Check if notifications are supported
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return;
  }

  // Check permission
  let permission = getNotificationPermission();

  // Request permission if not granted
  if (permission === 'default') {
    permission = await requestNotificationPermission();
  }

  // Show notification if permission granted
  if (permission === 'granted') {
    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: payload.tag || payload.type,
        data: payload.data,
        requireInteraction: false,
        silent: !getUserPreferences().notificationSound,
      });

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();

        // Navigate based on notification type
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
};

// Notification templates
export const notificationTemplates = {
  taskReminder: (taskTitle: string, time: string): NotificationPayload => ({
    title: 'Task Reminder',
    body: `Time to work on: ${taskTitle}`,
    type: 'task-reminder',
    data: { taskTitle, time, url: '/crew' },
  }),

  focusStart: (taskTitle: string, duration: number): NotificationPayload => ({
    title: 'Focus Session Starting',
    body: `Starting ${duration}-minute focus session on: ${taskTitle}`,
    type: 'focus-start',
    data: { taskTitle, duration, url: '/crew' },
  }),

  focusEnd: (taskTitle: string): NotificationPayload => ({
    title: 'Focus Session Complete!',
    body: `Great work on: ${taskTitle}. Time for a break!`,
    type: 'focus-end',
    data: { taskTitle, url: '/crew' },
  }),

  deadlineAlert: (projectName: string, hoursLeft: number): NotificationPayload => ({
    title: 'Deadline Approaching',
    body: `${projectName} is due in ${hoursLeft} hours`,
    type: 'deadline-alert',
    data: { projectName, hoursLeft, url: '/backstage' },
  }),

  energyCheckin: (): NotificationPayload => ({
    title: 'Energy Check-in',
    body: "How's your energy level right now? Log it to track your patterns.",
    type: 'energy-checkin',
    data: { url: '/entourage' },
  }),

  streakMilestone: (streak: number): NotificationPayload => ({
    title: `${streak}-Day Streak!`,
    body: `You're on fire! Keep the momentum going.`,
    type: 'streak-milestone',
    data: { streak, url: '/analytics' },
  }),

  achievementUnlocked: (achievementName: string): NotificationPayload => ({
    title: 'Achievement Unlocked!',
    body: achievementName,
    type: 'achievement-unlocked',
    data: { achievementName, url: '/settings' },
  }),
};

// Schedule a notification (using setTimeout for now, can be upgraded to service worker)
export const scheduleNotification = (
  payload: NotificationPayload,
  delayMs: number
): NodeJS.Timeout => {
  return setTimeout(() => {
    showNotification(payload);
  }, delayMs);
};

// Cancel a scheduled notification
export const cancelNotification = (timeoutId: NodeJS.Timeout): void => {
  clearTimeout(timeoutId);
};

// Schedule recurring notifications (e.g., daily energy check-ins)
export const scheduleRecurringNotification = (
  payload: NotificationPayload,
  intervalMs: number
): NodeJS.Timeout => {
  return setInterval(() => {
    showNotification(payload);
  }, intervalMs);
};

// Helper: Schedule task reminder
export const scheduleTaskReminder = (
  taskTitle: string,
  scheduledTime: string,
  scheduledDate: string
): NodeJS.Timeout | null => {
  const now = new Date();
  const taskDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

  // Schedule notification 15 minutes before
  const reminderTime = new Date(taskDateTime.getTime() - 15 * 60 * 1000);

  const delayMs = reminderTime.getTime() - now.getTime();

  if (delayMs > 0) {
    const payload = notificationTemplates.taskReminder(
      taskTitle,
      taskDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    );
    return scheduleNotification(payload, delayMs);
  }

  return null;
};

// Helper: Schedule deadline alerts
export const scheduleDeadlineAlert = (
  projectName: string,
  targetDate: string
): NodeJS.Timeout[] => {
  const now = new Date();
  const deadline = new Date(targetDate);
  const timeoutIds: NodeJS.Timeout[] = [];

  // Alert 24 hours before
  const oneDayBefore = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
  const delayForOneDayBefore = oneDayBefore.getTime() - now.getTime();

  if (delayForOneDayBefore > 0) {
    const id = scheduleNotification(notificationTemplates.deadlineAlert(projectName, 24), delayForOneDayBefore);
    timeoutIds.push(id);
  }

  // Alert 3 hours before
  const threeHoursBefore = new Date(deadline.getTime() - 3 * 60 * 60 * 1000);
  const delayForThreeHoursBefore = threeHoursBefore.getTime() - now.getTime();

  if (delayForThreeHoursBefore > 0) {
    const id = scheduleNotification(notificationTemplates.deadlineAlert(projectName, 3), delayForThreeHoursBefore);
    timeoutIds.push(id);
  }

  return timeoutIds;
};

// Helper: Daily energy check-in (at 10 AM, 2 PM, 6 PM)
export const scheduleDailyEnergyCheckins = (): NodeJS.Timeout[] => {
  const now = new Date();
  const timeoutIds: NodeJS.Timeout[] = [];
  const checkInTimes = [10, 14, 18]; // 10 AM, 2 PM, 6 PM

  checkInTimes.forEach(hour => {
    const nextCheckin = new Date(now);
    nextCheckin.setHours(hour, 0, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (nextCheckin <= now) {
      nextCheckin.setDate(nextCheckin.getDate() + 1);
    }

    const delayMs = nextCheckin.getTime() - now.getTime();

    const id = scheduleRecurringNotification(
      notificationTemplates.energyCheckin(),
      24 * 60 * 60 * 1000 // Repeat every 24 hours
    );

    // Schedule first occurrence
    setTimeout(() => {
      showNotification(notificationTemplates.energyCheckin());
    }, delayMs);

    timeoutIds.push(id);
  });

  return timeoutIds;
};

// Initialize notification system
export const initializeNotifications = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    return false;
  }

  // Check if user has enabled notifications in preferences
  if (!areNotificationsEnabled()) {
    return false;
  }

  // Request permission if needed
  const permission = await requestNotificationPermission();

  if (permission === 'granted') {
    // Schedule daily energy check-ins if enabled
    scheduleDailyEnergyCheckins();
    return true;
  }

  return false;
};

// Clear all scheduled notifications (call on logout or cleanup)
export const clearAllNotifications = (): void => {
  // Note: Individual timeoutIds should be stored and cleared
  // This is a simplified version
  console.log('Clearing all scheduled notifications');
};

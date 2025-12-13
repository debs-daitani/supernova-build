import { EnergyLevel } from './types';

export interface UserProfile {
  displayName: string;
  bio: string;
  avatarEmoji: string;
  joinedDate: string;
}

export interface UserPreferences {
  // General
  timeFormat: '12h' | '24h';
  weekStartDay: 'sunday' | 'monday';
  defaultEnergyLevel: EnergyLevel;

  // ADHD
  timeMultiplier: number;
  enableNotifications: boolean;
  notificationSound: boolean;

  // Visual
  reduceAnimations: boolean;
  compactMode: boolean;

  // Privacy
  collectAnalytics: boolean;
}

const PROFILE_KEY = 'venued_user_profile';
const PREFERENCES_KEY = 'venued_user_preferences';

const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Rockstar',
  bio: 'Building projects like a tour',
  avatarEmoji: '🎸',
  joinedDate: new Date().toISOString(),
};

const DEFAULT_PREFERENCES: UserPreferences = {
  timeFormat: '12h',
  weekStartDay: 'monday',
  defaultEnergyLevel: 'medium',
  timeMultiplier: 1.8,
  enableNotifications: false,
  notificationSound: true,
  reduceAnimations: false,
  compactMode: false,
  collectAnalytics: false,
};

// Get user profile
export const getUserProfile = (): UserProfile => {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;

  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return DEFAULT_PROFILE;
  }
};

// Save user profile
export const saveUserProfile = (profile: Partial<UserProfile>): void => {
  if (typeof window === 'undefined') return;

  try {
    const current = getUserProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

// Get user preferences
export const getUserPreferences = (): UserPreferences => {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error loading preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

// Save user preferences
export const saveUserPreferences = (preferences: Partial<UserPreferences>): void => {
  if (typeof window === 'undefined') return;

  try {
    const current = getUserPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

// Get storage usage
export const getStorageInfo = (): { used: number; available: number; percentage: number } => {
  if (typeof window === 'undefined') {
    return { used: 0, available: 0, percentage: 0 };
  }

  try {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Most browsers allow ~5-10MB
    const available = 10 * 1024 * 1024; // 10MB estimate
    const percentage = (used / available) * 100;

    return {
      used: Math.round(used / 1024), // Convert to KB
      available: Math.round(available / 1024),
      percentage: Math.round(percentage * 10) / 10,
    };
  } catch (error) {
    return { used: 0, available: 0, percentage: 0 };
  }
};

// Available avatar emojis
export const AVATAR_EMOJIS = [
  '🎸', '🎤', '🎵', '🎶', '🎧', '🎹', '🥁', '🎺', '🎷', '🎻',
  '⚡', '🤘', '💫', '⭐', '🌟', '✨', '💥', '🚀', '🎯', '🏆',
  '🧠', '💪', '👑', '🦄', '🐉', '🦅', '🦁', '🐺', '🦊', '🐱',
  '💎', '🎨', '📚', '💻', '🔮', '🌙', '☀️', '🌈', '🌊', '🏔️',
];

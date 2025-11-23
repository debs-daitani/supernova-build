'use client';

import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Trash2,
  AlertCircle,
  Check,
  User,
  Trophy,
  Zap,
  Bell,
  Eye,
  Database,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Clock,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { clearAllData, exportData, importData, isDemoDataLoaded, generateDemoData } from '@/lib/demoData';
import {
  getUserProfile,
  saveUserProfile,
  getUserPreferences,
  saveUserPreferences,
  getStorageInfo,
  AVATAR_EMOJIS,
  UserProfile,
  UserPreferences,
} from '@/lib/preferences';
import { getUserStats, getAchievements, Achievement } from '@/lib/achievements';
import { useRouter } from 'next/navigation';

type SettingsSection = 'profile' | 'achievements' | 'preferences' | 'data' | 'about';

export default function Settings() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());

  // Stats state
  const [stats, setStats] = useState(getUserStats());
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    setStats(getUserStats());
    setAchievements(getAchievements());
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Profile handlers
  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    saveUserProfile(updated);
    showMessage('success', 'Profile updated!');
  };

  const handleAvatarSelect = (emoji: string) => {
    handleProfileChange('avatarEmoji', emoji);
    setShowAvatarPicker(false);
  };

  // Preferences handlers
  const handlePreferenceChange = (field: keyof UserPreferences, value: any) => {
    const updated = { ...preferences, [field]: value };
    setPreferences(updated);
    saveUserPreferences(updated);
    showMessage('success', 'Preferences updated!');
  };

  // Data handlers
  const handleExport = () => {
    try {
      exportData();
      showMessage('success', 'Data exported successfully!');
      // Refresh achievements in case export achievement was unlocked
      setTimeout(() => setAchievements(getAchievements()), 500);
    } catch (error) {
      showMessage('error', 'Failed to export data');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importData(file);
      showMessage('success', 'Data imported successfully!');
      setTimeout(() => {
        setMessage(null);
        window.location.reload();
      }, 2000);
    } catch (error) {
      showMessage('error', 'Failed to import data');
    }
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    showMessage('success', 'All data cleared!');
    setTimeout(() => {
      setMessage(null);
      router.push('/');
    }, 2000);
  };

  const handleLoadDemo = () => {
    generateDemoData();
    showMessage('success', 'Demo data loaded!');
    setTimeout(() => {
      setMessage(null);
      router.push('/backstage');
    }, 2000);
  };

  const filteredAchievements = achievements.filter(a => {
    if (achievementFilter === 'unlocked') return a.unlockedAt;
    if (achievementFilter === 'locked') return !a.unlockedAt;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const storageInfo = getStorageInfo();

  const tierColors = {
    bronze: 'bg-orange-500/20 border-orange-500/40 text-orange-400',
    silver: 'bg-gray-400/20 border-gray-400/40 text-gray-300',
    gold: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
    platinum: 'bg-cyan-400/20 border-cyan-400/40 text-cyan-300',
    cosmic: 'bg-gradient-to-r from-electric-purple/20 to-neon-pink/20 border-neon-pink/40 text-neon-pink',
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-10 h-10 text-electric-purple" />
            <h1 className="text-5xl font-black text-white">Settings</h1>
          </div>
          <p className="text-xl text-gray-400">
            Manage your profile, track achievements, and configure VENUED
          </p>
        </div>

        {/* Message Toast */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border-2 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 flex flex-wrap gap-3">
          {[
            { id: 'profile' as const, label: 'Profile', icon: User },
            { id: 'achievements' as const, label: 'Achievements', icon: Trophy },
            { id: 'preferences' as const, label: 'Preferences', icon: Zap },
            { id: 'data' as const, label: 'Data', icon: Database },
            { id: 'about' as const, label: 'About', icon: Info },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-electric-purple to-neon-pink text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-electric-purple/10 to-neon-pink/10 border-2 border-electric-purple/30">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <button
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-electric-purple to-neon-pink flex items-center justify-center text-5xl hover:scale-110 transition-transform"
                  >
                    {profile.avatarEmoji}
                  </button>
                  {showAvatarPicker && (
                    <div className="absolute top-28 left-0 w-80 p-4 rounded-xl bg-black border-2 border-white/20 grid grid-cols-8 gap-2 z-10">
                      {AVATAR_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleAvatarSelect(emoji)}
                          className="text-3xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={e => handleProfileChange('displayName', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border-2 border-white/10 text-white focus:border-electric-purple outline-none"
                      maxLength={30}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={e => handleProfileChange('bio', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border-2 border-white/10 text-white focus:border-electric-purple outline-none resize-none"
                      rows={3}
                      maxLength={150}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {profile.bio.length}/150 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                  <div className="text-3xl font-black text-neon-pink">
                    {stats.level}
                  </div>
                  <div className="text-sm text-gray-400">Level</div>
                </div>
                <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                  <div className="text-3xl font-black text-electric-purple">
                    {stats.xp}
                  </div>
                  <div className="text-sm text-gray-400">XP</div>
                </div>
                <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                  <div className="text-3xl font-black text-neon-green">
                    {stats.streak}
                  </div>
                  <div className="text-sm text-gray-400">Day Streak</div>
                </div>
                <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                  <div className="text-3xl font-black text-yellow-400">
                    {unlockedCount}/{achievements.length}
                  </div>
                  <div className="text-sm text-gray-400">Achievements</div>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-neon-pink" />
                  Project Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Projects</span>
                    <span className="text-white font-bold">{stats.totalProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed</span>
                    <span className="text-neon-green font-bold">{stats.completedProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completion Rate</span>
                    <span className="text-white font-bold">
                      {stats.totalProjects > 0
                        ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-electric-purple" />
                  Task Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Tasks</span>
                    <span className="text-white font-bold">{stats.totalTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed</span>
                    <span className="text-neon-green font-bold">{stats.completedTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Focus Time</span>
                    <span className="text-white font-bold">
                      {Math.round(stats.totalFocusMinutes / 60)}h
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  ADHD Tracking
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hyperfocus Sessions</span>
                    <span className="text-white font-bold">{stats.hyperfocusSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Energy Logs</span>
                    <span className="text-white font-bold">{stats.energyLogsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Tracking</span>
                    <span className="text-white font-bold">{stats.timeTrackingEntries}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Storage
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Used</span>
                    <span className="text-white font-bold">{storageInfo.used} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available</span>
                    <span className="text-white font-bold">{storageInfo.available} KB</span>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Usage</span>
                      <span className="text-white font-bold">{storageInfo.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-electric-purple to-neon-pink"
                        style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {activeSection === 'achievements' && (
          <div className="space-y-6">
            {/* Achievement Header */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-electric-purple/20 to-neon-pink/20 border-2 border-electric-purple/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">
                    {unlockedCount} / {achievements.length} Unlocked
                  </h2>
                  <p className="text-gray-400">Keep building to unlock more achievements!</p>
                </div>
                <Trophy className="w-16 h-16 text-yellow-400" />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3">
              {(['all', 'unlocked', 'locked'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setAchievementFilter(filter)}
                  className={`px-6 py-2 rounded-lg font-semibold capitalize transition-all ${
                    achievementFilter === filter
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {filter}
                  {filter !== 'all' && (
                    <span className="ml-2">
                      ({filter === 'unlocked' ? unlockedCount : achievements.length - unlockedCount})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Achievements Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    achievement.unlockedAt
                      ? tierColors[achievement.tier]
                      : 'bg-white/5 border-white/10 text-gray-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`text-4xl ${
                        achievement.unlockedAt ? '' : 'grayscale opacity-30'
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold">{achievement.name}</h3>
                        <span className="px-2 py-1 rounded text-xs font-bold uppercase">
                          {achievement.tier}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{achievement.description}</p>

                      {/* Progress Bar */}
                      {!achievement.unlockedAt && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>
                              {achievement.progress} / {achievement.maxProgress}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-electric-purple to-neon-pink"
                              style={{
                                width: `${
                                  (achievement.progress / achievement.maxProgress) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {achievement.unlockedAt && (
                        <p className="text-xs">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preferences Section */}
        {activeSection === 'preferences' && (
          <div className="space-y-6">
            {/* General Preferences */}
            <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-neon-pink" />
                General Preferences
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Time Format
                  </label>
                  <div className="flex gap-3">
                    {(['12h', '24h'] as const).map(format => (
                      <button
                        key={format}
                        onClick={() => handlePreferenceChange('timeFormat', format)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          preferences.timeFormat === format
                            ? 'bg-electric-purple text-white'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                      >
                        {format === '12h' ? '12-hour' : '24-hour'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Week Starts On
                  </label>
                  <div className="flex gap-3">
                    {(['sunday', 'monday'] as const).map(day => (
                      <button
                        key={day}
                        onClick={() => handlePreferenceChange('weekStartDay', day)}
                        className={`px-6 py-3 rounded-lg font-semibold capitalize transition-all ${
                          preferences.weekStartDay === day
                            ? 'bg-electric-purple text-white'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ADHD Preferences */}
            <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-neon-green" />
                ADHD Preferences
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Default Energy Level
                  </label>
                  <div className="flex gap-3">
                    {(['low', 'medium', 'high'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => handlePreferenceChange('defaultEnergyLevel', level)}
                        className={`px-6 py-3 rounded-lg font-semibold capitalize transition-all ${
                          preferences.defaultEnergyLevel === level
                            ? 'bg-neon-green text-black'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Time Multiplier (for time blindness)
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.1"
                    value={preferences.timeMultiplier}
                    onChange={e =>
                      handlePreferenceChange('timeMultiplier', parseFloat(e.target.value))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>1.0x (optimistic)</span>
                    <span className="text-white font-bold">{preferences.timeMultiplier}x</span>
                    <span>3.0x (realistic)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Multiplies time estimates to account for ADHD time blindness
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6 text-yellow-400" />
                Notifications
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                  <div>
                    <div className="font-semibold text-white">Enable Notifications</div>
                    <div className="text-sm text-gray-400">
                      Get reminders for tasks and focus sessions
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.enableNotifications}
                    onChange={e =>
                      handlePreferenceChange('enableNotifications', e.target.checked)
                    }
                    className="w-6 h-6"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                  <div>
                    <div className="font-semibold text-white">Notification Sound</div>
                    <div className="text-sm text-gray-400">Play sound with notifications</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notificationSound}
                    onChange={e =>
                      handlePreferenceChange('notificationSound', e.target.checked)
                    }
                    className="w-6 h-6"
                    disabled={!preferences.enableNotifications}
                  />
                </label>
              </div>
            </div>

            {/* Visual Preferences */}
            <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Eye className="w-6 h-6 text-cyan-400" />
                Visual Preferences
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                  <div>
                    <div className="font-semibold text-white">Reduce Animations</div>
                    <div className="text-sm text-gray-400">Minimize motion for focus</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.reduceAnimations}
                    onChange={e => handlePreferenceChange('reduceAnimations', e.target.checked)}
                    className="w-6 h-6"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                  <div>
                    <div className="font-semibold text-white">Compact Mode</div>
                    <div className="text-sm text-gray-400">Show more content per screen</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.compactMode}
                    onChange={e => handlePreferenceChange('compactMode', e.target.checked)}
                    className="w-6 h-6"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Data Management Section */}
        {activeSection === 'data' && (
          <div className="space-y-6">
            <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Download className="w-6 h-6 text-neon-pink" />
                Export Data
              </h2>
              <p className="text-gray-400 mb-4">
                Download all your projects, tasks, and ADHD tracking data as a JSON file for backup.
              </p>
              <button
                onClick={handleExport}
                className="px-6 py-3 bg-neon-pink rounded-lg text-black font-bold hover:bg-white transition-all"
              >
                Export Backup
              </button>
            </div>

            <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Upload className="w-6 h-6 text-electric-purple" />
                Import Data
              </h2>
              <p className="text-gray-400 mb-4">
                Restore your data from a previously exported JSON backup file.
              </p>
              <label className="inline-block px-6 py-3 bg-electric-purple rounded-lg text-white font-bold hover:bg-white hover:text-black transition-all cursor-pointer">
                Choose File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10">
              <h2 className="text-2xl font-bold text-white mb-2">Demo Data</h2>
              <p className="text-gray-400 mb-4">
                {isDemoDataLoaded()
                  ? 'Demo data is currently loaded.'
                  : 'Load sample projects and tasks to explore VENUED.'}
              </p>
              {!isDemoDataLoaded() && (
                <button
                  onClick={handleLoadDemo}
                  className="px-6 py-3 bg-neon-green rounded-lg text-black font-bold hover:bg-white transition-all"
                >
                  Load Demo Data
                </button>
              )}
            </div>

            <div className="p-8 rounded-xl bg-red-500/10 border-2 border-red-500/30">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-400" />
                Clear All Data
              </h2>
              <p className="text-gray-400 mb-4">
                Permanently delete all projects, tasks, and tracking data. This cannot be undone.
              </p>

              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-6 py-3 bg-red-500/20 border-2 border-red-500/50 rounded-lg text-red-400 font-bold hover:bg-red-500/30 transition-all"
                >
                  Clear All Data
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50">
                    <p className="text-red-400 font-semibold mb-2">
                      Are you absolutely sure?
                    </p>
                    <p className="text-sm text-gray-400">
                      This will permanently delete all your data. Consider exporting a backup first.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClearAll}
                      className="px-6 py-3 bg-red-500 rounded-lg text-white font-bold hover:bg-red-400 transition-all"
                    >
                      Yes, Delete Everything
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-6 py-3 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Section */}
        {activeSection === 'about' && (
          <div className="space-y-6">
            <div className="p-8 rounded-xl bg-gradient-to-br from-electric-purple/20 to-neon-pink/20 border-2 border-electric-purple/30">
              <h2 className="text-2xl font-bold text-white mb-4">About VENUED</h2>
              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>Version:</strong> 1.0.0
                </p>
                <p>
                  <strong>Built for:</strong> ADHD brains, by ADHD brains
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  All data is stored locally in your browser. Nothing is sent to any server. Install
                  as a PWA for offline access and a better experience.
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    Member since: {new Date(profile.joinedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Why VENUED?</h2>
              <div className="space-y-3 text-gray-300">
                <p>Because sometimes you need a project planner that understands that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You'll hyperfocus for 6 hours straight</li>
                  <li>Then have zero energy the next day</li>
                  <li>Time estimates are always wrong</li>
                  <li>You need to see the big picture AND the details</li>
                  <li>Motivation comes from momentum, not discipline</li>
                  <li>Your brain works differently, and that's not a bug—it's a feature</li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-neon-green/10 to-electric-purple/10 border-2 border-neon-green/30 text-center">
              <h2 className="text-3xl font-black text-white mb-2">Get VENUED. Get it Done.</h2>
              <p className="text-gray-400">Plan your projects like a tour. Execute like a headliner.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

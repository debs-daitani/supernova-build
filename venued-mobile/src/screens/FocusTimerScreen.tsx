import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme/colors';
import { getFocusSessions, saveFocusSession } from '../lib/storage';

interface FocusSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  taskName: string;
  completed: boolean;
  wasHyperfocus?: boolean;
  estimatedMinutes?: number;
  actualMinutes?: number;
}

interface NavigationProps {
  navigation: any;
}

type TabType = 'timer' | 'hyperfocus' | 'time';

const FocusTimerScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabType>('timer');

  // Timer State
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<string>('');

  // Hyperfocus Logger State
  const [hyperfocusNote, setHyperfocusNote] = useState('');
  const [hyperfocusTrigger, setHyperfocusTrigger] = useState('');

  // Time Perception State
  const [estimatedTime, setEstimatedTime] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [trackingTask, setTrackingTask] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadSessions = async () => {
    const data = await getFocusSessions();
    setSessions(data);
  };

  // Timer Functions
  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = new Date().toISOString();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const handlePause = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleResume = () => {
    setIsPaused(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const handleStop = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (seconds > 0) {
      const session: FocusSession = {
        id: `session-${Date.now()}`,
        startTime: startTimeRef.current,
        endTime: new Date().toISOString(),
        duration: seconds,
        taskName: 'Focus Session',
        completed: true,
      };

      await saveFocusSession(session);
      await loadSessions();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        '✨ Session Complete!',
        `Great work! You focused for ${formatTime(seconds)}`,
        [{ text: 'Awesome!' }]
      );
    }

    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    startTimeRef.current = '';
  };

  // Hyperfocus Functions
  const logHyperfocus = async () => {
    if (!hyperfocusNote.trim()) {
      Alert.alert('Add details', 'What were you hyperfocusing on?');
      return;
    }

    const session: FocusSession = {
      id: `hyperfocus-${Date.now()}`,
      startTime: new Date().toISOString(),
      duration: 0,
      taskName: hyperfocusNote.trim(),
      completed: true,
      wasHyperfocus: true,
    };

    await saveFocusSession(session);
    await loadSessions();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('🎯 Hyperfocus Logged!', 'Great for spotting your patterns.');

    setHyperfocusNote('');
    setHyperfocusTrigger('');
  };

  // Time Perception Functions
  const startTimeTracking = () => {
    if (!taskDescription.trim() || !estimatedTime.trim()) {
      Alert.alert('Fill in details', 'Add the task and your time estimate');
      return;
    }
    setTrackingTask(true);
    setTaskStartTime(new Date());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const stopTimeTracking = async () => {
    if (!taskStartTime) return;

    const actualMinutes = Math.round((new Date().getTime() - taskStartTime.getTime()) / 60000);
    const estimated = parseInt(estimatedTime) || 0;
    const difference = actualMinutes - estimated;

    const session: FocusSession = {
      id: `time-${Date.now()}`,
      startTime: taskStartTime.toISOString(),
      endTime: new Date().toISOString(),
      duration: actualMinutes * 60,
      taskName: taskDescription.trim(),
      completed: true,
      estimatedMinutes: estimated,
      actualMinutes: actualMinutes,
    };

    await saveFocusSession(session);
    await loadSessions();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let message = '';
    if (difference > 0) {
      message = `It took ${difference} minutes longer than estimated. ADHD brains often underestimate by 1.8x - totally normal!`;
    } else if (difference < 0) {
      message = `You finished ${Math.abs(difference)} minutes faster! Nice one!`;
    } else {
      message = `Spot on estimate! You're getting better at time awareness.`;
    }

    Alert.alert(
      `⏱️ Task Complete!`,
      `Estimated: ${estimated} min\nActual: ${actualMinutes} min\n\n${message}`,
      [{ text: 'Got it!' }]
    );

    setTrackingTask(false);
    setTaskStartTime(null);
    setTaskDescription('');
    setEstimatedTime('');
  };

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayMinutes = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => s.startTime.startsWith(today));
    const totalSeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    return Math.floor(totalSeconds / 60);
  };

  const getHyperfocusCount = () => {
    return sessions.filter(s => s.wasHyperfocus).length;
  };

  const renderTimerTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{getTodayMinutes()}</Text>
          <Text style={styles.statLabel}>Today's Minutes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{sessions.length}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <LinearGradient
          colors={isRunning ? ['#9D4EDD', '#FF1B8D'] : [colors.card, colors.card]}
          style={styles.timerCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.timerInner}>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            <Text style={styles.timerLabel}>
              {isRunning ? (isPaused ? 'PAUSED' : 'FOCUSING') : 'READY'}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <LinearGradient colors={gradients.primary} style={styles.startButtonGradient}>
              <Text style={styles.startButtonText}>Start Focus Session</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            {!isPaused ? (
              <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                <Text style={styles.pauseButtonText}>⏸ Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
                <LinearGradient colors={gradients.primary} style={styles.resumeButtonGradient}>
                  <Text style={styles.resumeButtonText}>▶ Resume</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
              <Text style={styles.stopButtonText}>■ Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderHyperfocusTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🎯 Track Your Hyperfocus</Text>
        <Text style={styles.infoText}>
          Log when you enter hyperfocus mode to spot patterns.
          What triggers it? What time of day? What tasks?
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>What are you hyperfocusing on?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Building that new feature..."
          placeholderTextColor={colors.textMuted}
          value={hyperfocusNote}
          onChangeText={setHyperfocusNote}
          multiline
        />

        <Text style={styles.inputLabel}>What triggered it? (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Got curious about..."
          placeholderTextColor={colors.textMuted}
          value={hyperfocusTrigger}
          onChangeText={setHyperfocusTrigger}
        />

        <TouchableOpacity style={styles.logButton} onPress={logHyperfocus}>
          <LinearGradient colors={gradients.primary} style={styles.logButtonGradient}>
            <Text style={styles.logButtonText}>Log Hyperfocus Session</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Hyperfocus History */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Hyperfocus Log ({getHyperfocusCount()})</Text>
        {sessions.filter(s => s.wasHyperfocus).slice(0, 5).map(session => (
          <View key={session.id} style={styles.historyCard}>
            <Text style={styles.historyText}>{session.taskName}</Text>
            <Text style={styles.historyDate}>
              {new Date(session.startTime).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short'
              })}
            </Text>
          </View>
        ))}
        {getHyperfocusCount() === 0 && (
          <Text style={styles.emptyText}>No hyperfocus sessions logged yet</Text>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderTimeTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>⏰ Time Perception Trainer</Text>
        <Text style={styles.infoText}>
          ADHD brains often underestimate time by 1.8x.
          Track your estimates vs reality to improve time awareness.
        </Text>
      </View>

      {!trackingTask ? (
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>What task are you doing?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Reply to emails"
            placeholderTextColor={colors.textMuted}
            value={taskDescription}
            onChangeText={setTaskDescription}
          />

          <Text style={styles.inputLabel}>How long do you think it'll take? (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 15"
            placeholderTextColor={colors.textMuted}
            value={estimatedTime}
            onChangeText={setEstimatedTime}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.logButton} onPress={startTimeTracking}>
            <LinearGradient colors={gradients.primary} style={styles.logButtonGradient}>
              <Text style={styles.logButtonText}>Start Task Timer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.trackingSection}>
          <View style={styles.trackingCard}>
            <Text style={styles.trackingLabel}>TRACKING:</Text>
            <Text style={styles.trackingTask}>{taskDescription}</Text>
            <Text style={styles.trackingEstimate}>Estimated: {estimatedTime} min</Text>
            <Text style={styles.trackingLive}>
              ⏱️ {Math.round((new Date().getTime() - (taskStartTime?.getTime() || 0)) / 60000)} min elapsed
            </Text>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={stopTimeTracking}>
            <Text style={styles.doneButtonText}>✓ Task Done!</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Time Tracking History */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Time Tracking History</Text>
        {sessions.filter(s => s.estimatedMinutes !== undefined).slice(0, 5).map(session => {
          const diff = (session.actualMinutes || 0) - (session.estimatedMinutes || 0);
          return (
            <View key={session.id} style={styles.timeHistoryCard}>
              <Text style={styles.historyText}>{session.taskName}</Text>
              <View style={styles.timeComparison}>
                <Text style={styles.timeEst}>Est: {session.estimatedMinutes}m</Text>
                <Text style={styles.timeActual}>Actual: {session.actualMinutes}m</Text>
                <Text style={[
                  styles.timeDiff,
                  { color: diff > 0 ? colors.pink : colors.green }
                ]}>
                  {diff > 0 ? `+${diff}m` : `${diff}m`}
                </Text>
              </View>
            </View>
          );
        })}
        {sessions.filter(s => s.estimatedMinutes !== undefined).length === 0 && (
          <Text style={styles.emptyText}>No time tracking data yet</Text>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎯 FOCUSED A/F</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {[
            { id: 'timer' as TabType, label: 'Timer' },
            { id: 'hyperfocus' as TabType, label: 'Hyperfocus' },
            { id: 'time' as TabType, label: 'Time' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Tab Content */}
      {activeTab === 'timer' && renderTimerTab()}
      {activeTab === 'hyperfocus' && renderHyperfocusTab()}
      {activeTab === 'time' && renderTimeTab()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 0,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.text,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  tabTextActive: {
    color: colors.background,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.pink,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: colors.border,
  },
  timerInner: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 8,
    letterSpacing: 2,
  },
  controlsContainer: {
    marginBottom: 24,
  },
  startButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  activeControls: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: colors.warning,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  pauseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  resumeButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  resumeButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  resumeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  stopButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.cyan,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  logButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  trackingSection: {
    marginBottom: 24,
  },
  trackingCard: {
    backgroundColor: colors.pink + '20',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.pink,
  },
  trackingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.pink,
    marginBottom: 8,
    letterSpacing: 1,
  },
  trackingTask: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  trackingEstimate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  trackingLive: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  doneButton: {
    backgroundColor: colors.green,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  historySection: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  timeHistoryCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  timeComparison: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  timeEst: {
    fontSize: 12,
    color: colors.textMuted,
  },
  timeActual: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timeDiff: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default FocusTimerScreen;

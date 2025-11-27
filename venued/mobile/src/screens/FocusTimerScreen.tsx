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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme/colors';
import { getFocusSessions, saveFocusSession } from '../lib/storage';

interface FocusSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  taskName: string;
  completed: boolean;
}

interface NavigationProps {
  navigation: any;
}

const FocusTimerScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<string>('');

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
    const todaySessions = sessions.filter(s =>
      s.startTime.startsWith(today)
    );
    const totalSeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    return Math.floor(totalSeconds / 60);
  };

  const getSessionCount = () => sessions.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>✕ Close</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>🎯 Focus Timer</Text>
            <Text style={styles.headerSubtitle}>Deep Work Sessions</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getTodayMinutes()}</Text>
            <Text style={styles.statLabel}>Today's Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getSessionCount()}</Text>
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

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 ADHD Focus Tips</Text>
          <Text style={styles.tipText}>• Start with just 5 minutes - that's enough!</Text>
          <Text style={styles.tipText}>• Movement breaks are OK and helpful</Text>
          <Text style={styles.tipText}>• Pomodoro works: 25 min focus, 5 min break</Text>
          <Text style={styles.tipText}>• Track hyperfocus sessions to learn your patterns</Text>
        </View>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Sessions</Text>
            {sessions.slice(0, 5).map(session => {
              const date = new Date(session.startTime);
              return (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionLeft}>
                    <Text style={styles.sessionDuration}>{formatTime(session.duration)}</Text>
                    <Text style={styles.sessionDate}>
                      {date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.sessionBadge}>
                    <Text style={styles.sessionBadgeText}>✓</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 70,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.pink,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: colors.border,
  },
  timerInner: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 8,
    letterSpacing: 2,
  },
  controlsContainer: {
    marginBottom: 32,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 20,
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
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  pauseButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
  },
  resumeButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resumeButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  resumeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  stopButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  tipsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.cyan,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 6,
  },
  historyContainer: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionLeft: {
    flex: 1,
  },
  sessionDuration: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sessionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionBadgeText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FocusTimerScreen;

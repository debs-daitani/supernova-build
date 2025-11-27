import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme/colors';
import { getTimeTrackingData, saveTimeTrackingEntry } from '../lib/storage';

interface TimeTrackingEntry {
  id: string;
  taskName: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  accuracyPercentage?: number;
}

interface NavigationProps {
  navigation: any;
}

const TimeBlindnessScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [entries, setEntries] = useState<TimeTrackingEntry[]>([]);
  const [taskName, setTaskName] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [activeEntry, setActiveEntry] = useState<TimeTrackingEntry | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadEntries = async () => {
    const data = await getTimeTrackingData();
    setEntries(data);

    // Check if there's an active entry
    const active = data.find((e: TimeTrackingEntry) => e.isActive);
    if (active) {
      setActiveEntry(active);
      const startTime = new Date(active.startTime).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(elapsed);
      startTimer();
    }
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  };

  const handleStartTracking = async () => {
    if (!taskName.trim() || !estimatedMinutes) {
      Alert.alert('Missing Info', 'Please enter task name and estimated time');
      return;
    }

    const estimated = parseInt(estimatedMinutes);
    if (isNaN(estimated) || estimated <= 0) {
      Alert.alert('Invalid Time', 'Please enter a valid number of minutes');
      return;
    }

    const entry: TimeTrackingEntry = {
      id: `time-${Date.now()}`,
      taskName: taskName.trim(),
      estimatedMinutes: estimated,
      startTime: new Date().toISOString(),
      isActive: true,
    };

    await saveTimeTrackingEntry(entry);
    setActiveEntry(entry);
    setTaskName('');
    setEstimatedMinutes('');
    setElapsedSeconds(0);
    startTimer();
    await loadEntries();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleStopTracking = async () => {
    if (!activeEntry) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const actualMinutes = Math.ceil(elapsedSeconds / 60);
    const accuracyPercentage = Math.round((activeEntry.estimatedMinutes / actualMinutes) * 100);

    const updatedEntry: TimeTrackingEntry = {
      ...activeEntry,
      actualMinutes,
      endTime: new Date().toISOString(),
      isActive: false,
      accuracyPercentage,
    };

    // Update the entry in the list
    const updatedEntries = entries.map(e =>
      e.id === activeEntry.id ? updatedEntry : e
    );

    await saveTimeTrackingEntry(updatedEntry);
    setEntries(updatedEntries);
    setActiveEntry(null);
    setElapsedSeconds(0);
    await loadEntries();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const difference = actualMinutes - activeEntry.estimatedMinutes;
    const diffText = difference > 0
      ? `${difference} min longer`
      : `${Math.abs(difference)} min shorter`;

    Alert.alert(
      '⏰ Task Complete!',
      `Estimated: ${activeEntry.estimatedMinutes} min\nActual: ${actualMinutes} min\n${diffText} than expected`,
      [{ text: 'Got it!' }]
    );
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

  const getAverageAccuracy = () => {
    const completedEntries = entries.filter(e => !e.isActive && e.accuracyPercentage);
    if (completedEntries.length === 0) return 0;

    const sum = completedEntries.reduce((acc, e) => acc + (e.accuracyPercentage || 0), 0);
    return Math.round(sum / completedEntries.length);
  };

  const getAverageMultiplier = () => {
    const completedEntries = entries.filter(e => !e.isActive && e.actualMinutes);
    if (completedEntries.length === 0) return 1.0;

    const multipliers = completedEntries.map(e =>
      (e.actualMinutes || 0) / (e.estimatedMinutes || 1)
    );
    const sum = multipliers.reduce((acc, m) => acc + m, 0);
    return (sum / multipliers.length).toFixed(1);
  };

  const getAccuracyColor = (accuracy: number | undefined) => {
    if (!accuracy) return colors.textMuted;
    if (accuracy >= 80) return colors.success;
    if (accuracy >= 60) return colors.warning;
    return colors.error;
  };

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
            <Text style={styles.headerTitle}>⏰ Time Blindness Tracker</Text>
            <Text style={styles.headerSubtitle}>Estimates vs Reality</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getAverageAccuracy()}%</Text>
            <Text style={styles.statLabel}>Avg Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getAverageMultiplier()}x</Text>
            <Text style={styles.statLabel}>Time Multiplier</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{entries.filter(e => !e.isActive).length}</Text>
            <Text style={styles.statLabel}>Tasks Tracked</Text>
          </View>
        </View>

        {/* Active Tracking */}
        {activeEntry ? (
          <View style={styles.activeTrackingContainer}>
            <LinearGradient
              colors={['#9D4EDD', '#FF1B8D']}
              style={styles.activeTrackingCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.activeTaskName}>{activeEntry.taskName}</Text>
              <Text style={styles.activeEstimate}>
                Estimated: {activeEntry.estimatedMinutes} min
              </Text>

              <View style={styles.timerDisplay}>
                <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
                <Text style={styles.timerLabel}>ELAPSED</Text>
              </View>

              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStopTracking}
              >
                <Text style={styles.stopButtonText}>■ Stop Tracking</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          /* Start New Tracking */
          <View style={styles.startTrackingContainer}>
            <Text style={styles.sectionTitle}>Start New Task</Text>

            <TextInput
              style={styles.input}
              placeholder="Task name..."
              placeholderTextColor={colors.textMuted}
              value={taskName}
              onChangeText={setTaskName}
            />

            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>Estimated time:</Text>
              <TextInput
                style={styles.estimateInput}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={estimatedMinutes}
                onChangeText={setEstimatedMinutes}
                keyboardType="numeric"
              />
              <Text style={styles.estimateUnit}>minutes</Text>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartTracking}
            >
              <LinearGradient colors={gradients.primary} style={styles.startButtonGradient}>
                <Text style={styles.startButtonText}>▶ Start Tracking</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ADHD Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Time Blindness Tips</Text>
          <Text style={styles.tipText}>• ADHD brains typically underestimate by 1.8-2x</Text>
          <Text style={styles.tipText}>• Build in buffer time automatically</Text>
          <Text style={styles.tipText}>• Track patterns to learn YOUR multiplier</Text>
          <Text style={styles.tipText}>• Use your data to plan more realistically</Text>
        </View>

        {/* History */}
        {entries.filter(e => !e.isActive).length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Tasks</Text>
            {entries
              .filter(e => !e.isActive)
              .slice(0, 10)
              .map(entry => {
                const date = new Date(entry.startTime);
                const difference = (entry.actualMinutes || 0) - entry.estimatedMinutes;

                return (
                  <View key={entry.id} style={styles.historyCard}>
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyTaskName}>{entry.taskName}</Text>
                      <View style={styles.historyTimes}>
                        <Text style={styles.historyTime}>
                          Est: {entry.estimatedMinutes}m
                        </Text>
                        <Text style={styles.historyTime}>
                          Actual: {entry.actualMinutes}m
                        </Text>
                        <Text style={[
                          styles.historyDifference,
                          { color: difference > 0 ? colors.error : colors.success }
                        ]}>
                          {difference > 0 ? '+' : ''}{difference}m
                        </Text>
                      </View>
                      <Text style={styles.historyDate}>
                        {date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View style={[
                      styles.accuracyBadge,
                      { backgroundColor: getAccuracyColor(entry.accuracyPercentage) }
                    ]}>
                      <Text style={styles.accuracyText}>{entry.accuracyPercentage}%</Text>
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.pink,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activeTrackingContainer: {
    marginBottom: 24,
  },
  activeTrackingCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  activeTaskName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  activeEstimate: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.9,
    marginBottom: 24,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    opacity: 0.8,
    marginTop: 8,
    letterSpacing: 2,
  },
  stopButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  startTrackingContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  estimateLabel: {
    fontSize: 16,
    color: colors.text,
    marginRight: 12,
  },
  estimateInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    width: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  estimateUnit: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
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
    borderLeftColor: colors.warning,
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
  historyCard: {
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
  historyLeft: {
    flex: 1,
  },
  historyTaskName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  historyTimes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  historyDifference: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  accuracyBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  accuracyText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default TimeBlindnessScreen;

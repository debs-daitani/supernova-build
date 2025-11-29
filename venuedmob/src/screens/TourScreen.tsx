import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { CrewTask, DayWorkload } from '../types';
import { getCrewTasks } from '../lib/storage';

const TourScreen: React.FC = () => {
  const [tasks, setTasks] = useState<CrewTask[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await getCrewTasks();
    setTasks(data);
  };

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const getWorkloadForDate = (date: Date): DayWorkload => {
    const dateStr = date.toISOString().split('T')[0];
    const dayTasks = tasks.filter(t => t.scheduledDate === dateStr);
    const totalHours = dayTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

    const energyDistribution = {
      high: dayTasks.filter(t => t.energyLevel === 'high').length,
      medium: dayTasks.filter(t => t.energyLevel === 'medium').length,
      low: dayTasks.filter(t => t.energyLevel === 'low').length,
    };

    return {
      date: dateStr,
      tasks: dayTasks,
      totalHours: totalHours * 1.8, // ADHD time blindness multiplier
      energyDistribution,
      isOverloaded: totalHours > 6,
      isUnrealistic: totalHours > 10,
    };
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>📅 THE TOUR</Text>
        <Text style={styles.headerSubtitle}>Your Strategic Timeline</Text>
      </LinearGradient>

      {/* Week Navigator */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={previousWeek} style={styles.weekNavButton}>
          <Text style={styles.weekNavText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.weekLabel}>
          {formatWeekRange(currentWeekStart)}
        </Text>
        <TouchableOpacity onPress={nextWeek} style={styles.weekNavButton}>
          <Text style={styles.weekNavText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <ScrollView style={styles.timeline}>
        {weekDates.map((date, index) => {
          const workload = getWorkloadForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <View
              key={index}
              style={[
                styles.dayCard,
                isToday && styles.dayCardToday,
                workload.isOverloaded && styles.dayCardOverloaded,
                workload.isUnrealistic && styles.dayCardUnrealistic,
              ]}
            >
              <View style={styles.dayHeader}>
                <View>
                  <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                    {getDayName(date)}
                  </Text>
                  <Text style={styles.dayDate}>{formatDate(date)}</Text>
                </View>
                <View style={styles.dayStats}>
                  <Text style={styles.dayHours}>
                    {workload.totalHours.toFixed(1)}h
                  </Text>
                  <Text style={styles.dayTaskCount}>{workload.tasks.length} tasks</Text>
                </View>
              </View>

              {workload.tasks.length > 0 && (
                <>
                  {/* Energy Distribution */}
                  <View style={styles.energyBar}>
                    {workload.energyDistribution.high > 0 && (
                      <View
                        style={[
                          styles.energySegment,
                          {
                            flex: workload.energyDistribution.high,
                            backgroundColor: colors.energyHigh,
                          },
                        ]}
                      />
                    )}
                    {workload.energyDistribution.medium > 0 && (
                      <View
                        style={[
                          styles.energySegment,
                          {
                            flex: workload.energyDistribution.medium,
                            backgroundColor: colors.energyMedium,
                          },
                        ]}
                      />
                    )}
                    {workload.energyDistribution.low > 0 && (
                      <View
                        style={[
                          styles.energySegment,
                          {
                            flex: workload.energyDistribution.low,
                            backgroundColor: colors.energyLow,
                          },
                        ]}
                      />
                    )}
                  </View>

                  {/* Tasks */}
                  {workload.tasks.slice(0, 3).map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <Text style={styles.taskTitle} numberOfLines={1}>
                        {task.title}
                      </Text>
                      <Text style={styles.taskTime}>
                        {task.scheduledTime || ''}
                      </Text>
                    </View>
                  ))}

                  {workload.tasks.length > 3 && (
                    <Text style={styles.moreTasks}>
                      +{workload.tasks.length - 3} more
                    </Text>
                  )}
                </>
              )}

              {workload.isUnrealistic && (
                <View style={styles.warningBanner}>
                  <Text style={styles.warningText}>⚠️ Unrealistic workload!</Text>
                </View>
              )}

              {workload.isOverloaded && !workload.isUnrealistic && (
                <View style={styles.cautionBanner}>
                  <Text style={styles.cautionText}>⚡ High workload day</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* ADHD Reality Check */}
      <View style={styles.adhdNote}>
        <Text style={styles.adhdNoteText}>
          📊 Estimates include 1.8x ADHD time blindness multiplier
        </Text>
      </View>
    </SafeAreaView>
  );
};

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekNavButton: {
    padding: 8,
  },
  weekNavText: {
    fontSize: 24,
    color: colors.pink,
    fontWeight: '700',
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  timeline: {
    flex: 1,
    padding: 16,
  },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayCardToday: {
    borderColor: colors.pink,
    borderWidth: 2,
  },
  dayCardOverloaded: {
    borderColor: colors.warning,
  },
  dayCardUnrealistic: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  dayNameToday: {
    color: colors.pink,
  },
  dayDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dayStats: {
    alignItems: 'flex-end',
  },
  dayHours: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.pink,
  },
  dayTaskCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  energyBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  energySegment: {
    height: '100%',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  taskTitle: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  taskTime: {
    fontSize: 12,
    color: colors.cyan,
    fontWeight: '600',
  },
  moreTasks: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  warningBanner: {
    backgroundColor: colors.error,
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
  },
  cautionBanner: {
    backgroundColor: colors.warning,
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  cautionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
  },
  adhdNote: {
    backgroundColor: colors.card,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  adhdNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default TourScreen;

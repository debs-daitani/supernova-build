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
import { CrewTask, CrewStats } from '../types';
import { getCrewTasks, updateCrewTask } from '../lib/storage';

const CrewScreen: React.FC = () => {
  const [tasks, setTasks] = useState<CrewTask[]>([]);
  const [filter, setFilter] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [energyFilter, setEnergyFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await getCrewTasks();
    setTasks(data);
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateCrewTask(taskId, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : undefined,
      });
      await loadTasks();
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (energyFilter !== 'all' && task.energyLevel !== energyFilter) return false;

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (filter === 'today') return task.scheduledDate === today;
    if (filter === 'tomorrow') return task.scheduledDate === tomorrow;
    return true; // week shows all
  });

  const completedTasks = tasks.filter(t => t.completed);

  const stats: CrewStats = {
    todayCompleted: tasks.filter(t =>
      t.completed && t.scheduledDate === new Date().toISOString().split('T')[0]
    ).length,
    todayTotal: tasks.filter(t =>
      t.scheduledDate === new Date().toISOString().split('T')[0]
    ).length,
    focusMinutes: tasks.reduce((sum, t) => sum + t.timeSpent, 0),
    currentEnergy: 'medium',
    totalPoints: completedTasks.length * 10,
    level: Math.min(10, Math.floor(completedTasks.length / 5) + 1),
    tasksCompleted: completedTasks.length,
    currentStreak: 0,
    longestStreak: 0,
    tasksByRole: {
      roadie: 0,
      sound_engineer: 0,
      stage_manager: 0,
      lighting_tech: 0,
      tour_manager: 0,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>👥 THE CREW</Text>
        <Text style={styles.headerSubtitle}>Your Daily Task Squad</Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.todayCompleted}/{stats.todayTotal}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.focusMinutes}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.energyIndicator, { backgroundColor: getEnergyColor(stats.currentEnergy) }]} />
          <Text style={styles.statLabel}>Energy</Text>
        </View>
      </View>

      {/* Date Filter */}
      <View style={styles.filterContainer}>
        {(['today', 'tomorrow', 'week'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Energy Filter */}
      <View style={styles.energyFilterContainer}>
        {(['all', 'high', 'medium', 'low'] as const).map((e) => (
          <TouchableOpacity
            key={e}
            style={[
              styles.energyFilterTab,
              energyFilter === e && styles.energyFilterTabActive,
              e !== 'all' && { backgroundColor: getEnergyColor(e) },
            ]}
            onPress={() => setEnergyFilter(e)}
          >
            <Text style={[
              styles.energyFilterText,
              energyFilter === e && styles.energyFilterTextActive,
            ]}>
              {e.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks List */}
      <ScrollView style={styles.tasksList}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks scheduled</Text>
            <Text style={styles.emptySubtext}>Time to plan your setlist!</Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => toggleTaskComplete(task.id)}
            >
              <View style={styles.taskCheckbox}>
                {task.completed ? (
                  <View style={styles.taskCheckboxChecked}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.taskCheckboxUnchecked} />
                )}
              </View>

              <View style={styles.taskContent}>
                <View style={styles.taskHeader}>
                  <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                    {task.title}
                  </Text>
                  <View style={[styles.energyBadge, { backgroundColor: getEnergyColor(task.energyLevel) }]}>
                    <Text style={styles.energyText}>{task.energyLevel.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Text>

                <View style={styles.taskFooter}>
                  {task.scheduledTime && (
                    <Text style={styles.taskTime}>🕐 {task.scheduledTime}</Text>
                  )}
                  <Text style={styles.taskMeta}>⏱️ {task.estimatedHours}h</Text>
                  {task.isQuickWin && <Text style={styles.taskMeta}>⚡ Quick Win</Text>}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Focus Timer Button */}
      <TouchableOpacity style={styles.focusButton}>
        <LinearGradient colors={gradients.primary} style={styles.focusButtonGradient}>
          <Text style={styles.focusButtonText}>🎯 Start Focus Session</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const getEnergyColor = (level: string) => {
  switch (level) {
    case 'high': return colors.energyHigh;
    case 'medium': return colors.energyMedium;
    case 'low': return colors.energyLow;
    default: return colors.textMuted;
  }
};

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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.pink,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  energyIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.text,
  },
  energyFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  energyFilterTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  energyFilterTabActive: {
    opacity: 1,
  },
  energyFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.background,
  },
  energyFilterTextActive: {
    color: colors.text,
  },
  tasksList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCheckbox: {
    marginRight: 12,
  },
  taskCheckboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.pink,
  },
  taskCheckboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  energyBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  energyText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.background,
  },
  taskDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  taskTime: {
    fontSize: 11,
    color: colors.cyan,
    fontWeight: '600',
  },
  taskMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  focusButton: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  focusButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  focusButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});

export default CrewScreen;

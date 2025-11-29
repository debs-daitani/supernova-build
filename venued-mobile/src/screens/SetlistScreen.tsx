import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { Phase, Task } from '../types';
import AddPhaseModal from '../components/AddPhaseModal';
import AddTaskModal from '../components/AddTaskModal';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedCheckbox from '../components/AnimatedCheckbox';
import { getPhases, savePhases } from '../lib/storage';

// Default phases for new users
const DEFAULT_PHASES: Phase[] = [
  {
    id: 'phase-1',
    name: 'Planning',
    description: 'Define and plan the project',
    order: 0,
    tasks: [],
    color: colors.cyan,
  },
  {
    id: 'phase-2',
    name: 'Development',
    description: 'Build and create',
    order: 1,
    tasks: [],
    color: colors.green,
  },
  {
    id: 'phase-3',
    name: 'Launch',
    description: 'Go live and celebrate',
    order: 2,
    tasks: [],
    color: colors.pink,
  },
];

const SetlistScreen: React.FC = () => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load phases on mount
  useEffect(() => {
    loadPhases();
  }, []);

  const loadPhases = async () => {
    try {
      setIsLoading(true);
      const data = await getPhases();

      // Validate and clean the data
      if (!Array.isArray(data) || data.length === 0) {
        // No data - use defaults
        await savePhases(DEFAULT_PHASES);
        setPhases(DEFAULT_PHASES);
      } else {
        // Validate each phase
        const validPhases = data
          .filter((phase): phase is Phase =>
            phase !== null &&
            typeof phase === 'object' &&
            typeof phase.id === 'string' &&
            typeof phase.name === 'string'
          )
          .map(phase => ({
            ...phase,
            tasks: Array.isArray(phase.tasks)
              ? phase.tasks.filter((t): t is Task => t !== null && typeof t === 'object' && typeof t.id === 'string')
              : [],
            color: phase.color || colors.pink,
            description: phase.description || '',
            order: typeof phase.order === 'number' ? phase.order : 0,
          }));

        if (validPhases.length === 0) {
          await savePhases(DEFAULT_PHASES);
          setPhases(DEFAULT_PHASES);
        } else {
          setPhases(validPhases);
        }
      }
    } catch (error) {
      console.error('Error loading phases:', error);
      setPhases(DEFAULT_PHASES);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new task to a phase
  const handleAddTask = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setEditingTask(null);
    setShowTaskModal(true);
  };

  // Save a new task
  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'phaseId' | 'order' | 'createdAt' | 'completed'>) => {
    if (!selectedPhaseId) return;

    const phase = phases.find(p => p.id === selectedPhaseId);
    if (!phase) return;

    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      phaseId: selectedPhaseId,
      order: phase.tasks.length,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedPhases = phases.map(p =>
      p.id === selectedPhaseId
        ? { ...p, tasks: [...p.tasks, newTask] }
        : p
    );

    await savePhases(updatedPhases);
    setPhases(updatedPhases);
    setShowTaskModal(false);
    setSelectedPhaseId(null);
  };

  // Toggle task completion
  const handleToggleTask = async (phaseId: string, taskId: string) => {
    const updatedPhases = phases.map(phase => {
      if (phase.id !== phaseId) return phase;

      return {
        ...phase,
        tasks: phase.tasks.map(task =>
          task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    });

    await savePhases(updatedPhases);
    setPhases(updatedPhases);
  };

  // Delete a task
  const handleDeleteTask = (phaseId: string, taskId: string, taskTitle: string) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${taskTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedPhases = phases.map(phase => {
              if (phase.id !== phaseId) return phase;
              return {
                ...phase,
                tasks: phase.tasks.filter(t => t.id !== taskId),
              };
            });
            await savePhases(updatedPhases);
            setPhases(updatedPhases);
          },
        },
      ]
    );
  };

  // Save a new phase
  const handleSavePhase = async (phaseData: Omit<Phase, 'id' | 'order' | 'tasks'>) => {
    const newPhase: Phase = {
      ...phaseData,
      id: `phase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: phases.length,
      tasks: [],
    };

    const updatedPhases = [...phases, newPhase];
    await savePhases(updatedPhases);
    setPhases(updatedPhases);
    setShowPhaseModal(false);
  };

  // Delete a phase
  const handleDeletePhase = (phaseId: string, phaseName: string) => {
    const phase = phases.find(p => p.id === phaseId);
    const taskCount = phase?.tasks.length || 0;

    Alert.alert(
      'Delete Phase',
      `Are you sure you want to delete "${phaseName}"?${taskCount > 0 ? ` This will also delete ${taskCount} task${taskCount > 1 ? 's' : ''}.` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedPhases = phases.filter(p => p.id !== phaseId);
            await savePhases(updatedPhases);
            setPhases(updatedPhases);
          },
        },
      ]
    );
  };

  // Get energy level color
  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'high': return colors.energyHigh;
      case 'medium': return colors.energyMedium;
      case 'low': return colors.energyLow;
      default: return colors.textMuted;
    }
  };

  // Calculate stats
  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = phases.reduce(
    (sum, p) => sum + p.tasks.filter(t => t.completed).length,
    0
  );
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.pink} />
          <Text style={styles.loadingText}>Loading your setlist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>📋 THE SETLIST</Text>
        <Text style={styles.headerSubtitle}>Build Your Project Like a Tour</Text>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Tour Progress</Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressStats}>
          {completedTasks} of {totalTasks} tasks completed
        </Text>
      </View>

      {/* Phases */}
      <ScrollView style={styles.phasesContainer} showsVerticalScrollIndicator={false}>
        {phases.map((phase) => (
          <View key={phase.id} style={styles.phaseCard}>
            {/* Phase Header */}
            <AnimatedButton
              style={styles.phaseHeader}
              onLongPress={() => handleDeletePhase(phase.id, phase.name)}
              scaleValue={0.98}
            >
              <View style={[styles.phaseColorBar, { backgroundColor: phase.color }]} />
              <View style={styles.phaseHeaderContent}>
                <Text style={styles.phaseName}>{phase.name}</Text>
                {phase.description ? (
                  <Text style={styles.phaseDescription}>{phase.description}</Text>
                ) : null}
              </View>
              <View style={styles.phaseStats}>
                <Text style={styles.phaseTaskCount}>
                  {phase.tasks.filter(t => t.completed).length}/{phase.tasks.length}
                </Text>
              </View>
            </AnimatedButton>

            {/* Tasks */}
            {phase.tasks.length > 0 ? (
              phase.tasks.map((task) => (
                <AnimatedButton
                  key={task.id}
                  style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
                  onPress={() => handleToggleTask(phase.id, task.id)}
                  onLongPress={() => handleDeleteTask(phase.id, task.id, task.title)}
                  scaleValue={0.97}
                >
                  {/* Animated Checkbox */}
                  <View style={styles.checkboxContainer}>
                    <AnimatedCheckbox checked={task.completed} size={24} color={colors.pink} />
                  </View>

                  {/* Task Content */}
                  <View style={styles.taskContent}>
                    <View style={styles.taskTitleRow}>
                      <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                        {task.title}
                      </Text>
                      <View style={[styles.energyBadge, { backgroundColor: getEnergyColor(task.energyLevel) }]}>
                        <Text style={styles.energyText}>{task.energyLevel.toUpperCase()}</Text>
                      </View>
                    </View>

                    {task.description ? (
                      <Text style={styles.taskDescription} numberOfLines={2}>
                        {task.description}
                      </Text>
                    ) : null}

                    <View style={styles.taskMeta}>
                      <Text style={styles.taskMetaText}>⏱️ {task.estimatedHours}h</Text>
                      {task.isHyperfocus && <Text style={styles.taskMetaText}>🎯 Hyperfocus</Text>}
                      {task.isQuickWin && <Text style={styles.taskMetaText}>⚡ Quick Win</Text>}
                    </View>
                  </View>
                </AnimatedButton>
              ))
            ) : (
              <View style={styles.emptyTasks}>
                <Text style={styles.emptyTasksText}>No tasks yet. Add your first one!</Text>
              </View>
            )}

            {/* Add Task Button */}
            <AnimatedButton
              style={styles.addTaskButton}
              onPress={() => handleAddTask(phase.id)}
              scaleValue={0.96}
            >
              <Text style={styles.addTaskText}>+ Add Task</Text>
            </AnimatedButton>
          </View>
        ))}

        {/* Add Phase Button */}
        <AnimatedButton
          style={styles.addPhaseButton}
          onPress={() => setShowPhaseModal(true)}
          scaleValue={0.97}
        >
          <LinearGradient colors={gradients.primary} style={styles.addPhaseGradient}>
            <Text style={styles.addPhaseText}>+ Add New Phase</Text>
          </LinearGradient>
        </AnimatedButton>

        {/* ADHD Reality Check */}
        <View style={styles.realityCheck}>
          <Text style={styles.realityEmoji}>⚠️</Text>
          <View style={styles.realityContent}>
            <Text style={styles.realityTitle}>ADHD Reality Check</Text>
            <Text style={styles.realitySubtext}>
              Remember to add buffer time - we're usually 1.8x optimistic!
            </Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <AddPhaseModal
        visible={showPhaseModal}
        onClose={() => setShowPhaseModal(false)}
        onSave={handleSavePhase}
      />

      <AddTaskModal
        visible={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedPhaseId(null);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask || undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 12,
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
  progressSection: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.pink,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 4,
  },
  progressStats: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  phasesContainer: {
    flex: 1,
    padding: 16,
  },
  phaseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  phaseColorBar: {
    width: 4,
    height: 44,
    borderRadius: 2,
    marginRight: 12,
  },
  phaseHeaderContent: {
    flex: 1,
  },
  phaseName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  phaseDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  phaseStats: {
    alignItems: 'flex-end',
  },
  phaseTaskCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.pink,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: colors.card,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  energyBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
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
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taskMetaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyTasks: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTasksText: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  addTaskButton: {
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addTaskText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.pink,
  },
  addPhaseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  addPhaseGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  addPhaseText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  realityCheck: {
    flexDirection: 'row',
    backgroundColor: colors.warning,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  realityEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  realityContent: {
    flex: 1,
  },
  realityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 2,
  },
  realitySubtext: {
    fontSize: 12,
    color: colors.background,
    opacity: 0.9,
  },
});

export default SetlistScreen;

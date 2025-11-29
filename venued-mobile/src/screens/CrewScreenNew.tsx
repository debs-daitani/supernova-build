import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme/colors';
import { Phase, Task, CrewTask, CrewStats } from '../types';
import AddPhaseModal from '../components/AddPhaseModal';
import AddTaskModal from '../components/AddTaskModal';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedCheckbox from '../components/AnimatedCheckbox';
import ConfettiCelebration from '../components/ConfettiCelebration';
import {
  getPhases,
  savePhases,
  getCrewTasks,
  updateCrewTask,
  getCrewStats,
  saveCrewStats,
  FuckItDoItTask,
  getFuckItDoItTasks,
  createFuckItDoItTask,
  completeFuckItDoItTask,
  expireFuckItDoItTask,
  getActiveFuckItDoItTask,
} from '../lib/storage';
import { calculateTaskPoints, getLevelFromPoints } from '../lib/crew';

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

const CrewScreenNew: React.FC = () => {
  // Daily Tasks State
  const [dailyTasks, setDailyTasks] = useState<CrewTask[]>([]);
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [energyFilter, setEnergyFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [crewStats, setCrewStats] = useState<CrewStats | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Project Planner State
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // FUCK IT DO IT State
  const [activeChallenge, setActiveChallenge] = useState<FuckItDoItTask | null>(null);
  const [challengeHistory, setChallengeHistory] = useState<FuckItDoItTask[]>([]);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [expiredNotes, setExpiredNotes] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isNearExpiry, setIsNearExpiry] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Countdown timer for FUCK IT DO IT
  useEffect(() => {
    if (!activeChallenge || activeChallenge.completed || activeChallenge.expired) return;

    const updateTimer = () => {
      const now = new Date();
      const deadline = new Date(activeChallenge.deadline);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        // Task expired - show expired modal
        setShowExpiredModal(true);
        return;
      }

      // Check if within 5 minutes
      const fiveMinutes = 5 * 60 * 1000;
      setIsNearExpiry(diff <= fiveMinutes);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeChallenge]);

  // Pulse animation for near-expiry warning
  useEffect(() => {
    if (isNearExpiry) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isNearExpiry]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadDailyTasks(),
        loadPhases(),
        loadStats(),
        loadChallenges(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDailyTasks = async () => {
    const data = await getCrewTasks();
    setDailyTasks(data);
  };

  const loadStats = async () => {
    const stats = await getCrewStats();
    setCrewStats(stats);
  };

  const loadChallenges = async () => {
    const allTasks = await getFuckItDoItTasks();
    const active = await getActiveFuckItDoItTask();
    setActiveChallenge(active);
    // History = completed or expired challenges (not the active one)
    const history = allTasks.filter(t => t.completed || t.expired);
    setChallengeHistory(history);
  };

  const loadPhases = async () => {
    try {
      const data = await getPhases();

      if (!Array.isArray(data) || data.length === 0) {
        await savePhases(DEFAULT_PHASES);
        setPhases(DEFAULT_PHASES);
        setSelectedPhaseId(DEFAULT_PHASES[0].id);
      } else {
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
          setSelectedPhaseId(DEFAULT_PHASES[0].id);
        } else {
          setPhases(validPhases);
          setSelectedPhaseId(validPhases[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading phases:', error);
      setPhases(DEFAULT_PHASES);
      setSelectedPhaseId(DEFAULT_PHASES[0].id);
    }
  };

  // Daily Tasks Functions
  const toggleDailyTaskComplete = async (taskId: string) => {
    if (!taskId) return;
    const task = dailyTasks.find(t => t?.id === taskId);
    if (task && crewStats) {
      const isCompleting = !task.completed;

      if (isCompleting) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

        const points = calculateTaskPoints({
          isQuickWin: task.isQuickWin || false,
          isHyperfocus: task.isHyperfocus || false,
          difficulty: task.difficulty || 'medium',
        });

        const newTotalPoints = crewStats.totalPoints + points;
        const newLevel = getLevelFromPoints(newTotalPoints);

        const updatedStats: CrewStats = {
          ...crewStats,
          totalPoints: newTotalPoints,
          level: newLevel,
          tasksCompleted: crewStats.tasksCompleted + 1,
        };

        await saveCrewStats(updatedStats);
        setCrewStats(updatedStats);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const points = calculateTaskPoints({
          isQuickWin: task.isQuickWin || false,
          isHyperfocus: task.isHyperfocus || false,
          difficulty: task.difficulty || 'medium',
        });

        const newTotalPoints = Math.max(0, crewStats.totalPoints - points);
        const newLevel = getLevelFromPoints(newTotalPoints);

        const updatedStats: CrewStats = {
          ...crewStats,
          totalPoints: newTotalPoints,
          level: newLevel,
          tasksCompleted: Math.max(0, crewStats.tasksCompleted - 1),
        };

        await saveCrewStats(updatedStats);
        setCrewStats(updatedStats);
      }

      await updateCrewTask(taskId, {
        completed: isCompleting,
        completedAt: isCompleting ? new Date().toISOString() : undefined,
      });
      await loadDailyTasks();
    }
  };

  const filteredDailyTasks = dailyTasks.filter(task => {
    if (energyFilter !== 'all' && task.energyLevel !== energyFilter) return false;

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (dateFilter === 'today') return task.scheduledDate === today;
    if (dateFilter === 'tomorrow') return task.scheduledDate === tomorrow;
    return true;
  });

  // Project Planner Functions
  const selectedPhase = phases.find(p => p.id === selectedPhaseId);

  const handleAddTask = () => {
    if (!selectedPhaseId) return;
    setEditingTask(null);
    setShowTaskModal(true);
  };

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
  };

  const handleToggleProjectTask = async (taskId: string) => {
    if (!selectedPhaseId) return;

    const updatedPhases = phases.map(phase => {
      if (phase.id !== selectedPhaseId) return phase;

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDeleteProjectTask = (taskId: string, taskTitle: string) => {
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
              if (phase.id !== selectedPhaseId) return phase;
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

  // FUCK IT DO IT Functions
  const handleCreateChallenge = async () => {
    if (!challengeTitle.trim()) {
      Alert.alert('Hold up!', 'You need to give this challenge a name!');
      return;
    }

    const newChallenge = await createFuckItDoItTask(challengeTitle.trim(), challengeDescription.trim());
    setActiveChallenge(newChallenge);
    setShowCreateChallengeModal(false);
    setChallengeTitle('');
    setChallengeDescription('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCompleteChallenge = async () => {
    if (!activeChallenge) return;

    await completeFuckItDoItTask(activeChallenge.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    Alert.alert(
      '🎸 HELL YEAH!',
      'You crushed it! That\'s what happens when you commit and follow through.',
      [{ text: 'Rock on! 🤘', onPress: () => loadChallenges() }]
    );
  };

  const handleExpiredSave = async () => {
    if (!activeChallenge) return;

    await expireFuckItDoItTask(activeChallenge.id, expiredNotes.trim());
    setShowExpiredModal(false);
    setExpiredNotes('');
    loadChallenges();
  };

  const handleExpiredDelete = async () => {
    if (!activeChallenge) return;

    Alert.alert(
      'Delete Challenge',
      'Are you sure? The lessons we learn from not hitting targets are valuable.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { deleteFuckItDoItTask } = await import('../lib/storage');
            await deleteFuckItDoItTask(activeChallenge.id);
            setShowExpiredModal(false);
            setExpiredNotes('');
            loadChallenges();
          },
        },
      ]
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Helper functions
  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'high': return colors.energyHigh;
      case 'medium': return colors.energyMedium;
      case 'low': return colors.energyLow;
      default: return colors.textMuted;
    }
  };

  const todayCompleted = dailyTasks.filter(t =>
    t?.completed && t?.scheduledDate === new Date().toISOString().split('T')[0]
  ).length;
  const todayTotal = dailyTasks.filter(t =>
    t?.scheduledDate === new Date().toISOString().split('T')[0]
  ).length;

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.pink} />
          <Text style={styles.loadingText}>Loading your command centre...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>👥 THE CREW</Text>
        <Text style={styles.headerSubtitle}>Your Task Command Centre</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* ==================== SECTION 1: DAILY TASKS ==================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 DAILY TASKS</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>{todayCompleted}/{todayTotal} done</Text>
              <Text style={styles.statDivider}>•</Text>
              <Text style={styles.statText}>Lv {crewStats?.level || 1}</Text>
              <Text style={styles.statDivider}>•</Text>
              <Text style={styles.statText}>{crewStats?.totalPoints || 0} pts</Text>
            </View>
          </View>

          {/* Date Filter */}
          <View style={styles.filterRow}>
            {(['today', 'tomorrow', 'week'] as const).map((f) => (
              <AnimatedButton
                key={f}
                style={[styles.filterTab, dateFilter === f && styles.filterTabActive]}
                onPress={() => setDateFilter(f)}
                scaleValue={0.95}
              >
                <Text style={[styles.filterText, dateFilter === f && styles.filterTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </AnimatedButton>
            ))}
          </View>

          {/* Energy Filter */}
          <View style={styles.energyFilterRow}>
            {(['all', 'high', 'medium', 'low'] as const).map((e) => (
              <AnimatedButton
                key={e}
                style={[
                  styles.energyTab,
                  energyFilter === e && styles.energyTabActive,
                  e !== 'all' && { backgroundColor: getEnergyColor(e) },
                ]}
                onPress={() => setEnergyFilter(e)}
                scaleValue={0.95}
              >
                <Text style={styles.energyTabText}>{e.toUpperCase()}</Text>
              </AnimatedButton>
            ))}
          </View>

          {/* Daily Tasks List */}
          {filteredDailyTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tasks scheduled</Text>
              <Text style={styles.emptySubtext}>Add tasks from your project phases!</Text>
            </View>
          ) : (
            filteredDailyTasks.map((task) => (
              <AnimatedButton
                key={task.id}
                style={styles.dailyTaskCard}
                onPress={() => toggleDailyTaskComplete(task.id)}
                scaleValue={0.98}
              >
                <View style={styles.checkboxContainer}>
                  <AnimatedCheckbox checked={task.completed} size={22} color={colors.pink} />
                </View>
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text style={styles.taskDescription} numberOfLines={1}>
                      {task.description}
                    </Text>
                  )}
                </View>
                <View style={[styles.energyDot, { backgroundColor: getEnergyColor(task.energyLevel) }]} />
              </AnimatedButton>
            ))
          )}
        </View>

        {/* ==================== SECTION 2: PROJECT PLANNER ==================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 PROJECT PLANNER</Text>
          </View>

          {/* Phase Dropdown */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.phaseSelector}>
            {phases.map((phase) => (
              <AnimatedButton
                key={phase.id}
                style={[
                  styles.phaseTab,
                  selectedPhaseId === phase.id && styles.phaseTabActive,
                  { borderColor: phase.color },
                ]}
                onPress={() => setSelectedPhaseId(phase.id)}
                scaleValue={0.95}
              >
                <View style={[styles.phaseColorDot, { backgroundColor: phase.color }]} />
                <Text style={[
                  styles.phaseTabText,
                  selectedPhaseId === phase.id && styles.phaseTabTextActive,
                ]}>
                  {phase.name}
                </Text>
                <Text style={styles.phaseTaskCount}>
                  {phase.tasks.filter(t => t.completed).length}/{phase.tasks.length}
                </Text>
              </AnimatedButton>
            ))}
          </ScrollView>

          {/* Selected Phase Tasks */}
          {selectedPhase && (
            <View style={styles.phaseContent}>
              {selectedPhase.tasks.length === 0 ? (
                <View style={styles.emptyPhase}>
                  <Text style={styles.emptyPhaseText}>No tasks in {selectedPhase.name}</Text>
                </View>
              ) : (
                selectedPhase.tasks.map((task) => (
                  <AnimatedButton
                    key={task.id}
                    style={[styles.projectTaskCard, task.completed && styles.projectTaskCompleted]}
                    onPress={() => handleToggleProjectTask(task.id)}
                    onLongPress={() => handleDeleteProjectTask(task.id, task.title)}
                    scaleValue={0.98}
                  >
                    <View style={styles.checkboxContainer}>
                      <AnimatedCheckbox checked={task.completed} size={20} color={selectedPhase.color} />
                    </View>
                    <View style={styles.taskContent}>
                      <Text style={[styles.projectTaskTitle, task.completed && styles.taskTitleCompleted]}>
                        {task.title}
                      </Text>
                      <View style={styles.taskMeta}>
                        <Text style={styles.taskMetaText}>⏱️ {task.estimatedHours}h</Text>
                        {task.isHyperfocus && <Text style={styles.taskMetaText}>🎯 Focus</Text>}
                        {task.isQuickWin && <Text style={styles.taskMetaText}>⚡ Quick</Text>}
                      </View>
                    </View>
                    <View style={[styles.energyBadge, { backgroundColor: getEnergyColor(task.energyLevel) }]}>
                      <Text style={styles.energyBadgeText}>{task.energyLevel.charAt(0).toUpperCase()}</Text>
                    </View>
                  </AnimatedButton>
                ))
              )}

              {/* Add Task Button */}
              <AnimatedButton
                style={styles.addTaskButton}
                onPress={handleAddTask}
                scaleValue={0.96}
              >
                <Text style={[styles.addTaskText, { color: selectedPhase.color }]}>+ Add Task</Text>
              </AnimatedButton>
            </View>
          )}
        </View>

        {/* ==================== SECTION 3: FUCK IT DO IT ==================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 FUCK IT, DO IT</Text>
            <Text style={styles.sectionSubtitle}>48-hour commitment challenge</Text>
          </View>

          {activeChallenge && !activeChallenge.completed && !activeChallenge.expired ? (
            <Animated.View style={[
              styles.activeChallengeCard,
              isNearExpiry && { transform: [{ scale: pulseAnim }] },
            ]}>
              <LinearGradient
                colors={isNearExpiry ? ['#FF4444', '#CC0000'] : gradients.primary}
                style={styles.challengeGradient}
              >
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeTitle}>{activeChallenge.title}</Text>
                  {isNearExpiry && <Text style={styles.warningBadge}>⚠️ ALMOST UP!</Text>}
                </View>
                {activeChallenge.description && (
                  <Text style={styles.challengeDescription}>{activeChallenge.description}</Text>
                )}
                <View style={styles.timerContainer}>
                  <Text style={styles.timerLabel}>TIME REMAINING</Text>
                  <Text style={[styles.timerValue, isNearExpiry && styles.timerWarning]}>
                    {timeRemaining}
                  </Text>
                </View>
                <AnimatedButton
                  style={styles.completeChallengeButton}
                  onPress={handleCompleteChallenge}
                  scaleValue={0.95}
                >
                  <Text style={styles.completeChallengeText}>✓ I DID IT!</Text>
                </AnimatedButton>
              </LinearGradient>
            </Animated.View>
          ) : (
            <AnimatedButton
              style={styles.startChallengeButton}
              onPress={() => setShowCreateChallengeModal(true)}
              scaleValue={0.95}
            >
              <LinearGradient colors={gradients.primary} style={styles.startChallengeGradient}>
                <Text style={styles.startChallengeEmoji}>🎸</Text>
                <Text style={styles.startChallengeTitle}>FUCK IT, DO IT</Text>
                <Text style={styles.startChallengeSubtitle}>
                  48 hours. No excuses. Just action.
                </Text>
              </LinearGradient>
            </AnimatedButton>
          )}

          {/* Challenge History */}
          {challengeHistory.length > 0 && (
            <View style={styles.historySection}>
              <AnimatedButton
                style={styles.historyToggle}
                onPress={() => setShowHistory(!showHistory)}
                scaleValue={0.98}
              >
                <Text style={styles.historyToggleText}>
                  📜 Challenge History ({challengeHistory.length})
                </Text>
                <Text style={styles.historyToggleArrow}>{showHistory ? '▲' : '▼'}</Text>
              </AnimatedButton>

              {showHistory && (
                <View style={styles.historyList}>
                  {challengeHistory.map((challenge) => (
                    <View
                      key={challenge.id}
                      style={[
                        styles.historyCard,
                        challenge.completed ? styles.historyCardCompleted : styles.historyCardExpired,
                      ]}
                    >
                      <View style={styles.historyCardHeader}>
                        <Text style={styles.historyCardStatus}>
                          {challenge.completed ? '✅ CRUSHED IT' : '⏰ MISSED'}
                        </Text>
                        <Text style={styles.historyCardDate}>
                          {formatDate(challenge.completedAt || challenge.deadline)}
                        </Text>
                      </View>
                      <Text style={styles.historyCardTitle}>{challenge.title}</Text>
                      {challenge.description && (
                        <Text style={styles.historyCardDescription}>{challenge.description}</Text>
                      )}
                      {challenge.notes && (
                        <View style={styles.historyCardNotes}>
                          <Text style={styles.historyCardNotesLabel}>Reflection:</Text>
                          <Text style={styles.historyCardNotesText}>{challenge.notes}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ==================== MODALS ==================== */}

      {/* Add Task Modal */}
      <AddTaskModal
        visible={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask || undefined}
      />

      {/* Add Phase Modal */}
      <AddPhaseModal
        visible={showPhaseModal}
        onClose={() => setShowPhaseModal(false)}
        onSave={async (phaseData) => {
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
        }}
      />

      {/* Create Challenge Modal */}
      <Modal
        visible={showCreateChallengeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateChallengeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔥 NEW CHALLENGE</Text>
            <Text style={styles.modalSubtitle}>
              48 hours to crush this. No backing out.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="What are you committing to?"
              placeholderTextColor={colors.textMuted}
              value={challengeTitle}
              onChangeText={setChallengeTitle}
            />

            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Why does this matter? (optional)"
              placeholderTextColor={colors.textMuted}
              value={challengeDescription}
              onChangeText={setChallengeDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowCreateChallengeModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleCreateChallenge}
                activeOpacity={0.7}
              >
                <LinearGradient colors={gradients.primary} style={styles.modalButtonGradient}>
                  <Text style={styles.modalButtonPrimaryText}>LET'S GO! 🚀</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Expired Challenge Modal */}
      <Modal
        visible={showExpiredModal}
        transparent
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⏰ TIME'S UP</Text>
            <Text style={styles.expiredReframe}>
              Hey, not hitting the target doesn't mean failure. It means you learned something.
              What got in the way? What would you do differently?
            </Text>

            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="What happened? What did you learn?"
              placeholderTextColor={colors.textMuted}
              value={expiredNotes}
              onChangeText={setExpiredNotes}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={handleExpiredDelete}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonSecondaryText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleExpiredSave}
                activeOpacity={0.7}
              >
                <LinearGradient colors={gradients.primary} style={styles.modalButtonGradient}>
                  <Text style={styles.modalButtonPrimaryText}>Save & Learn</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confetti */}
      <ConfettiCelebration active={showConfetti} onComplete={() => setShowConfetti(false)} />
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
  scrollContainer: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.pink,
    fontWeight: '600',
  },
  statDivider: {
    color: colors.textMuted,
    marginHorizontal: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.text,
  },
  energyFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  energyTab: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  energyTabActive: {
    opacity: 1,
  },
  energyTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
  },
  dailyTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  taskDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  energyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  phaseSelector: {
    marginBottom: 12,
  },
  phaseTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
  },
  phaseTabActive: {
    backgroundColor: colors.background,
  },
  phaseColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  phaseTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 6,
  },
  phaseTabTextActive: {
    color: colors.text,
  },
  phaseTaskCount: {
    fontSize: 11,
    color: colors.textMuted,
  },
  phaseContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyPhase: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyPhaseText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  projectTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projectTaskCompleted: {
    opacity: 0.6,
  },
  projectTaskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  taskMetaText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  energyBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  energyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
  },
  addTaskButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  addTaskText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeChallengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  warningBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.9,
    marginBottom: 16,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.8,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerWarning: {
    color: '#FFFFFF',
  },
  completeChallengeButton: {
    backgroundColor: colors.text,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeChallengeText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
  },
  startChallengeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startChallengeGradient: {
    padding: 24,
    alignItems: 'center',
  },
  startChallengeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  startChallengeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  startChallengeSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  expiredReframe: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonPrimary: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  // Challenge History Styles
  historySection: {
    marginTop: 16,
  },
  historyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  historyToggleArrow: {
    fontSize: 12,
    color: colors.textMuted,
  },
  historyList: {
    marginTop: 10,
  },
  historyCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  historyCardCompleted: {
    borderLeftColor: colors.green,
  },
  historyCardExpired: {
    borderLeftColor: colors.pink,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyCardStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  historyCardDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  historyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  historyCardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  historyCardNotes: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  historyCardNotesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.pink,
    marginBottom: 4,
  },
  historyCardNotesText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default CrewScreenNew;

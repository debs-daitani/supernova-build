import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { Phase, Task } from '../types';

const SetlistScreen: React.FC = () => {
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: '1',
      name: 'Planning',
      description: 'Define and plan the project',
      order: 0,
      tasks: [],
      color: colors.cyan,
    },
    {
      id: '2',
      name: 'Development',
      description: 'Build and create',
      order: 1,
      tasks: [
        {
          id: 't1',
          title: 'Set up project structure',
          description: 'Initialize repository and basic setup',
          phaseId: '2',
          energyLevel: 'high',
          estimatedHours: 2,
          difficulty: 'medium',
          isHyperfocus: true,
          isQuickWin: false,
          dependencies: [],
          completed: false,
          order: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      color: colors.green,
    },
    {
      id: '3',
      name: 'Launch',
      description: 'Go live and celebrate',
      order: 2,
      tasks: [],
      color: colors.pink,
    },
  ]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const addTask = (phaseId: string) => {
    setSelectedPhase(phaseId);
    setShowTaskModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>⭐ THE SETLIST</Text>
        <Text style={styles.headerSubtitle}>Build Your Project Like a Tour</Text>
      </LinearGradient>

      {/* Project Info */}
      <View style={styles.projectInfo}>
        <Text style={styles.projectName}>New Project</Text>
        <Text style={styles.projectGoal}>Plan your tour and create your setlist</Text>
      </View>

      {/* Phases */}
      <ScrollView style={styles.phasesContainer}>
        {phases.map((phase) => (
          <View key={phase.id} style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <View style={[styles.phaseColorBar, { backgroundColor: phase.color }]} />
              <View style={styles.phaseHeaderContent}>
                <Text style={styles.phaseName}>{phase.name}</Text>
                <Text style={styles.phaseDescription}>{phase.description}</Text>
              </View>
              <Text style={styles.phaseTaskCount}>{phase.tasks.length}</Text>
            </View>

            {/* Tasks */}
            {phase.tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={[styles.energyBadge, { backgroundColor: getEnergyColor(task.energyLevel) }]}>
                    <Text style={styles.energyText}>{task.energyLevel.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Text>
                <View style={styles.taskFooter}>
                  <Text style={styles.taskMeta}>⏱️ {task.estimatedHours}h</Text>
                  <Text style={styles.taskMeta}>
                    {task.isHyperfocus ? '🎯 Hyperfocus' : task.isQuickWin ? '⚡ Quick Win' : ''}
                  </Text>
                </View>
              </View>
            ))}

            {/* Add Task Button */}
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => addTask(phase.id)}
            >
              <Text style={styles.addTaskText}>+ Add Task</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* ADHD Reality Check */}
      <View style={styles.realityCheck}>
        <Text style={styles.realityText}>⚠️ ADHD Reality Check</Text>
        <Text style={styles.realitySubtext}>
          Remember to add buffer time - we're usually 1.8x optimistic!
        </Text>
      </View>
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
  projectInfo: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  projectGoal: {
    fontSize: 14,
    color: colors.textSecondary,
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
    height: 40,
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
  phaseTaskCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.pink,
  },
  taskCard: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
  taskMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  addTaskButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addTaskText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.pink,
  },
  realityCheck: {
    backgroundColor: colors.warning,
    padding: 12,
    alignItems: 'center',
  },
  realityText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 4,
  },
  realitySubtext: {
    fontSize: 12,
    color: colors.background,
    opacity: 0.8,
  },
});

export default SetlistScreen;

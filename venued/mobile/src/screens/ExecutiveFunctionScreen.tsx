import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme/colors';
import { getExecutiveFunctionTasks, saveExecutiveFunctionTasks } from '../lib/storage';

interface MicroStep {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

interface ExecutiveTask {
  id: string;
  title: string;
  description: string;
  microSteps: MicroStep[];
  createdAt: string;
  completedAt?: string;
}

interface NavigationProps {
  navigation: any;
}

const ExecutiveFunctionScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [tasks, setTasks] = useState<ExecutiveTask[]>([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newStepText, setNewStepText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await getExecutiveFunctionTasks();
    setTasks(data);
  };

  const saveTasks = async (updatedTasks: ExecutiveTask[]) => {
    await saveExecutiveFunctionTasks(updatedTasks);
    setTasks(updatedTasks);
  };

  const generateAISteps = (taskTitle: string, taskDescription: string): string[] => {
    const title = taskTitle.toLowerCase();
    const desc = taskDescription.toLowerCase();

    // Kitchen cleaning
    if (title.includes('kitchen') || title.includes('clean kitchen')) {
      return [
        'Put one dirty dish in the dishwasher',
        'Wipe down one section of the counter',
        'Take out the trash if it\'s full',
        'Put away one item that doesn\'t belong',
        'Wipe the sink',
      ];
    }

    // Email/inbox
    if (title.includes('email') || title.includes('inbox')) {
      return [
        'Open email app',
        'Delete 5 obvious spam emails',
        'Reply to one urgent email',
        'Mark 3 emails as read',
        'Archive old emails from last month',
      ];
    }

    // Laundry
    if (title.includes('laundry') || title.includes('clothes')) {
      return [
        'Pick up clothes from one spot',
        'Sort into one pile (darks/lights)',
        'Put one load in the washer',
        'Set a timer for when it\'s done',
        'Move to dryer when timer goes off',
      ];
    }

    // Paperwork/admin
    if (title.includes('paperwork') || title.includes('bills') || title.includes('admin')) {
      return [
        'Gather all papers in one pile',
        'Sort into 2 categories: urgent vs later',
        'Deal with the first urgent item',
        'File or discard 5 old papers',
        'Take a photo of important documents',
      ];
    }

    // Exercise/workout
    if (title.includes('exercise') || title.includes('workout') || title.includes('gym')) {
      return [
        'Put on workout clothes',
        'Fill water bottle',
        'Do 5 minutes of stretching',
        'Start with one simple exercise',
        'Celebrate that you started!',
      ];
    }

    // Studying/learning
    if (title.includes('study') || title.includes('learn') || title.includes('read')) {
      return [
        'Find the materials you need',
        'Set a 15-minute timer',
        'Read one page or section',
        'Write down one key point',
        'Take a 5-minute break',
      ];
    }

    // Generic task breakdown
    return [
      'Gather everything you need for this task',
      'Do the absolute tiniest first step',
      'Take a 2-minute break',
      'Do one more small step',
      'Reward yourself for starting!',
    ];
  };

  const handleAISuggest = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate AI thinking
    setTimeout(() => {
      const suggestedSteps = generateAISteps(task.title, task.description);

      const updatedTasks = tasks.map(t => {
        if (t.id === taskId) {
          const newSteps: MicroStep[] = suggestedSteps.map((text, index) => ({
            id: `step-${Date.now()}-${index}`,
            text,
            completed: false,
            order: t.microSteps.length + index,
          }));

          return {
            ...t,
            microSteps: [...t.microSteps, ...newSteps],
          };
        }
        return t;
      });

      saveTasks(updatedTasks);
      setIsGenerating(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const createTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title');
      return;
    }

    const newTask: ExecutiveTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      microSteps: [],
      createdAt: new Date().toISOString(),
    };

    saveTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setShowNewTaskForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task and all its micro-steps?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            saveTasks(tasks.filter(t => t.id !== taskId));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
      ]
    );
  };

  const addMicroStep = (taskId: string) => {
    if (!newStepText.trim()) return;

    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newStep: MicroStep = {
          id: `step-${Date.now()}`,
          text: newStepText.trim(),
          completed: false,
          order: task.microSteps.length,
        };
        return {
          ...task,
          microSteps: [...task.microSteps, newStep],
        };
      }
      return task;
    });

    saveTasks(updatedTasks);
    setNewStepText('');
    setEditingTaskId(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleStepComplete = (taskId: string, stepId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedSteps = task.microSteps.map(step => {
          if (step.id === stepId) {
            const isCompleting = !step.completed;
            if (isCompleting) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            return { ...step, completed: isCompleting };
          }
          return step;
        });

        // Check if all steps are completed
        const allCompleted = updatedSteps.every(s => s.completed);
        if (allCompleted && updatedSteps.length > 0) {
          return {
            ...task,
            microSteps: updatedSteps,
            completedAt: new Date().toISOString(),
          };
        }

        return { ...task, microSteps: updatedSteps };
      }
      return task;
    });

    saveTasks(updatedTasks);
  };

  const deleteStep = (taskId: string, stepId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          microSteps: task.microSteps.filter(s => s.id !== stepId),
        };
      }
      return task;
    });

    saveTasks(updatedTasks);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getProgress = (task: ExecutiveTask) => {
    if (task.microSteps.length === 0) return 0;
    const completed = task.microSteps.filter(s => s.completed).length;
    return Math.round((completed / task.microSteps.length) * 100);
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
            <Text style={styles.headerTitle}>🧩 Executive Function Helper</Text>
            <Text style={styles.headerSubtitle}>Break Through Task Paralysis</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          💡 Overwhelmed by a task? Break it down into tiny, brain-friendly micro-steps.
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Task List */}
        {tasks.map(task => {
          const progress = getProgress(task);
          const isComplete = task.completedAt !== undefined;

          return (
            <View key={task.id} style={[styles.taskCard, isComplete && styles.taskCardComplete]}>
              <View style={styles.taskHeader}>
                <View style={styles.taskHeaderLeft}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.description && (
                    <Text style={styles.taskDescription}>{task.description}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => deleteTask(task.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>

              {/* Progress Bar */}
              {task.microSteps.length > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{progress}%</Text>
                </View>
              )}

              {/* Micro Steps */}
              {task.microSteps.map((step, index) => (
                <View key={step.id} style={styles.stepRow}>
                  <TouchableOpacity
                    style={styles.stepCheckbox}
                    onPress={() => toggleStepComplete(task.id, step.id)}
                  >
                    {step.completed ? (
                      <View style={styles.stepCheckboxChecked}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.stepCheckboxUnchecked} />
                    )}
                  </TouchableOpacity>

                  <Text style={[styles.stepText, step.completed && styles.stepTextCompleted]}>
                    {index + 1}. {step.text}
                  </Text>

                  <TouchableOpacity
                    onPress={() => deleteStep(task.id, step.id)}
                    style={styles.stepDeleteButton}
                  >
                    <Text style={styles.stepDeleteText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Step Form */}
              {editingTaskId === task.id ? (
                <View style={styles.addStepForm}>
                  <TextInput
                    style={styles.stepInput}
                    placeholder="What's the tiniest next step?"
                    placeholderTextColor={colors.textMuted}
                    value={newStepText}
                    onChangeText={setNewStepText}
                    autoFocus
                  />
                  <View style={styles.stepFormButtons}>
                    <TouchableOpacity
                      style={styles.stepCancelButton}
                      onPress={() => {
                        setEditingTaskId(null);
                        setNewStepText('');
                      }}
                    >
                      <Text style={styles.stepCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.stepSaveButton}
                      onPress={() => addMicroStep(task.id)}
                    >
                      <Text style={styles.stepSaveText}>Add Step</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <TouchableOpacity
                    style={styles.addStepButton}
                    onPress={() => setEditingTaskId(task.id)}
                  >
                    <Text style={styles.addStepText}>+ Add micro-step manually</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.aiSuggestButton}
                    onPress={() => handleAISuggest(task.id)}
                    disabled={isGenerating}
                  >
                    <LinearGradient
                      colors={isGenerating ? [colors.textMuted, colors.textMuted] : ['#9D4EDD', '#FF1B8D']}
                      style={styles.aiSuggestGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.aiSuggestText}>
                        {isGenerating ? '✨ Generating...' : '✨ AI Suggest Steps'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {isComplete && (
                <View style={styles.completeBanner}>
                  <Text style={styles.completeText}>✨ Task Complete! Great work!</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* New Task Button/Form */}
        {showNewTaskForm ? (
          <View style={styles.newTaskForm}>
            <Text style={styles.formTitle}>Break Down a New Task</Text>

            <Text style={styles.formLabel}>What's overwhelming you?</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., Clean the kitchen"
              placeholderTextColor={colors.textMuted}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />

            <Text style={styles.formLabel}>Why is it hard? (optional)</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="e.g., Too many steps, don't know where to start..."
              placeholderTextColor={colors.textMuted}
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.formCancelButton}
                onPress={() => {
                  setShowNewTaskForm(false);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                }}
              >
                <Text style={styles.formCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formSaveButton} onPress={createTask}>
                <LinearGradient colors={gradients.primary} style={styles.formSaveGradient}>
                  <Text style={styles.formSaveText}>Create Task</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.newTaskButton}
            onPress={() => setShowNewTaskForm(true)}
          >
            <LinearGradient colors={gradients.primary} style={styles.newTaskGradient}>
              <Text style={styles.newTaskText}>+ Break Down a New Task</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Empty State */}
        {tasks.length === 0 && !showNewTaskForm && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>🧩 Break Through Paralysis</Text>
            <Text style={styles.emptyText}>
              Feeling stuck on a task? This tool helps you break it down into tiny,
              manageable micro-steps.
            </Text>
            <Text style={styles.emptyExample}>
              Example: "Clean kitchen" becomes:{'\n'}
              1. Put one dish in dishwasher{'\n'}
              2. Wipe one counter{'\n'}
              3. Take out trash{'\n'}
              ... and so on
            </Text>
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
  infoBanner: {
    backgroundColor: colors.info,
    padding: 12,
  },
  infoText: {
    fontSize: 13,
    color: colors.background,
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardComplete: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskHeaderLeft: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
    width: 45,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stepCheckbox: {
    flexShrink: 0,
  },
  stepCheckboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.pink,
  },
  stepCheckboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  stepDeleteButton: {
    padding: 4,
  },
  stepDeleteText: {
    fontSize: 24,
    color: colors.textMuted,
  },
  addStepButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  addStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.pink,
  },
  aiSuggestButton: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  aiSuggestGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  aiSuggestText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  addStepForm: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  stepInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  stepFormButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  stepCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  stepCancelText: {
    color: colors.text,
    fontWeight: '600',
  },
  stepSaveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.pink,
    alignItems: 'center',
  },
  stepSaveText: {
    color: colors.text,
    fontWeight: '700',
  },
  completeBanner: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
  },
  newTaskButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  newTaskGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  newTaskText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  newTaskForm: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  formCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  formCancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  formSaveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  formSaveGradient: {
    padding: 16,
    alignItems: 'center',
  },
  formSaveText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyExample: {
    fontSize: 13,
    color: colors.textMuted,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.pink,
    lineHeight: 20,
  },
});

export default ExecutiveFunctionScreen;

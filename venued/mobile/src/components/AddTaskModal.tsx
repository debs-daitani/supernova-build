import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { Task, EnergyLevel, TaskDifficulty } from '../types';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'phaseId' | 'order' | 'createdAt' | 'completed'>) => void;
  editingTask?: Task;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onSave,
  editingTask,
}) => {
  const [title, setTitle] = useState((editingTask && editingTask.title) || '');
  const [description, setDescription] = useState((editingTask && editingTask.description) || '');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>((editingTask && editingTask.energyLevel) || 'medium');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>((editingTask && editingTask.difficulty) || 'medium');
  const [estimatedHours, setEstimatedHours] = useState((editingTask && editingTask.estimatedHours?.toString()) || '1');
  const [isHyperfocus, setIsHyperfocus] = useState((editingTask && editingTask.isHyperfocus) || false);
  const [isQuickWin, setIsQuickWin] = useState((editingTask && editingTask.isQuickWin) || false);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      energyLevel,
      difficulty,
      estimatedHours: parseFloat(estimatedHours) || 1,
      isHyperfocus,
      isQuickWin,
      dependencies: [],
    });

    // Reset
    setTitle('');
    setDescription('');
    setEnergyLevel('medium');
    setDifficulty('medium');
    setEstimatedHours('1');
    setIsHyperfocus(false);
    setIsQuickWin(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modal}>
          <LinearGradient colors={gradients.primary} style={styles.header}>
            <Text style={styles.title}>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </Text>
          </LinearGradient>

          <ScrollView style={styles.content}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus={true}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Details about this task"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={3}
            />

            <Text style={styles.label}>Energy Level</Text>
            <View style={styles.optionRow}>
              {(['high', 'medium', 'low'] as EnergyLevel[]).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.option,
                    energyLevel === level && styles.optionSelected,
                    { borderColor: getEnergyColor(level) },
                  ]}
                  onPress={() => setEnergyLevel(level)}
                >
                  <Text style={[
                    styles.optionText,
                    energyLevel === level && { color: getEnergyColor(level) },
                  ]}>
                    {level.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.optionRow}>
              {(['easy', 'medium', 'hard'] as TaskDifficulty[]).map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.option,
                    difficulty === diff && styles.optionSelected,
                  ]}
                  onPress={() => setDifficulty(diff)}
                >
                  <Text style={[
                    styles.optionText,
                    difficulty === diff && styles.optionTextSelected,
                  ]}>
                    {diff.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Estimated Hours</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              placeholderTextColor={colors.textMuted}
              value={estimatedHours}
              onChangeText={setEstimatedHours}
              keyboardType="decimal-pad"
            />

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setIsHyperfocus(!isHyperfocus)}
              >
                <View style={[styles.checkboxBox, isHyperfocus && styles.checkboxBoxChecked]}>
                  {isHyperfocus && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>🎯 Hyperfocus Task</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setIsQuickWin(!isQuickWin)}
              >
                <View style={[styles.checkboxBox, isQuickWin && styles.checkboxBoxChecked]}>
                  {isQuickWin && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>⚡ Quick Win</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
              onPress={!title.trim() ? undefined : handleSave}
              activeOpacity={!title.trim() ? 1 : 0.7}
            >
              <LinearGradient colors={gradients.primary} style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>Save Task</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const getEnergyColor = (level: EnergyLevel) => {
  switch (level) {
    case 'high': return colors.energyHigh;
    case 'medium': return colors.energyMedium;
    case 'low': return colors.energyLow;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.text,
  },
  checkboxRow: {
    marginTop: 16,
    gap: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  checkmark: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddTaskModal;

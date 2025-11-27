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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { Phase } from '../types';

interface AddPhaseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (phase: Omit<Phase, 'id' | 'order' | 'tasks'>) => void;
  editingPhase?: Phase;
}

const AddPhaseModal: React.FC<AddPhaseModalProps> = ({
  visible,
  onClose,
  onSave,
  editingPhase,
}) => {
  const [name, setName] = useState((editingPhase && editingPhase.name) || '');
  const [description, setDescription] = useState((editingPhase && editingPhase.description) || '');
  const [selectedColor, setSelectedColor] = useState((editingPhase && editingPhase.color) || colors.pink);

  const phaseColors = [
    colors.pink,
    colors.purple,
    colors.green,
    colors.cyan,
    colors.warning,
  ];

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      color: selectedColor,
    });

    // Reset
    setName('');
    setDescription('');
    setSelectedColor(colors.pink);
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
              {editingPhase ? 'Edit Phase' : 'Add New Phase'}
            </Text>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.label}>Phase Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Planning, Development, Launch"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus={true}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Brief description of this phase"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={3}
            />

            <Text style={styles.label}>Phase Color</Text>
            <View style={styles.colorPicker}>
              {phaseColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
  style={[styles.saveButton, !name.trim() && styles.disabledButton]}
  onPress={!name.trim() ? undefined : handleSave}
  activeOpacity={!name.trim() ? 1 : 0.7}
>
              <LinearGradient colors={gradients.primary} style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>Save Phase</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
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
    maxHeight: '80%',
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
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.text,
  },
  checkmark: {
    color: colors.background,
    fontSize: 24,
    fontWeight: '700',
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

export default AddPhaseModal;

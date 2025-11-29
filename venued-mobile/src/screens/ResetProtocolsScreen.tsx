import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme/colors';

interface NavigationProps {
  navigation: any;
}

// The 5 Reset Protocols
const PROTOCOLS = [
  {
    id: 'cold-water',
    icon: '🧊',
    name: 'Cold Water Reset',
    time: '30 seconds',
    color: colors.cyan,
    description: 'Splash cold water on your face or run cold water on your wrists. This activates your dive reflex and instantly calms your nervous system.',
    steps: [
      'Go to the nearest sink or use a bottle of cold water',
      'Splash cold water on your face 3-5 times',
      'Or: Run cold water on the inside of your wrists for 30 seconds',
      'Take 3 slow, deep breaths',
      'Notice how your body feels calmer',
    ],
    scienceNote: 'Cold water triggers the mammalian dive reflex, slowing heart rate and promoting calm.',
  },
  {
    id: 'body-shake',
    icon: '🦁',
    name: 'Body Shake',
    time: '60 seconds',
    color: colors.pink,
    description: 'Shake out stuck energy and stress like animals do after danger. This releases tension trapped in your muscles and nervous system.',
    steps: [
      'Stand up with feet shoulder-width apart',
      'Start shaking your hands gently',
      'Let the shake travel up your arms to shoulders',
      'Add bouncing in your knees, let your whole body shake',
      'Shake for 30-60 seconds, then stop and notice the stillness',
    ],
    scienceNote: 'Animals naturally shake after stress. This releases cortisol and completes the stress cycle.',
  },
  {
    id: 'breathing',
    icon: '🌬️',
    name: 'Physiological Sigh',
    time: '90 seconds',
    color: colors.purple,
    description: 'The fastest way to calm your nervous system using a specific breathing pattern discovered by Stanford researchers.',
    steps: [
      'Take a deep breath in through your nose',
      'At the top, take a second, smaller sip of air',
      'Exhale slowly through your mouth (longer than inhale)',
      'Repeat 3-5 times',
      'Notice your heart rate slowing',
    ],
    scienceNote: 'Double inhale + long exhale activates parasympathetic nervous system in under 60 seconds.',
  },
  {
    id: 'grounding',
    icon: '🦶',
    name: '5-4-3-2-1 Grounding',
    time: '2 minutes',
    color: colors.green,
    description: 'Pull yourself back to the present moment when anxiety or overwhelm takes over. Uses all five senses to anchor you.',
    steps: [
      '5 things you can SEE (look around, name them)',
      '4 things you can TOUCH (feel textures around you)',
      '3 things you can HEAR (listen for sounds)',
      '2 things you can SMELL (notice scents)',
      '1 thing you can TASTE (notice taste in mouth)',
    ],
    scienceNote: 'Engages prefrontal cortex and interrupts amygdala hijack.',
  },
  {
    id: 'movement',
    icon: '🚶',
    name: 'Movement Snack',
    time: '3 minutes',
    color: colors.cyan,
    description: 'Quick movement to reset your brain and body. Walking, jumping, or any movement that gets blood flowing.',
    steps: [
      'Choose: walk, jumping jacks, or dance',
      'Set a 3-minute timer',
      'Move with intention - feel your body',
      'Breathe deeply while moving',
      'End with 3 deep breaths standing still',
    ],
    scienceNote: 'Movement increases BDNF, dopamine, and clears cortisol from your system.',
  },
];

const ResetProtocolsScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [selectedProtocol, setSelectedProtocol] = useState<typeof PROTOCOLS[0] | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleProtocolPress = (protocol: typeof PROTOCOLS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedProtocol(protocol);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProtocol(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔄 RESET PROTOCOLS</Text>
        <Text style={styles.headerSubtitle}>5 quick interventions when you're stuck</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            When overwhelm hits, pick one and do it.{'\n'}
            No thinking. Just reset.
          </Text>
        </View>

        {/* Protocols List */}
        {PROTOCOLS.map((protocol) => (
          <TouchableOpacity
            key={protocol.id}
            style={styles.protocolCard}
            onPress={() => handleProtocolPress(protocol)}
            activeOpacity={0.7}
          >
            <View style={[styles.protocolIconContainer, { backgroundColor: protocol.color + '20' }]}>
              <Text style={styles.protocolIcon}>{protocol.icon}</Text>
            </View>
            <View style={styles.protocolContent}>
              <Text style={styles.protocolName}>{protocol.name}</Text>
              <Text style={styles.protocolDescription} numberOfLines={2}>
                {protocol.description}
              </Text>
              <View style={styles.protocolMeta}>
                <Text style={[styles.protocolTime, { color: protocol.color }]}>
                  ⏱️ {protocol.time}
                </Text>
              </View>
            </View>
            <Text style={styles.protocolArrow}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Reminder */}
        <View style={styles.reminderSection}>
          <Text style={styles.reminderEmoji}>💡</Text>
          <Text style={styles.reminderText}>
            These work because they're based on neuroscience, not willpower.
            Your nervous system responds to physical interventions faster than mental ones.
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Protocol Detail Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProtocol && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[
                    styles.modalIconContainer,
                    { backgroundColor: selectedProtocol.color + '20' }
                  ]}>
                    <Text style={styles.modalIcon}>{selectedProtocol.icon}</Text>
                  </View>
                  <View style={styles.modalHeaderText}>
                    <Text style={styles.modalTitle}>{selectedProtocol.name}</Text>
                    <Text style={[styles.modalTime, { color: selectedProtocol.color }]}>
                      ⏱️ {selectedProtocol.time}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalDescription}>{selectedProtocol.description}</Text>

                <View style={styles.stepsContainer}>
                  <Text style={styles.stepsTitle}>HOW TO DO IT:</Text>
                  {selectedProtocol.steps.map((step, index) => (
                    <View key={index} style={styles.stepRow}>
                      <View style={[styles.stepNumber, { backgroundColor: selectedProtocol.color }]}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.scienceNote}>
                  <Text style={styles.scienceLabel}>🔬 The Science:</Text>
                  <Text style={styles.scienceText}>{selectedProtocol.scienceNote}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.doneButton, { backgroundColor: selectedProtocol.color }]}
                  onPress={closeModal}
                  activeOpacity={0.7}
                >
                  <Text style={styles.doneButtonText}>Got it! 🤘</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  backButton: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  introSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  introText: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  protocolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  protocolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  protocolIcon: {
    fontSize: 28,
  },
  protocolContent: {
    flex: 1,
  },
  protocolName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  protocolDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  protocolMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  protocolTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  protocolArrow: {
    fontSize: 20,
    color: colors.pink,
    marginLeft: 8,
  },
  reminderSection: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  reminderText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalIcon: {
    fontSize: 32,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  modalTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  stepsContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 12,
    letterSpacing: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  scienceNote: {
    backgroundColor: colors.purple + '15',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  scienceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purple,
    marginBottom: 6,
  },
  scienceText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});

export default ResetProtocolsScreen;

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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { ADHDData, BrainDump } from '../types';
import { getADHDData, saveADHDData } from '../lib/storage';

interface NavigationProps {
  navigation: any;
}

const EntourageScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [adhdData, setADHDData] = useState<ADHDData>({
    brainDumps: [],
    energyLogs: [],
    hyperfocusSessions: [],
  });
  const [newDump, setNewDump] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getADHDData();
    setADHDData(data);
  };

  const addBrainDump = async () => {
    if (!newDump.trim()) return;

    const dump: BrainDump = {
      id: Date.now().toString(),
      content: newDump,
      timestamp: new Date().toISOString(),
      converted: false,
      archived: false,
    };

    const updatedData = {
      ...adhdData,
      brainDumps: [dump, ...adhdData.brainDumps],
    };

    await saveADHDData(updatedData);
    setADHDData(updatedData);
    setNewDump('');
  };

  const adhdTools = [
    { icon: '⏰', name: 'Time Blindness Tracker', subtitle: 'Track estimates vs reality', route: 'TimeBlindness' },
    { icon: '🎯', name: 'Hyperfocus Logger', subtitle: 'Log your flow states', route: null },
    { icon: '⚡', name: 'Energy Tracker', subtitle: 'Map your energy patterns', route: null },
    { icon: '🧩', name: 'Executive Function Helper', subtitle: 'Break through paralysis', route: 'ExecutiveFunction' },
    { icon: '🎁', name: 'Dopamine Menu', subtitle: 'Reward system', route: null },
    { icon: '👥', name: 'Body Doubling', subtitle: 'Virtual work companion', route: null },
    { icon: '📊', name: 'Pattern Insights', subtitle: 'Personalized recommendations', route: null },
  ];

  const handleToolPress = (tool: { name: string; route: string | null }) => {
    if (tool.route) {
      navigation.navigate(tool.route);
    } else {
      Alert.alert(
        tool.name,
        'This feature is coming soon! 🚀\n\nWe\'re building specialized ADHD support tools to help you work with your brain, not against it.',
        [{ text: 'Got it!' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>🧠 THE ENTOURAGE</Text>
        <Text style={styles.headerSubtitle}>ADHD Support Tools</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Brain Dump Space */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 Brain Dump Space</Text>
          <Text style={styles.sectionSubtitle}>
            Capture everything, organize later
          </Text>

          <View style={styles.dumpInput}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textMuted}
              value={newDump}
              onChangeText={setNewDump}
              multiline={true}
            />
            <TouchableOpacity style={styles.addButton} onPress={addBrainDump}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Brain Dumps List */}
          {adhdData.brainDumps.slice(0, 3).map((dump) => (
            <View key={dump.id} style={styles.dumpCard}>
              <Text style={styles.dumpContent}>{dump.content}</Text>
              <Text style={styles.dumpTime}>
                {new Date(dump.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))}

          {adhdData.brainDumps.length > 3 && (
            <Text style={styles.moreText}>
              +{adhdData.brainDumps.length - 3} more dumps
            </Text>
          )}
        </View>

        {/* ADHD Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ ADHD Support Tools</Text>
          <Text style={styles.sectionSubtitle}>
            Specialized tools for your ADHD brain
          </Text>

          {adhdTools.map((tool, index) => (
            <TouchableOpacity
              key={index}
              style={styles.toolCard}
              onPress={() => handleToolPress(tool)}
            >
              <Text style={styles.toolIcon}>{tool.icon}</Text>
              <View style={styles.toolContent}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
              </View>
              <Text style={styles.toolArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Your ADHD Insights</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{adhdData.brainDumps.length}</Text>
              <Text style={styles.statLabel}>Brain Dumps</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{adhdData.energyLogs.length}</Text>
              <Text style={styles.statLabel}>Energy Logs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{adhdData.hyperfocusSessions.length}</Text>
              <Text style={styles.statLabel}>Focus Sessions</Text>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutText}>
            Built for ADHD brains, by ADHD brains. Because your brain works differently,
            and that's not a bug—it's a feature.
          </Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  dumpInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: colors.pink,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  dumpCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dumpContent: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
  },
  dumpTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  moreText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  toolContent: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  toolSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  toolArrow: {
    fontSize: 20,
    color: colors.pink,
  },
  statsGrid: {
    flexDirection: 'row',
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.pink,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  aboutSection: {
    padding: 24,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default EntourageScreen;

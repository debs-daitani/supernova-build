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
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme/colors';
import { getADHDData, saveADHDData, ADHDData } from '../lib/storage';

interface NavigationProps {
  navigation: any;
}

type TabType = 'dump' | 'ideas' | 'pivots';

interface BrainDump {
  id: string;
  content: string;
  timestamp: string;
  converted: boolean;
  archived: boolean;
  category?: 'dump' | 'idea' | 'pivot';
}

const DemoTapesScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dump');
  const [adhdData, setAdhdData] = useState<ADHDData>({
    brainDumps: [],
    energyLogs: [],
    hyperfocusSessions: [],
  });
  const [newEntry, setNewEntry] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getADHDData();
    setAdhdData(data);
  };

  const addEntry = async () => {
    if (!newEntry.trim()) return;

    const entry: BrainDump = {
      id: `${activeTab}-${Date.now()}`,
      content: newEntry.trim(),
      timestamp: new Date().toISOString(),
      converted: false,
      archived: false,
      category: activeTab,
    };

    const updatedData = {
      ...adhdData,
      brainDumps: [entry, ...adhdData.brainDumps],
    };

    await saveADHDData(updatedData);
    setAdhdData(updatedData);
    setNewEntry('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteEntry = (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedData = {
              ...adhdData,
              brainDumps: adhdData.brainDumps.filter(d => d.id !== id),
            };
            await saveADHDData(updatedData);
            setAdhdData(updatedData);
          },
        },
      ]
    );
  };

  const getFilteredEntries = () => {
    return adhdData.brainDumps.filter(d => {
      // Handle legacy entries without category
      if (!d.category) {
        return activeTab === 'dump';
      }
      return d.category === activeTab;
    });
  };

  const getTabConfig = () => {
    switch (activeTab) {
      case 'dump':
        return {
          icon: '🧠',
          title: 'Brain Dump',
          subtitle: 'Get it all out of your head',
          placeholder: "What's swirling around in there?",
          buttonText: 'Dump it!',
          color: colors.pink,
        };
      case 'ideas':
        return {
          icon: '💡',
          title: 'Ideas',
          subtitle: 'Capture those sparks',
          placeholder: 'What if...',
          buttonText: 'Save idea',
          color: colors.cyan,
        };
      case 'pivots':
        return {
          icon: '🔄',
          title: 'Pivots Log',
          subtitle: 'Track direction changes',
          placeholder: 'Pivoting from X to Y because...',
          buttonText: 'Log pivot',
          color: colors.purple,
        };
    }
  };

  const config = getTabConfig();
  const entries = getFilteredEntries();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎸 DEMO TAPES</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {[
            { id: 'dump' as TabType, label: '🧠 Dump' },
            { id: 'ideas' as TabType, label: '💡 Ideas' },
            { id: 'pivots' as TabType, label: '🔄 Pivots' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Header */}
        <View style={[styles.sectionHeader, { borderLeftColor: config.color }]}>
          <Text style={styles.sectionIcon}>{config.icon}</Text>
          <View>
            <Text style={styles.sectionTitle}>{config.title}</Text>
            <Text style={styles.sectionSubtitle}>{config.subtitle}</Text>
          </View>
        </View>

        {/* Input Area */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            placeholder={config.placeholder}
            placeholderTextColor={colors.textMuted}
            value={newEntry}
            onChangeText={setNewEntry}
            multiline
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: config.color }]}
            onPress={addEntry}
          >
            <Text style={styles.addButtonText}>{config.buttonText}</Text>
          </TouchableOpacity>
        </View>

        {/* Entries List */}
        <View style={styles.entriesSection}>
          <Text style={styles.entriesTitle}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </Text>

          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{config.icon}</Text>
              <Text style={styles.emptyText}>No {config.title.toLowerCase()}s yet</Text>
              <Text style={styles.emptySubtext}>Start capturing your thoughts!</Text>
            </View>
          ) : (
            entries.map(entry => (
              <TouchableOpacity
                key={entry.id}
                style={[styles.entryCard, { borderLeftColor: config.color }]}
                onLongPress={() => deleteEntry(entry.id)}
              >
                <Text style={styles.entryContent}>{entry.content}</Text>
                <Text style={styles.entryTime}>
                  {new Date(entry.timestamp).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
          {activeTab === 'dump' && (
            <Text style={styles.tipText}>
              Don't filter - just dump! Your brain needs to offload before it can focus.
              You can organize later.
            </Text>
          )}
          {activeTab === 'ideas' && (
            <Text style={styles.tipText}>
              ADHD brains are idea machines. Capture them all - even the "weird" ones.
              Review weekly to find the gems.
            </Text>
          )}
          {activeTab === 'pivots' && (
            <Text style={styles.tipText}>
              Pivoting isn't failing - it's learning. Track your pivots to spot patterns
              and make better decisions faster.
            </Text>
          )}
        </View>

        <View style={{ height: 100 }} />
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
    paddingTop: 16,
    paddingBottom: 0,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.text,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  tabTextActive: {
    color: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inputSection: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  entriesSection: {
    marginBottom: 24,
  },
  entriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  entryCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  entryContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  entryTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  tipsSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.cyan,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default DemoTapesScreen;

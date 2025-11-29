import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme/colors';

interface NavigationProps {
  navigation: any;
}

// The 9 Entourage Tools
const ENTOURAGE_TOOLS = [
  {
    id: 'focused',
    icon: '🎯',
    name: 'FOCUSED A/F',
    subtitle: 'Timer + Hyperfocus + Time Perception',
    color: colors.pink,
    route: 'FocusTimer',
  },
  {
    id: 'demo-tapes',
    icon: '🎸',
    name: 'Demo Tapes',
    subtitle: 'Brain Dump + Ideas + Pivots',
    color: colors.purple,
    route: 'DemoTapes',
  },
  {
    id: 'executive',
    icon: '🧠',
    name: 'Executive Function',
    subtitle: 'Micro-steps + Decision Help',
    color: colors.cyan,
    route: 'ExecutiveFunction',
  },
  {
    id: 'achievements',
    icon: '🏆',
    name: 'Achievements',
    subtitle: 'Points, Levels, Badges',
    color: colors.green,
    route: 'Achievements',
  },
  {
    id: 'patterns',
    icon: '📊',
    name: 'Pattern Insights',
    subtitle: 'AI observations about you',
    color: colors.cyan,
    route: 'PatternInsights',
  },
  {
    id: 'reset',
    icon: '🔄',
    name: 'Reset Protocols',
    subtitle: '5 quick interventions',
    color: colors.pink,
    route: 'ResetProtocols',
  },
  {
    id: 'revenue',
    icon: '💰',
    name: 'Revenue Reality',
    subtitle: 'Goals to daily actions',
    color: colors.green,
    route: 'RevenueReality',
  },
  {
    id: 'body-double',
    icon: '👥',
    name: 'Body Double',
    subtitle: 'Find buddy / Virtual mode',
    color: colors.purple,
    route: 'BodyDouble',
  },
  {
    id: 'reframe',
    icon: '🪞',
    name: 'Reframe Tool',
    subtitle: 'Turn rejection into fuel',
    color: colors.pink,
    route: 'ReframeTool',
  },
];

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const GRID_GAP = 12;
const CARD_SIZE = (width - (GRID_PADDING * 2) - (GRID_GAP * 2)) / 3;

const EntourageScreen: React.FC<NavigationProps> = ({ navigation }) => {

  const handleToolPress = (tool: typeof ENTOURAGE_TOOLS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Tools that are implemented
    const implementedRoutes = ['FocusTimer', 'ExecutiveFunction', 'ResetProtocols', 'DemoTapes'];

    if (implementedRoutes.includes(tool.route)) {
      navigation.navigate(tool.route);
    } else {
      Alert.alert(
        `${tool.icon} ${tool.name}`,
        `${tool.subtitle}\n\nComing soon! This tool is being built to help you work with your ADHD brain, not against it.`,
        [{ text: 'Got it! 🤘' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>🧠 THE ENTOURAGE</Text>
        <Text style={styles.headerSubtitle}>Your ADHD Power Tools</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Text */}
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            9 tools designed for ADHD brains. Tap any card to dive in.
          </Text>
        </View>

        {/* 3x3 Grid */}
        <View style={styles.grid}>
          {ENTOURAGE_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => handleToolPress(tool)}
              activeOpacity={0.7}
            >
              <View style={[styles.toolIconContainer, { backgroundColor: tool.color + '20' }]}>
                <Text style={styles.toolIcon}>{tool.icon}</Text>
              </View>
              <Text style={styles.toolName} numberOfLines={1}>{tool.name}</Text>
              <Text style={styles.toolSubtitle} numberOfLines={2}>{tool.subtitle}</Text>
              <View style={[styles.toolIndicator, { backgroundColor: tool.color }]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutText}>
            Built for ADHD brains, by ADHD brains.{'\n'}
            Your brain works differently—that's not a bug, it's a feature.
          </Text>
        </View>

        {/* Bottom spacing */}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: GRID_PADDING,
  },
  introSection: {
    marginBottom: 16,
  },
  introText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  toolCard: {
    width: CARD_SIZE,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  toolIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolIcon: {
    fontSize: 26,
  },
  toolName: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  toolSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 12,
    minHeight: 24,
  },
  toolIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  aboutSection: {
    marginTop: 24,
    padding: 16,
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

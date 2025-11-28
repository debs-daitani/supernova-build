import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import AnimatedButton from '../components/AnimatedButton';
import { getFavouriteMessages } from '../lib/storage';
import { allMessages, PowerMessage } from '../lib/powerMessages';

const HypeStationScreen: React.FC = () => {
  const [savedMessages, setSavedMessages] = useState<PowerMessage[]>([]);
  const [currentEnergy, setCurrentEnergy] = useState<'low' | 'medium' | 'high' | null>(null);
  const [showDopamineHit, setShowDopamineHit] = useState(false);

  useEffect(() => {
    loadSavedMessages();
  }, []);

  const loadSavedMessages = async () => {
    const favouriteIds = await getFavouriteMessages();
    const messages = allMessages.filter(m => favouriteIds.includes(m.id));
    setSavedMessages(messages);
  };

  const handleDopamineHit = () => {
    setShowDopamineHit(true);
    setTimeout(() => setShowDopamineHit(false), 3000);
  };

  const energyLevels = [
    { key: 'low', emoji: '🔋', label: 'Low', color: colors.pink },
    { key: 'medium', emoji: '⚡', label: 'Medium', color: colors.warning },
    { key: 'high', emoji: '🔥', label: 'High', color: colors.green },
  ] as const;

  const dopamineMessages = [
    "YOU'RE DOING AMAZING! 🌟",
    "KEEP GOING, LEGEND! 🎸",
    "YOU'VE GOT THIS! 💪",
    "UNSTOPPABLE! 🚀",
    "ABSOLUTE ROCKSTAR! ⭐",
  ];

  const randomDopamine = dopamineMessages[Math.floor(Math.random() * dopamineMessages.length)];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>🎵 THE SETLIST</Text>
        <Text style={styles.headerSubtitle}>Your Hype Station</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* 1. THE PLAYLIST - Spotify Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎵 THE PLAYLIST</Text>
          <View style={styles.spotifyPlaceholder}>
            <View style={styles.spotifyIcon}>
              <Text style={styles.spotifyIconText}>🎧</Text>
            </View>
            <Text style={styles.spotifyTitle}>Spotify Integration</Text>
            <Text style={styles.spotifySubtitle}>Coming Soon</Text>
            <Text style={styles.spotifyDescription}>
              Your personalized hype playlist will appear here
            </Text>
            <AnimatedButton style={styles.spotifyButton} scaleValue={0.95}>
              <Text style={styles.spotifyButtonText}>Connect Spotify</Text>
            </AnimatedButton>
          </View>
        </View>

        {/* 2. ENERGY TRACKER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔋 ENERGY TRACKER</Text>
          <Text style={styles.sectionSubtitle}>How are you feeling right now?</Text>
          <View style={styles.energyButtons}>
            {energyLevels.map((level) => (
              <AnimatedButton
                key={level.key}
                style={[
                  styles.energyButton,
                  currentEnergy === level.key && { borderColor: level.color, borderWidth: 2 },
                ]}
                onPress={() => setCurrentEnergy(level.key)}
                scaleValue={0.95}
              >
                <Text style={styles.energyEmoji}>{level.emoji}</Text>
                <Text style={[styles.energyLabel, currentEnergy === level.key && { color: level.color }]}>
                  {level.label}
                </Text>
              </AnimatedButton>
            ))}
          </View>
          {currentEnergy && (
            <View style={styles.energyFeedback}>
              <Text style={styles.energyFeedbackText}>
                {currentEnergy === 'low' && "Take it easy. Small wins count! 💜"}
                {currentEnergy === 'medium' && "Steady pace. You're doing great! 🎯"}
                {currentEnergy === 'high' && "Ride the wave! Channel that energy! 🔥"}
              </Text>
            </View>
          )}
        </View>

        {/* 3. DOPAMINE HIT BUTTON */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ DOPAMINE HIT</Text>
          <AnimatedButton
            style={styles.dopamineButton}
            onPress={handleDopamineHit}
            scaleValue={0.92}
          >
            <LinearGradient
              colors={['#FF1B8D', '#9D4EDD', '#00D9FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dopamineGradient}
            >
              {showDopamineHit ? (
                <Text style={styles.dopamineMessage}>{randomDopamine}</Text>
              ) : (
                <>
                  <Text style={styles.dopamineEmoji}>⚡</Text>
                  <Text style={styles.dopamineText}>NEED A BOOST?</Text>
                  <Text style={styles.dopamineSubtext}>Tap for instant dopamine</Text>
                </>
              )}
            </LinearGradient>
          </AnimatedButton>
        </View>

        {/* 4. SAVED MESSAGES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💜 SAVED MESSAGES</Text>
          {savedMessages.length === 0 ? (
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyMessagesText}>
                No saved messages yet.{'\n'}Save your favourites from the Daily Power Message!
              </Text>
            </View>
          ) : (
            savedMessages.map((message) => (
              <View key={message.id} style={styles.savedMessage}>
                <Text style={styles.savedMessageEmoji}>{message.emoji}</Text>
                <Text style={styles.savedMessageText}>{message.content}</Text>
              </View>
            ))
          )}
        </View>

        {/* 5. REWARDS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎁 REWARDS</Text>
          <View style={styles.rewardsPlaceholder}>
            <Text style={styles.rewardsEmoji}>🎁</Text>
            <Text style={styles.rewardsTitle}>Reward System</Text>
            <Text style={styles.rewardsSubtitle}>Coming Soon</Text>
            <Text style={styles.rewardsDescription}>
              Customizable rewards, merch unlocks, and treats for hitting your goals
            </Text>
          </View>
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },

  // Spotify Placeholder
  spotifyPlaceholder: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  spotifyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  spotifyIconText: {
    fontSize: 28,
  },
  spotifyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  spotifySubtitle: {
    fontSize: 14,
    color: colors.pink,
    fontWeight: '600',
    marginBottom: 8,
  },
  spotifyDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  spotifyButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  spotifyButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },

  // Energy Tracker
  energyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  energyButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  energyEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  energyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  energyFeedback: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  energyFeedbackText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },

  // Dopamine Button
  dopamineButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  dopamineGradient: {
    padding: 24,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  dopamineEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  dopamineText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  dopamineSubtext: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
  },
  dopamineMessage: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },

  // Saved Messages
  emptyMessages: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyMessagesText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  savedMessage: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  savedMessageEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  savedMessageText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },

  // Rewards Placeholder
  rewardsPlaceholder: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  rewardsEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  rewardsSubtitle: {
    fontSize: 14,
    color: colors.pink,
    fontWeight: '600',
    marginBottom: 8,
  },
  rewardsDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HypeStationScreen;

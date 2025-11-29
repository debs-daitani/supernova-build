import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { PowerMessage, getRandomMessage, getTypeLabel } from '../lib/powerMessages';
import AnimatedButton from './AnimatedButton';
import {
  shouldShowPowerMessage,
  markPowerMessageShown,
  toggleFavouriteMessage,
  getFavouriteMessages,
} from '../lib/storage';

const { width, height } = Dimensions.get('window');

interface DailyPowerMessageProps {
  onDismiss?: () => void;
  forceShow?: boolean; // For testing/preview purposes
}

const DailyPowerMessage: React.FC<DailyPowerMessageProps> = ({
  onDismiss,
  forceShow = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<PowerMessage | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  useEffect(() => {
    checkAndShow();
  }, [forceShow]);

  const checkAndShow = async () => {
    if (forceShow) {
      const randomMessage = getRandomMessage();
      setMessage(randomMessage);
      const favourites = await getFavouriteMessages();
      setIsFavourite(favourites.includes(randomMessage.id));
      setVisible(true);
      return;
    }

    const shouldShow = await shouldShowPowerMessage();
    if (shouldShow) {
      const randomMessage = getRandomMessage();
      setMessage(randomMessage);
      const favourites = await getFavouriteMessages();
      setIsFavourite(favourites.includes(randomMessage.id));
      setVisible(true);
    }
  };

  const handleDismiss = async () => {
    await markPowerMessageShown();
    setVisible(false);
    onDismiss?.();
  };

  const handleToggleFavourite = async () => {
    if (!message) return;

    const newState = await toggleFavouriteMessage(message.id);
    setIsFavourite(newState);

    if (newState) {
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 1500);
    }
  };

  if (!visible || !message) return null;

  // Get gradient colors based on message type
  const getGradientColors = (): readonly [string, string, string] => {
    switch (message.type) {
      case 'truth_bomb':
        return ['#1a0a2e', '#2d1b4e', '#1a0a2e'] as const; // Deep purple
      case 'rock_motivation':
        return ['#2e0a1a', '#4e1b2d', '#2e0a1a'] as const; // Deep red/pink
      case 'quick_tip':
        return ['#0a1a2e', '#1b2d4e', '#0a1a2e'] as const; // Deep blue
    }
  };

  const getAccentColor = (): string => {
    switch (message.type) {
      case 'truth_bomb':
        return colors.purple;
      case 'rock_motivation':
        return colors.pink;
      case 'quick_tip':
        return colors.cyan;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={getGradientColors()}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: getAccentColor() }]}>
          <Text style={styles.typeBadgeText}>{getTypeLabel(message.type)}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Emoji */}
          <Text style={styles.emoji}>{message.emoji}</Text>

          {/* Message */}
          <Text style={styles.messageText}>{message.content}</Text>

          {/* Saved Feedback */}
          {showSavedFeedback && (
            <View style={styles.savedFeedback}>
              <Text style={styles.savedFeedbackText}>Saved to favourites!</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Favourite Button */}
          <AnimatedButton
            style={[styles.favouriteButton, isFavourite && styles.favouriteButtonActive]}
            onPress={handleToggleFavourite}
            scaleValue={0.95}
          >
            <Text style={styles.favouriteIcon}>{isFavourite ? '❤️' : '🤍'}</Text>
            <Text style={[styles.favouriteText, isFavourite && styles.favouriteTextActive]}>
              {isFavourite ? 'Saved' : 'Save'}
            </Text>
          </AnimatedButton>

          {/* Dismiss Button */}
          <AnimatedButton
            style={styles.dismissButton}
            onPress={handleDismiss}
            scaleValue={0.95}
          >
            <LinearGradient
              colors={[getAccentColor(), colors.purple]}
              style={styles.dismissButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.dismissButtonText}>LET'S GO</Text>
            </LinearGradient>
          </AnimatedButton>
        </View>

        {/* Tap hint */}
        <Text style={styles.tapHint}>Tap anywhere to continue</Text>

        {/* Full screen tap to dismiss */}
        <TouchableOpacity
          style={styles.fullScreenTap}
          onPress={handleDismiss}
          activeOpacity={1}
        />
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight || 44,
  },
  fullScreenTap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  typeBadge: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: width - 48,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  messageText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: 0.3,
  },
  savedFeedback: {
    marginTop: 16,
    backgroundColor: colors.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  savedFeedbackText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  favouriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  favouriteButtonActive: {
    borderColor: colors.pink,
    backgroundColor: 'rgba(255,27,141,0.1)',
  },
  favouriteIcon: {
    fontSize: 18,
  },
  favouriteText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  favouriteTextActive: {
    color: colors.pink,
  },
  dismissButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  dismissButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  dismissButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tapHint: {
    position: 'absolute',
    bottom: 40,
    color: colors.textMuted,
    fontSize: 12,
  },
});

export default DailyPowerMessage;

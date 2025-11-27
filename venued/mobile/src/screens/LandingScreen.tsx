import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { generateDemoData } from '../lib/demoData';
import { clearAllData } from '../lib/storage';

interface LandingScreenProps {
  navigation: any;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const handleTryDemo = async () => {
    await generateDemoData();
    navigation.replace('Main');
  };

  const handleStartFresh = async () => {
    await clearAllData();
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={gradients.primary}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.header}>
            <Text style={styles.logo}>🎸</Text>
            <Text style={styles.title}>VENUED</Text>
            <Text style={styles.tagline}>Get VENUED. Get it Done.</Text>
          </View>

          {/* Subtitle */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Strategic project planning for ADHD brains who build like rockstars
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleTryDemo}>
              <LinearGradient
                colors={['#FFFFFF', '#F0F0F0']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Try Demo</Text>
                <Text style={styles.buttonSubtext}>Explore with sample data</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleStartFresh}>
              <View style={styles.buttonOutline}>
                <Text style={styles.buttonTextOutline}>Start Fresh</Text>
                <Text style={styles.buttonSubtextOutline}>Begin with a clean slate</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <Text style={styles.featureText}>⭐ Project Planning</Text>
            <Text style={styles.featureText}>👥 Task Management</Text>
            <Text style={styles.featureText}>📅 Timeline View</Text>
            <Text style={styles.featureText}>🧠 ADHD Support Tools</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: colors.text,
    marginTop: 10,
    fontWeight: '600',
    opacity: 0.9,
  },
  descriptionContainer: {
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.85,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonOutline: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.text,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.background,
  },
  buttonSubtext: {
    fontSize: 12,
    color: colors.background,
    marginTop: 4,
    opacity: 0.7,
  },
  buttonTextOutline: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  buttonSubtextOutline: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
    opacity: 0.7,
  },
  features: {
    marginTop: 50,
    gap: 12,
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
  },
});

export default LandingScreen;

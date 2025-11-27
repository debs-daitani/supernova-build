import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ConfettiPiece {
  x: number;
  y: number;
  rotation: Animated.Value;
  translateY: Animated.Value;
  translateX: Animated.Value;
  color: string;
  scale: number;
}

interface ConfettiCelebrationProps {
  active: boolean;
  onComplete?: () => void;
}

const COLORS = ['#FF1B8D', '#9D4EDD', '#39FF14', '#00D9FF', '#FFB800'];
const CONFETTI_COUNT = 50;

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ active, onComplete }) => {
  const confettiPieces = useRef<ConfettiPiece[]>([]);

  useEffect(() => {
    // Initialize confetti pieces
    confettiPieces.current = Array.from({ length: CONFETTI_COUNT }, () => ({
      x: Math.random() * width,
      y: -20,
      rotation: new Animated.Value(0),
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      scale: 0.5 + Math.random() * 0.5,
    }));
  }, []);

  useEffect(() => {
    if (active) {
      // Animate all pieces
      const animations = confettiPieces.current.map((piece) => {
        return Animated.parallel([
          Animated.timing(piece.translateY, {
            toValue: height + 100,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(piece.translateX, {
            toValue: (Math.random() - 0.5) * 100,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotation, {
            toValue: Math.random() * 720 - 360,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.stagger(20, animations).start(() => {
        // Reset animations
        confettiPieces.current.forEach((piece) => {
          piece.translateY.setValue(0);
          piece.translateX.setValue(0);
          piece.rotation.setValue(0);
        });
        onComplete?.();
      });
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.current.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              backgroundColor: piece.color,
              left: piece.x,
              top: piece.y,
              transform: [
                { translateY: piece.translateY },
                { translateX: piece.translateX },
                { rotate: piece.rotation.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ['-360deg', '360deg'],
                  })
                },
                { scale: piece.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});

export default ConfettiCelebration;

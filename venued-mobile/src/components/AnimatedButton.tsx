import React, { useRef } from 'react';
import {
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  Animated,
} from 'react-native';

interface AnimatedButtonProps {
  onPress?: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  activeOpacity?: number;
  scaleValue?: number;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  onLongPress,
  children,
  style,
  disabled = false,
  activeOpacity = 0.9,
  scaleValue = 0.95,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: scaleValue,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled}
      style={disabled ? styles.disabled : undefined}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});

export default AnimatedButton;

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, Text } from 'react-native';
import { colors } from '../theme/colors';

interface AnimatedCheckboxProps {
  checked: boolean;
  size?: number;
  color?: string;
}

const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  size = 24,
  color = colors.pink,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    if (checked) {
      // Pop animation when checking
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 300,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(fillAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(fillAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [checked]);

  const backgroundColor = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', color],
  });

  const checkmarkOpacity = fillAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size * 0.25,
            borderColor: color,
            backgroundColor,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.checkmark,
            {
              fontSize: size * 0.6,
              opacity: checkmarkOpacity,
            },
          ]}
        >
          ✓
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.text,
    fontWeight: '700',
  },
});

export default AnimatedCheckbox;

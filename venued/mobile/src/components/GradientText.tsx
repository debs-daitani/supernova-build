import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { gradients } from '../theme/colors';

interface GradientTextProps extends TextProps {
  children: React.ReactNode;
  gradient?: readonly [string, string, ...string[]];
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  style,
  gradient = gradients.primary,
  ...props
}) => {
  return (
    <MaskedView
      maskElement={
        <Text {...props} style={[styles.text, style]}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={[...gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text {...props} style={[styles.text, style, styles.transparent]}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: '700',
  },
  transparent: {
    opacity: 0,
  },
});

export default GradientText;

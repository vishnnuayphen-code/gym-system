import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { nebulaGold } from '../../theme/nebulaGold';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  onPress?: () => void;
  goldBorder?: boolean;
}

/**
 * TripGlide Card - Pure white, soft shadows, high radius.
 */
export const GlassCard: React.FC<GlassCardProps> = ({ children, style, containerStyle, onPress, goldBorder }) => {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const CardContent = (
    <View style={[styles.card, nebulaGold.colors.shadow.light, style]}>
      <View style={[
        styles.container,
        containerStyle
      ]}>
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={handlePress}>
        {CardContent}
      </Pressable>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: nebulaGold.borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEBF0',
    overflow: 'visible', // To show shadow correctly
  },
  container: {
    padding: nebulaGold.spacing.lg,
    borderRadius: nebulaGold.borderRadius.lg,
    overflow: 'hidden',
  },
});

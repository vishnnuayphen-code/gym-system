import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { nebulaGold } from '../../theme/nebulaGold';

interface StatBadgeProps {
  value: string | number;
  label: string;
  style?: ViewStyle;
  color?: string;
  backgroundColor?: string;
}

export const StatBadge: React.FC<StatBadgeProps> = ({ value, label, style, color, backgroundColor }) => {
  return (
    <View style={[styles.container, backgroundColor ? { backgroundColor, borderColor: color } : null, style]}>
      <Text style={[styles.text, color ? { color } : null]}>
        {label ? `${value} ${label}` : value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    borderRadius: nebulaGold.borderRadius.pill,
    paddingHorizontal: nebulaGold.spacing.md,
    paddingVertical: nebulaGold.spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    alignSelf: 'flex-start',
  },
  text: {
    color: nebulaGold.colors.gold.primary,
    ...nebulaGold.typography.label,
    fontSize: 12,
  },
});

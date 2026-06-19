import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { nebulaGold } from '../../theme/nebulaGold';
import { AlertCircle } from 'lucide-react-native';

interface ErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.content}>
        <AlertCircle color={nebulaGold.colors.status.danger} size={32} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    borderLeftColor: nebulaGold.colors.status.danger,
    marginVertical: 20,
    marginHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  message: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.status.danger,
    marginLeft: 16,
    flex: 1,
  },
});

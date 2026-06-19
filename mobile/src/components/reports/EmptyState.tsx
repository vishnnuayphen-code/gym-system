import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <View style={{
      backgroundColor: '#12121A',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.06)',
      padding: 28,
      alignItems: 'center',
      gap: 12,
    }}>
      {icon}
      <Text style={{ fontSize: 13, color: '#9E9A8E', textAlign: 'center', lineHeight: 20 }}>
        {message}
      </Text>
    </View>
  );
}

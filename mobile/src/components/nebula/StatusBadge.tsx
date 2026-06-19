import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { nebulaGold } from '../../theme/nebulaGold';

interface StatusBadgeProps {
  status: string;
  small?: boolean;
}

/**
 * TripGlide Status Badge - Clean iOS-style semantic coloring.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, small = false }) => {
  const config: Record<string, { bg: string; border: string; text: string; label: string }> = {
    ACTIVE:       { bg: '#E3FBE9', border: '#D0F5D9', text: '#34C759', label: 'Active' },
    EXPIRING:     { bg: '#FFF1E0', border: '#FFE5C5', text: '#FF9500', label: 'Expiring' },
    EXPIRED:      { bg: '#FFEBEA', border: '#FFD7D5', text: '#FF3B30', label: 'Expired' },
    NO_PLAN:      { bg: '#F2F2F7', border: '#EBEBF0', text: '#8E8E93', label: 'No Plan' },
    SCHEDULED:    { bg: '#E5F1FF', border: '#CCE3FF', text: '#007AFF', label: 'Scheduled' },
    IN_PROGRESS:  { bg: '#FFF1E0', border: '#FFE5C5', text: '#FF9500', label: 'In Progress' },
    COMPLETED:    { bg: '#E3FBE9', border: '#D0F5D9', text: '#34C759', label: 'Completed' },
    CANCELLED:    { bg: '#FFEBEA', border: '#FFD7D5', text: '#FF3B30', label: 'Cancelled' },
    MAINTENANCE:  { bg: '#FFF1E0', border: '#FFE5C5', text: '#FF9500', label: 'Maintenance' },
    RETIRED:      { bg: '#F2F2F7', border: '#EBEBF0', text: '#8E8E93', label: 'Retired' },
  };

  const c = config[status] ?? config['NO_PLAN'];

  return (
    <View style={[
      styles.badge, 
      { backgroundColor: c.bg, borderColor: c.border },
      small && styles.smallBadge
    ]}>
      <Text style={[
        styles.text, 
        { color: c.text },
        small && styles.smallText
      ]}>
        {c.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  smallText: {
    fontSize: 10,
  },
});

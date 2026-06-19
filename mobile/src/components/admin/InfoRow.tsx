import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface InfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
  multiline?: boolean;
  mono?: boolean;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  isLast = false,
  multiline = false,
  mono = false,
}) => {
  return (
    <View style={[
      styles.row,
      multiline ? styles.rowMultiline : styles.rowStandard,
      !isLast && styles.border
    ]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[
        styles.value,
        mono && styles.valueMono,
        multiline ? styles.valueMultiline : styles.valueStandard,
      ]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowStandard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowMultiline: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 4,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '700',
  },
  valueStandard: {
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  valueMultiline: {
    textAlign: 'left',
  },
  valueMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

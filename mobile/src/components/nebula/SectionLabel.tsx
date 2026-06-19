import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { nebulaGold } from '../../theme/nebulaGold';

interface SectionLabelProps {
  label: string;
  style?: ViewStyle;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ label, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.bar} />
      <Text style={styles.text}>{label.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: nebulaGold.spacing.lg,
    paddingHorizontal: nebulaGold.spacing.lg,
  },
  bar: {
    width: 3,
    height: 18,
    backgroundColor: nebulaGold.colors.gold.primary,
    borderRadius: nebulaGold.borderRadius.pill,
    marginRight: nebulaGold.spacing.md,
  },
  text: {
    ...nebulaGold.typography.label,
    color: nebulaGold.colors.text.secondary,
    letterSpacing: 1.5,
  },
});

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { nebulaGold } from '../../theme/nebulaGold';

interface OptionCardProps {
  icon?: string | React.ComponentType<any>;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}

export const OptionCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  selected, 
  onPress 
}: OptionCardProps) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.97, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      activeOpacity={0.9}
      style={styles.touchable}
    >
      <Animated.View 
        style={[
          styles.container,
          selected && styles.selectedContainer,
          animatedStyle
        ]}
      >
        <View style={[styles.iconContainer, selected && styles.selectedIconContainer]}>
          {typeof Icon === 'string' ? (
            <Text style={styles.emoji}>{Icon}</Text>
          ) : Icon ? (
            <Icon size={24} color={selected ? nebulaGold.colors.gold.primary : nebulaGold.colors.text.secondary} />
          ) : null}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {selected && (
          <View style={styles.checkmark}>
            <Check size={12} color={nebulaGold.colors.background.primary} />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 12,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: nebulaGold.colors.background.secondary,
    borderWidth: 1,
    borderColor: nebulaGold.colors.background.tertiary,
    borderRadius: nebulaGold.borderRadius.lg,
  },
  selectedContainer: {
    borderColor: nebulaGold.colors.gold.primary + '80', // gold.border
    backgroundColor: nebulaGold.colors.gold.primary + '15', // gold.muted
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: nebulaGold.borderRadius.md,
    backgroundColor: nebulaGold.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  selectedIconContainer: {
    backgroundColor: nebulaGold.colors.gold.primary + '20',
  },
  emoji: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...nebulaGold.typography.label,
    color: nebulaGold.colors.text.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: nebulaGold.colors.gold.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

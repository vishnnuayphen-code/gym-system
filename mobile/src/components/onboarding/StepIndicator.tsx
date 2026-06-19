import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  useSharedValue,
  withSequence,
  interpolate
} from 'react-native-reanimated';
import { nebulaGold } from '../../theme/nebulaGold';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <View key={i} style={styles.dotContainer}>
              {isActive && (
                <Animated.View 
                  style={[
                    styles.pulseRing,
                    useAnimatedStyle(() => ({
                      transform: [{ scale: pulse.value }],
                      opacity: interpolate(pulse.value, [1, 1.3], [0.6, 0])
                    }))
                  ]} 
                />
              )}
              <View 
                style={[
                  styles.dot,
                  isActive && styles.activeDot,
                  isCompleted && styles.completedDot,
                  !isActive && !isCompleted && styles.inactiveDot
                ]} 
              />
            </View>
          );
        })}
      </View>

      <View style={styles.barTrack}>
        <Animated.View 
          style={[
            styles.barFill,
            { width: `${progress}%` }
          ]} 
        />
      </View>

      <Text style={styles.caption}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: nebulaGold.spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    height: 20,
  },
  dotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: nebulaGold.colors.gold.primary,
    zIndex: 2,
  },
  completedDot: {
    backgroundColor: nebulaGold.colors.gold.primary,
  },
  inactiveDot: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: nebulaGold.colors.background.tertiary,
  },
  pulseRing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: nebulaGold.colors.gold.primary,
  },
  barTrack: {
    width: '100%',
    height: 4,
    backgroundColor: nebulaGold.colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: nebulaGold.colors.gold.primary,
  },
  caption: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
  },
});

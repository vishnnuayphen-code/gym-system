import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming, 
  withDelay,
  withSequence,
  interpolate,
  Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { nebulaGold } from '../../theme/nebulaGold';
import { GoldButton } from '../../components/nebula/GoldButton';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CompletionStepProps {
  onComplete: () => void;
}

export const CompletionStep = ({ onComplete }: CompletionStepProps) => {
  const { user } = useAuthStore();
  const onboardingData = useOnboardingStore();
  const [status, setStatus] = useState<'animating'|'submitting'|'success'|'error'>('animating');

  const circleProgress = useSharedValue(0);
  const checkProgress = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Start animation
    circleProgress.value = withTiming(1, { duration: 600, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) });
    checkProgress.value = withDelay(600, withTiming(1, { duration: 400 }));
    
    // Scale pulse and haptic
    setTimeout(() => {
      scale.value = withSequence(
        withTiming(1.08, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      opacity.value = withTiming(1, { duration: 800 });
      setStatus('submitting');
      submitProfile();
    }, 1100);
  }, []);

  const submitProfile = async () => {
    if (!user?.id) return;
    try {
      let mappedGoal = 'GENERAL';
      if (onboardingData.primaryGoal === 'build_muscle') mappedGoal = 'MUSCLE_GAIN';
      if (onboardingData.primaryGoal === 'lose_weight') mappedGoal = 'WEIGHT_LOSS';
      if (onboardingData.primaryGoal === 'improve_fitness') mappedGoal = 'ENDURANCE';

      const payload = {
        name: `${onboardingData.firstName || ''} ${onboardingData.lastName || ''}`.trim(),
        dateOfBirth: onboardingData.dateOfBirth,
        emergencyContactName: onboardingData.emergencyContactName,
        emergencyContactPhone: onboardingData.emergencyContactPhone,
        height: onboardingData.heightCm,
        weight: onboardingData.weightKg,
        fitnessGoal: mappedGoal,
        profilePhotoUrl: onboardingData.photoUri, 
      };

      await api.put('/trainees/me', payload);
      await SecureStore.setItemAsync(`onboarding_complete_${user.id}`, 'true');
      setStatus('success');
    } catch (error) {
       console.error("Submission failed", error);
       setStatus('error');
    }
  };

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(circleProgress.value, [0, 1], [314, 0]),
  }));

  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(checkProgress.value, [0, 1], [50, 0]),
  }));

  const animatedScaleStyle = useAnimatedProps(() => ({
    transform: [{ scale: scale.value }],
  } as any));

  const textStyle = {
    opacity: opacity.value,
    transform: [{ translateY: interpolate(opacity.value, [0, 1], [20, 0]) }],
  } as any;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animationContainer, animatedScaleStyle]}>
        <Svg width="120" height="120" viewBox="0 0 120 120">
          <AnimatedCircle
            cx="60"
            cy="60"
            r="50"
            stroke={nebulaGold.colors.gold.primary}
            strokeWidth="6"
            fill="none"
            strokeDasharray="314"
            animatedProps={circleProps}
            strokeLinecap="round"
          />
          <AnimatedPath
            d="M35 60 L53 78 L85 45"
            stroke={nebulaGold.colors.gold.primary}
            strokeWidth="8"
            fill="none"
            strokeDasharray="50"
            animatedProps={checkProps}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.heading}>You're all set.</Text>
        <Text style={styles.body}>
          Your profile is ready. Let's start building something great.
        </Text>

        <View style={styles.spacer} />

        {status === 'submitting' && (
           <View style={styles.loadingRow}>
             <ActivityIndicator color={nebulaGold.colors.gold.primary} size="small" />
             <Text style={styles.loadingText}>Saving your profile...</Text>
           </View>
        )}

        {status === 'error' && (
           <GoldButton 
             title="Retry Submission" 
             variant="ghost"
             onPress={submitProfile}
             style={styles.retryButton}
           />
        )}

        <GoldButton 
          title="Enter the Gym" 
          onPress={onComplete}
          style={styles.button}
          disabled={status !== 'success'}
          loading={status === 'submitting'}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  animationContainer: {
    marginBottom: 48,
  },
  textContainer: {
    alignItems: 'center',
  },
  heading: {
    ...nebulaGold.typography.heading1,
    color: nebulaGold.colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '800',
  },
  body: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  spacer: {
    height: 60,
  },
  button: {
    width: '100%',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  loadingText: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
  },
  retryButton: {
    marginBottom: 12,
  },
});

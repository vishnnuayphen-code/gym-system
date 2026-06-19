import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { nebulaGold } from '../../theme/nebulaGold';
import { GoldButton } from '../../components/nebula/GoldButton';
import { useAuthStore } from '../../../store/authStore';

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  const { user } = useAuthStore();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 800 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleBegin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onNext();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.logoText}>FitCore</Text>
        
        <View style={styles.rule} />
        
        <Text style={styles.heading}>
          Welcome, {user?.name?.split(' ')[0] || 'Trainee'}.
        </Text>
        
        <Text style={styles.body}>
          Let's set up your profile so we can build the perfect training experience for you.
        </Text>

        <View style={styles.spacer} />

        <GoldButton 
          title="Let's Begin" 
          onPress={handleBegin}
          style={styles.button}
        />
        
        <Text style={styles.footerCaption}>
          Takes about 3 minutes
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: nebulaGold.colors.gold.primary,
    letterSpacing: -2,
    marginBottom: 16,
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  rule: {
    width: 120,
    height: 1,
    backgroundColor: nebulaGold.colors.gold.primary,
    opacity: 0.5,
    marginBottom: 32,
  },
  heading: {
    ...nebulaGold.typography.heading1,
    color: nebulaGold.colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  spacer: {
    height: 80,
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
  footerCaption: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    opacity: 0.5,
  },
});

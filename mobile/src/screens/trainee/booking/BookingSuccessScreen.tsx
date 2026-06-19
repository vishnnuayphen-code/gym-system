import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInUp, 
  useAnimatedProps, 
  useSharedValue, 
  withDelay, 
  withTiming,
  withSequence,
  Easing,
  interpolate
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { nebulaGold } from '../../../theme/nebulaGold';
import { useBookingStore } from '../../../stores/bookingStore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const BookingSuccessScreen = () => {
  const router = useRouter();
  const { selectedCoach, selectedDate, selectedSlot, selectedSessionType, reset } = useBookingStore();
  
  const circleProgress = useSharedValue(0);
  const checkProgress = useSharedValue(0);

  useEffect(() => {
    circleProgress.value = withTiming(1, { duration: 600, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) });
    checkProgress.value = withDelay(600, withTiming(1, { duration: 400 }));
    
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1000);
  }, []);

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(circleProgress.value, [0, 1], [314, 0]),
  }));

  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(checkProgress.value, [0, 1], [50, 0]),
  }));

  const handleDone = (target: '/(trainee)/sessions' | '/(trainee)/home') => {
    reset();
    router.replace(target);
  };

  const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }) : '';

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn} style={styles.animationContainer}>
        <Svg width="120" height="120" viewBox="0 0 120 120">
          <AnimatedCircle
            cx="60"
            cy="60"
            r="50"
            stroke="#000"
            strokeWidth="6"
            fill="none"
            strokeDasharray="314"
            animatedProps={circleProps}
            strokeLinecap="round"
          />
          <AnimatedPath
            d="M35 60 L53 78 L85 45"
            stroke="#000"
            strokeWidth="8"
            fill="none"
            strokeDasharray="50"
            animatedProps={checkProps}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(800)} style={styles.textContainer}>
        <Text style={styles.heading}>Session Booked!</Text>
        <Text style={styles.body}>
          {selectedCoach ? `${selectedCoach.name} is expecting you` : 'Your gym session has been booked'} on {formattedDate} at {selectedSlot?.startTime}.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(1200)} style={styles.recapContainer}>
        <View style={styles.recapCard}>
          <View style={styles.recapGrid}>
            <View style={styles.recapItem}>
              <Text style={styles.recapLabel}>{selectedCoach ? 'COACH' : 'SESSION'}</Text>
              <Text style={styles.recapValue}>{selectedCoach ? selectedCoach.name : 'Gym Access'}</Text>
            </View>
            <View style={styles.recapItem}>
              <Text style={styles.recapLabel}>TYPE</Text>
              <Text style={styles.recapValue}>{selectedSessionType === 'PERSONAL_TRAINING' ? '1-on-1' : 'Group'}</Text>
            </View>
            <View style={styles.recapItem}>
              <Text style={styles.recapLabel}>DATE</Text>
              <Text style={styles.recapValue}>{formattedDate.split(', ')[1]}</Text>
            </View>
            <View style={styles.recapItem}>
              <Text style={styles.recapLabel}>TIME</Text>
              <Text style={styles.recapValue}>{selectedSlot?.startTime}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(1500)} style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryBtn}
          onPress={() => handleDone('/(trainee)/sessions')} 
        >
          <Text style={styles.primaryBtnText}>View My Sessions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.ghostBtn}
          onPress={() => handleDone('/(trainee)/home')} 
        >
          <Text style={styles.ghostBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 24 },
  animationContainer: { marginBottom: 32 },
  textContainer: { alignItems: 'center', marginBottom: 40 },
  heading: { fontSize: 32, fontWeight: '900', color: '#000', marginBottom: 12, letterSpacing: -1 },
  body: { fontSize: 16, color: '#8E8E93', textAlign: 'center', maxWidth: 280, fontWeight: '600', lineHeight: 22 },
  recapContainer: { width: '100%', marginBottom: 48 },
  recapCard: { padding: 24, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15 },
  recapGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  recapItem: { width: '50%', padding: 8 },
  recapLabel: { fontSize: 10, fontWeight: '800', color: '#8E8E93', marginBottom: 4, letterSpacing: 0.5 },
  recapValue: { fontSize: 15, fontWeight: '900', color: '#000' },
  footer: { width: '100%', gap: 12 },
  primaryBtn: { width: '100%', height: 56, backgroundColor: '#000', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  ghostBtn: { width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { color: '#000', fontSize: 16, fontWeight: '800' }
});

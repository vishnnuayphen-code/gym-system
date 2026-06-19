import React, { useEffect } from 'react';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';

/**
 * TripGlide Attendance Skeleton - Light theme pulsing bar.
 */
export function AttendanceRowSkeleton() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View style={[{
      backgroundColor: '#F2F2F7',
      borderRadius: 16,
      height: 70,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#EBEBF0',
    }, style]} />
  );
}

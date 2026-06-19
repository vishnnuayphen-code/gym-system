import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';

export function SkeletonRows({ count }: { count: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 600 }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View key={i} style={[{
          backgroundColor: '#12121A',
          borderRadius: 12,
          height: 80,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
        }, style]} />
      ))}
    </View>
  );
}

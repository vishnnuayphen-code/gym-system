import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { nebulaGold } from '../../theme/nebulaGold';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.skeleton, 
        { width, height, borderRadius, opacity }, 
        style
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: nebulaGold.colors.gold.primary,
  },
});

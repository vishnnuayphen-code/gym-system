import React from 'react';
import { View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
  gradientColors?: string[];
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  intensity = 'medium', 
  className = '', 
  gradientColors,
  style,
  ...props 
}) => {
  const intensities = {
    low: 'bg-surface',
    medium: 'bg-surface-glass',
    high: 'bg-white/10',
  };

  return (
    <View 
      className={`${intensities[intensity]} rounded-3xl overflow-hidden border border-surface-border ${className}`}
      style={style}
      {...props}
    >
      <LinearGradient
        colors={(gradientColors as any) || ['rgba(245, 158, 11, 0.03)', 'transparent']}
        className="absolute inset-0"
      />
      {children}
    </View>
  );
};

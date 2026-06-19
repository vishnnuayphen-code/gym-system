import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { nebulaGold } from '../../theme/nebulaGold';

interface AvatarRingProps {
  imageUri?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const AvatarRing: React.FC<AvatarRingProps> = ({ 
  imageUri, 
  name, 
  size = 'md' 
}) => {
  const dimensions = {
    xs: 32,
    sm: 40,
    md: 56,
    lg: 80,
  }[size];

  const fontSize = {
    xs: 12,
    sm: 14,
    md: 18,
    lg: 24,
  }[size];

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={[
      styles.ring, 
      { width: dimensions + 4, height: dimensions + 4, borderRadius: (dimensions + 4) / 2 }
    ]}>
      <View style={[
        styles.container, 
        { width: dimensions, height: dimensions, borderRadius: dimensions / 2 }
      ]}>
        {imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={{ width: dimensions, height: dimensions, borderRadius: dimensions / 2 }} 
          />
        ) : (
          <View style={[
            styles.initialsContainer, 
            { width: dimensions, height: dimensions, borderRadius: dimensions / 2 }
          ]}>
            <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: nebulaGold.colors.gold.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: nebulaGold.colors.background.tertiary,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsContainer: {
    backgroundColor: nebulaGold.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: nebulaGold.colors.gold.primary,
    fontWeight: '700',
  },
});

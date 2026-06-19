import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { nebulaGold } from '../../theme/nebulaGold';

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * TripGlide Button - Black pill style, white text.
 */
export const GoldButton: React.FC<GoldButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  leftIcon,
  style,
  textStyle
}) => {
  const handlePress = () => {
    if (loading || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButton;
      case 'ghost':
        return styles.ghostButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={loading || disabled}
      style={[getButtonStyle(), disabled && { opacity: 0.5 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#000000'} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {leftIcon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    height: 56,
    borderRadius: 28, // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  outlineButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
    paddingHorizontal: 32,
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  ghostButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { nebulaGold } from '../../theme/nebulaGold';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightSlot?: React.ReactNode;
  transparent?: boolean;
}

/**
 * TripGlide Header - Minimalist, bold, supporting circular floating buttons.
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack,
  onBackPress,
  rightSlot,
  transparent = false
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container, 
      { paddingTop: insets.top + 16 },
      transparent && styles.transparent
    ]}>
      <View style={styles.headerRow}>
        {/* Left slot: Back button as a floating circle */}
        <View style={styles.slot}>
          {showBack && (
            <TouchableOpacity
              onPress={() => onBackPress ? onBackPress() : router.back()}
              style={[styles.circleButton, nebulaGold.colors.shadow.light]}
            >
              <ArrowLeft color="#000000" size={22} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Bold Title + Subtitle */}
        <View style={styles.centerSlot}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>

        {/* Right slot: Custom action as a floating circle if it's an icon */}
        <View style={styles.slot}>
          {rightSlot && (
            <View style={styles.rightContainer}>
              {rightSlot}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0, // Clean no-border look
  },
  transparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slot: {
    width: 48,
    height: 48,
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    ...nebulaGold.typography.heading3,
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...nebulaGold.typography.caption,
    color: '#8E8E93',
    marginTop: 2,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  rightContainer: {
    alignItems: 'flex-end',
  }
});

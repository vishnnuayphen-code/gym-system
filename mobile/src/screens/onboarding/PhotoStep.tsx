import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue 
} from 'react-native-reanimated';
import { Camera, Edit2 } from 'lucide-react-native';
import { nebulaGold } from '../../theme/nebulaGold';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { GoldButton } from '../../components/nebula/GoldButton';
import { useOnboardingStore } from '../../stores/onboardingStore';

interface PhotoStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export const PhotoStep = ({ onNext, onSkip }: PhotoStepProps) => {
  const { photoUri, updateData } = useOnboardingStore();
  const borderOpacity = useSharedValue(photoUri ? 1 : 0.3);

  const processImage = async (uri: string) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800, height: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      updateData({ photoUri: result.uri });
      borderOpacity.value = withTiming(1, { duration: 500 });
    } catch (error) {
       console.error("Image processing failed", error);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderStyle: photoUri ? 'solid' : 'dashed',
    borderColor: nebulaGold.colors.gold.primary,
    opacity: borderOpacity.value,
  }));

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={8}
      title="Add your photo"
      subtitle="Put a face to your name."
      onNext={onNext}
      onSkip={onSkip}
      skippable={true}
    >
      <View style={styles.container}>
        <View style={styles.avatarWrapper}>
          <Animated.View style={[styles.avatarCircle, animatedBorderStyle]}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.image} />
            ) : (
              <Camera size={32} color={nebulaGold.colors.gold.primary} />
            )}
            
            {photoUri && (
              <View style={styles.editBadge}>
                <Edit2 size={12} color={nebulaGold.colors.background.primary} />
              </View>
            )}
          </Animated.View>
        </View>

        <View style={styles.buttonRow}>
          <GoldButton 
            title="Take Photo" 
            variant="outline"
            onPress={takePhoto}
            style={styles.halfButton}
          />
          <GoldButton 
            title="Choose Library" 
            variant="outline"
            onPress={pickImage}
            style={styles.halfButton}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  avatarWrapper: {
    marginBottom: 40,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: nebulaGold.colors.background.tertiary,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: nebulaGold.colors.gold.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: nebulaGold.colors.background.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  halfButton: {
    flex: 1,
  },
});

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nebulaGold } from '../../theme/nebulaGold';
import { StepIndicator } from './StepIndicator';
import { GoldButton } from '../nebula/GoldButton';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useOnboardingStore } from '../../stores/onboardingStore';

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onSkip?: () => void;
  isNextDisabled?: boolean;
  skippable?: boolean;
  showStepIndicator?: boolean;
}

export const OnboardingLayout = ({
  currentStep,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  onSkip,
  isNextDisabled = false,
  skippable = false,
  showStepIndicator = true,
}: OnboardingLayoutProps) => {
  const { setStep } = useOnboardingStore();

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {showStepIndicator && (
          <View style={styles.header}>
            <View style={styles.headerRow}>
              {currentStep > 1 ? (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <ChevronLeft size={24} color={nebulaGold.colors.text.primary} />
                </TouchableOpacity>
              ) : (
                <View style={styles.backButtonPlaceholder} />
              )}
              <View style={styles.stepIndicatorContainer}>
                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
              </View>
              <View style={styles.backButtonPlaceholder} />
            </View>
          </View>
        )}

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>

          <View style={styles.content}>
            {children}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <GoldButton 
            title="Next" 
            onPress={onNext}
            variant="primary"
            style={[
              styles.nextButton,
              isNextDisabled ? styles.disabledButton : undefined
            ] as any}
          />
          
          {skippable && onSkip && (
            <GoldButton 
              title="Skip for now" 
              onPress={onSkip}
              variant="ghost"
              style={styles.skipButton}
              textStyle={styles.skipText}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    backgroundColor: nebulaGold.colors.background.primary,
    zIndex: 10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    width: 40,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  stepIndicatorContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    ...nebulaGold.typography.heading1,
    color: nebulaGold.colors.text.primary,
    fontWeight: '800',
  },
  subtitle: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.text.secondary,
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 8 : 24,
    paddingTop: 16,
    backgroundColor: nebulaGold.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: nebulaGold.colors.background.secondary,
  },
  nextButton: {
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  skipButton: {
    marginTop: 8,
    height: 40,
  },
  skipText: {
    color: nebulaGold.colors.text.secondary,
    ...nebulaGold.typography.label,
  },
});

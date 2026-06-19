import React from 'react';
import { WelcomeStep } from '../screens/onboarding/WelcomeStep';
import { PhotoStep } from '../screens/onboarding/PhotoStep';
import { PersonalInfoStep } from '../screens/onboarding/PersonalInfoStep';
import { MetricsStep } from '../screens/onboarding/MetricsStep';
import { GoalsStep } from '../screens/onboarding/GoalsStep';
import { ExperienceStep } from '../screens/onboarding/ExperienceStep';
import { MembershipStep } from '../screens/onboarding/MembershipStep';
import { CompletionStep } from '../screens/onboarding/CompletionStep';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useRouter } from 'expo-router';

export const OnboardingNavigator = () => {
  const { currentStep, setStep, reset } = useOnboardingStore();
  const router = useRouter();

  const handleNext = (nextStep: number) => {
    setStep(nextStep);
  };

  const handleFinish = () => {
    reset();
    router.replace('/(trainee)/home');
  };

  // State-based rendering to avoid Expo Router / React Navigation Stack conflicts
  switch (currentStep) {
    case 1:
      return <WelcomeStep onNext={() => handleNext(2)} />;
    case 2:
      return <PhotoStep onNext={() => handleNext(3)} onSkip={() => handleNext(3)} />;
    case 3:
      return <PersonalInfoStep onNext={() => handleNext(4)} />;
    case 4:
      return <MetricsStep onNext={() => handleNext(5)} onSkip={() => handleNext(5)} />;
    case 5:
      return <GoalsStep onNext={() => handleNext(6)} />;
    case 6:
      return <ExperienceStep onNext={() => handleNext(7)} />;
    case 7:
      return <MembershipStep onNext={() => handleNext(8)} />;
    case 8:
      return <CompletionStep onComplete={handleFinish} />;
    default:
      return <WelcomeStep onNext={() => handleNext(2)} />;
  }
};

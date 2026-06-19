import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { nebulaGold } from '../../theme/nebulaGold';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { OptionCard } from '../../components/onboarding/OptionCard';
import { SectionLabel } from '../../components/nebula/SectionLabel';
import { GoldButton } from '../../components/nebula/GoldButton';
import { useOnboardingStore } from '../../stores/onboardingStore';

interface ExperienceStepProps {
  onNext: () => void;
}

const EXPERIENCE_LEVELS = [
  { id: 'beginner', title: 'Beginner', subtitle: 'Less than 6 months of training', icon: '🌱' },
  { id: 'intermediate', title: 'Intermediate', subtitle: '6 months to 2 years of training', icon: '📈' },
  { id: 'advanced', title: 'Advanced', subtitle: 'More than 2 years of consistent training', icon: '🏆' },
  { id: 'athlete', title: 'Athlete', subtitle: 'Competitive or professional level', icon: '🎖️' },
];

const WORKOUT_TIMES = [
  { id: 'Morning', title: 'Morning', icon: '🌅' },
  { id: 'Afternoon', title: 'Afternoon', icon: '☀️' },
  { id: 'Evening', title: 'Evening', icon: '🌙' },
];

export const ExperienceStep = ({ onNext }: ExperienceStepProps) => {
  const { 
    experienceLevel, workoutsPerWeek, preferredWorkoutTime,
    updateData 
  } = useOnboardingStore();

  const handleLevelSelect = (id: string) => {
    updateData({ experienceLevel: id });
  };

  const handleTimeSelect = (id: string) => {
    updateData({ preferredWorkoutTime: id });
  };

  const adjustWorkouts = (delta: number) => {
    const newValue = Math.min(Math.max(workoutsPerWeek + delta, 1), 7);
    updateData({ workoutsPerWeek: newValue });
  };

  const validate = () => {
    return experienceLevel && workoutsPerWeek && preferredWorkoutTime;
  };

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={8}
      title="Your experience"
      subtitle="Be honest — there's no wrong answer."
      onNext={onNext}
      isNextDisabled={!validate()}
    >
      <View style={styles.container}>
        <View style={styles.list}>
          {EXPERIENCE_LEVELS.map((level) => (
            <OptionCard 
              key={level.id}
              title={level.title}
              subtitle={level.subtitle}
              icon={level.icon}
              selected={experienceLevel === level.id}
              onPress={() => handleLevelSelect(level.id)}
            />
          ))}
        </View>

        <SectionLabel label="Training Preferences" />
        
        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Workouts per week</Text>
          <View style={styles.stepper}>
            <TouchableOpacity 
              onPress={() => adjustWorkouts(-1)} 
              style={styles.stepperButton}
            >
              <Minus size={20} color={nebulaGold.colors.gold.primary} />
            </TouchableOpacity>
            
            <Text style={styles.stepperValue}>{workoutsPerWeek}</Text>
            
            <TouchableOpacity 
              onPress={() => adjustWorkouts(1)} 
              style={styles.stepperButton}
            >
              <Plus size={20} color={nebulaGold.colors.gold.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.timeGrid}>
          {WORKOUT_TIMES.map((time) => (
            <TouchableOpacity 
              key={time.id}
              onPress={() => handleTimeSelect(time.id)}
              style={[
                styles.timeCard,
                preferredWorkoutTime === time.id && styles.selectedTimeCard
              ]}
            >
              <Text style={styles.timeEmoji}>{time.icon}</Text>
              <Text style={[
                styles.timeTitle,
                preferredWorkoutTime === time.id && styles.selectedTimeTitle
              ]}>
                {time.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  list: {
    gap: 0,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  preferenceLabel: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.text.primary,
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: nebulaGold.borderRadius.pill,
    padding: 4,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: nebulaGold.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...nebulaGold.typography.heading2,
    color: nebulaGold.colors.gold.primary,
    marginHorizontal: 16,
    width: 20,
    textAlign: 'center',
  },
  timeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  timeCard: {
    flex: 1,
    height: 80,
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: nebulaGold.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTimeCard: {
    borderColor: nebulaGold.colors.gold.primary + '80',
    backgroundColor: nebulaGold.colors.gold.primary + '15',
  },
  timeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  timeTitle: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    fontWeight: '700',
  },
  selectedTimeTitle: {
    color: nebulaGold.colors.gold.primary,
  },
});

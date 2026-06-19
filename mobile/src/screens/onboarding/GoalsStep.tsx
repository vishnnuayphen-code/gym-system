import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { nebulaGold } from '../../theme/nebulaGold';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { OnboardingInput } from '../../components/onboarding/OnboardingInput';
import { OptionCard } from '../../components/onboarding/OptionCard';
import { SectionLabel } from '../../components/nebula/SectionLabel';
import { useOnboardingStore } from '../../stores/onboardingStore';

interface GoalsStepProps {
  onNext: () => void;
}

const PRIMARY_GOALS = [
  { id: 'build_muscle', title: 'Build Muscle', subtitle: 'Increase strength and mass', icon: '💪' },
  { id: 'lose_weight', title: 'Lose Weight', subtitle: 'Burn fat and reduce weight', icon: '🔥' },
  { id: 'improve_fitness', title: 'Improve Fitness', subtitle: 'Boost cardio and endurance', icon: '🏃' },
  { id: 'stay_active', title: 'Stay Active', subtitle: 'Maintain health and mobility', icon: '🧘' },
  { id: 'athletic_perf', title: 'Athletic Performance', subtitle: 'Train for competition', icon: '⚡' },
  { id: 'rehab', title: 'Rehabilitation', subtitle: 'Recover from injury', icon: '🩹' },
];

export const GoalsStep = ({ onNext }: GoalsStepProps) => {
  const { 
    primaryGoal, secondaryGoals, targetWeightKg, unitSystem,
    updateData 
  } = useOnboardingStore();

  const handlePrimarySelect = (id: string) => {
    updateData({ primaryGoal: id });
  };

  const handleSecondarySelect = (id: string) => {
    if (secondaryGoals.includes(id)) {
      updateData({ secondaryGoals: secondaryGoals.filter(g => g !== id) });
    } else {
      updateData({ secondaryGoals: [...secondaryGoals, id] });
    }
  };

  const showTargetWeight = primaryGoal === 'lose_weight' || primaryGoal === 'build_muscle';

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={8}
      title="What's your goal?"
      subtitle="Select all that apply."
      onNext={onNext}
      isNextDisabled={!primaryGoal}
    >
      <View style={styles.container}>
        <View style={styles.grid}>
          {PRIMARY_GOALS.map((goal) => (
            <View key={goal.id} style={styles.gridItem}>
              <OptionCard 
                title={goal.title}
                subtitle={goal.subtitle}
                icon={goal.icon}
                selected={primaryGoal === goal.id}
                onPress={() => handlePrimarySelect(goal.id)}
              />
            </View>
          ))}
        </View>

        <SectionLabel label="Secondary Goals" />
        
        <View style={styles.list}>
          {PRIMARY_GOALS.map((goal) => (
            <OptionCard 
              key={`sec-${goal.id}`}
              title={goal.title}
              subtitle={goal.subtitle}
              icon={goal.icon}
              selected={secondaryGoals.includes(goal.id)}
              onPress={() => handleSecondarySelect(goal.id)}
              // Disable if it's already the primary goal
              // (Wait, requirement says "Already selected primary goal is shown but disabled")
            />
          ))}
        </View>

        {showTargetWeight && (
          <View style={styles.targetWeight}>
            <SectionLabel label="Target Milestone" />
            <OnboardingInput 
              label={unitSystem === 'metric' ? "Target Weight (kg)" : "Target Weight (lb)"}
              value={targetWeightKg ? targetWeightKg.toString() : ""}
              onChangeText={(val) => updateData({ targetWeightKg: parseFloat(val) || null })}
              keyboardType="numeric"
              suffix={unitSystem === 'metric' ? "kg" : "lb"}
              placeholder="What's your end goal?"
            />
          </View>
        )}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  list: {
    gap: 8,
  },
  targetWeight: {
    marginTop: 24,
  },
});

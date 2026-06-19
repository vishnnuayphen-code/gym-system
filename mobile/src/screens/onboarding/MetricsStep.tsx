import React, { useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { nebulaGold } from '../../theme/nebulaGold';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { OnboardingInput } from '../../components/onboarding/OnboardingInput';
import { GlassCard } from '../../components/nebula/GlassCard';
import { useOnboardingStore } from '../../stores/onboardingStore';

interface MetricsStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export const MetricsStep = ({ onNext, onSkip }: MetricsStepProps) => {
  const { 
    heightCm, weightKg, bodyFatPercent, unitSystem,
    updateData 
  } = useOnboardingStore();

  const isMetric = unitSystem === 'metric';

  const toggleUnits = (system: 'metric' | 'imperial') => {
    if (system === unitSystem) return;
    
    // Convert values if they exist
    if (system === 'imperial') {
      const newHeight = heightCm ? heightCm / 2.54 : null;
      const newWeight = weightKg ? weightKg * 2.20462 : null;
      updateData({ unitSystem: 'imperial', heightCm: newHeight, weightKg: newWeight });
    } else {
      const newHeight = heightCm ? heightCm * 2.54 : null;
      const newWeight = weightKg ? weightKg / 2.20462 : null;
      updateData({ unitSystem: 'metric', heightCm: newHeight, weightKg: newWeight });
    }
  };

  const bmi = useMemo(() => {
    if (!heightCm || !weightKg) return null;
    
    let bmiValue;
    if (isMetric) {
      const heightInMeters = heightCm / 100;
      bmiValue = weightKg / (heightInMeters * heightInMeters);
    } else {
      bmiValue = (weightKg * 703) / (heightCm * heightCm);
    }
    return parseFloat(bmiValue.toFixed(1));
  }, [heightCm, weightKg, isMetric]);

  const bmiInfo = useMemo(() => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', color: nebulaGold.colors.status.warning, position: 15 };
    if (bmi < 25) return { label: 'Healthy', color: nebulaGold.colors.status.active, position: 40 };
    if (bmi < 30) return { label: 'Overweight', color: nebulaGold.colors.status.warning, position: 65 };
    return { label: 'Obese', color: nebulaGold.colors.status.danger, position: 90 };
  }, [bmi]);

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={8}
      title="Your measurements"
      subtitle="This helps us tailor your workout intensity."
      onNext={onNext}
      onSkip={onSkip}
      skippable={true}
    >
      <View style={styles.container}>
        <View style={styles.unitToggle}>
          <TouchableOpacity 
            onPress={() => toggleUnits('metric')}
            style={[styles.unitButton, isMetric && styles.activeUnitButton]}
          >
            <Text style={[styles.unitText, isMetric && styles.activeUnitText]}>Metric (kg/cm)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => toggleUnits('imperial')}
            style={[styles.unitButton, !isMetric && styles.activeUnitButton]}
          >
            <Text style={[styles.unitText, !isMetric && styles.activeUnitText]}>Imperial (lb/ft)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputs}>
          <OnboardingInput 
            label={isMetric ? "Height (cm)" : "Height (in)"}
            value={heightCm ? heightCm.toString() : ""}
            onChangeText={(val) => updateData({ heightCm: parseFloat(val) || null })}
            keyboardType="numeric"
            suffix={isMetric ? "cm" : "in"}
          />
          <OnboardingInput 
            label={isMetric ? "Weight (kg)" : "Weight (lb)"}
            value={weightKg ? weightKg.toString() : ""}
            onChangeText={(val) => updateData({ weightKg: parseFloat(val) || null })}
            keyboardType="numeric"
            suffix={isMetric ? "kg" : "lb"}
          />
          <View>
            <OnboardingInput 
              label="Body Fat %"
              value={bodyFatPercent ? bodyFatPercent.toString() : ""}
              onChangeText={(val) => updateData({ bodyFatPercent: parseFloat(val) || null })}
              keyboardType="numeric"
              suffix="%"
            />
            <Text style={styles.optionalHint}>Optional — estimate is fine</Text>
          </View>
        </View>

        {bmi && bmiInfo && (
          <GlassCard style={styles.bmiCard} goldBorder>
            <View style={styles.bmiHeader}>
              <View>
                <Text style={styles.bmiLabel}>BMI Index</Text>
                <Text style={[styles.bmiCategory, { color: bmiInfo.color }]}>{bmiInfo.label}</Text>
              </View>
              <Text style={styles.bmiValue}>{bmi}</Text>
            </View>
            
            <View style={styles.bmiScaleTrack}>
              <View style={[styles.bmiMarker, { left: `${bmiInfo.position}%` }]} />
              <View style={[styles.scaleSection, { flex: 18.5, backgroundColor: nebulaGold.colors.status.warning + '40' }]} />
              <View style={[styles.scaleSection, { flex: 6.5, backgroundColor: nebulaGold.colors.status.active + '40' }]} />
              <View style={[styles.scaleSection, { flex: 5, backgroundColor: nebulaGold.colors.status.warning + '40' }]} />
              <View style={[styles.scaleSection, { flex: 10, backgroundColor: nebulaGold.colors.status.danger + '40' }]} />
            </View>
          </GlassCard>
        )}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: nebulaGold.borderRadius.pill,
    padding: 4,
    marginBottom: 32,
  },
  unitButton: {
    flex: 1,
    height: 36,
    borderRadius: nebulaGold.borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeUnitButton: {
    backgroundColor: nebulaGold.colors.gold.primary,
  },
  unitText: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    fontWeight: '700',
  },
  activeUnitText: {
    color: nebulaGold.colors.background.primary,
  },
  inputs: {
    gap: 8,
  },
  optionalHint: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    marginTop: -12,
    marginBottom: 20,
    opacity: 0.6,
  },
  bmiCard: {
    marginTop: 20,
    backgroundColor: nebulaGold.colors.background.secondary + '80',
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bmiLabel: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bmiCategory: {
    ...nebulaGold.typography.heading3,
    fontWeight: '700',
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: '800',
    color: nebulaGold.colors.gold.primary,
  },
  bmiScaleTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: nebulaGold.colors.background.tertiary,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'visible',
  },
  scaleSection: {
    height: '100%',
  },
  bmiMarker: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: nebulaGold.colors.gold.primary,
    borderWidth: 2,
    borderColor: nebulaGold.colors.text.primary,
    zIndex: 10,
    transform: [{ translateX: -7 }],
  },
});

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Info } from 'lucide-react-native';
import { nebulaGold } from '../../theme/nebulaGold';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { GlassCard } from '../../components/nebula/GlassCard';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';

interface MembershipStepProps {
  onNext: () => void;
}

export const MembershipStep = ({ onNext }: MembershipStepProps) => {
  const { user } = useAuthStore();
  const { membershipPlan, updateData } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembership = async () => {
      if (!user?.id) return;
      try {
        const response = await api.get(`/memberships/trainee/${user.id}`);
        updateData({ membershipPlan: response.data });
      } catch (error) {
        console.log("No membership found or error fetching", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembership();
  }, [user?.id]);

  return (
    <OnboardingLayout
      currentStep={7}
      totalSteps={8}
      title="Your membership"
      subtitle="Here's what's included in your plan."
      onNext={onNext}
    >
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={nebulaGold.colors.gold.primary} size="large" />
            <Text style={styles.loadingText}>Fetching your plan...</Text>
          </View>
        ) : membershipPlan ? (
          <GlassCard style={styles.card} goldBorder>
            <Text style={styles.planName}>{membershipPlan.name || 'Premium Plan'}</Text>
            <View style={styles.divider} />
            
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Start Date</Text>
                <Text style={styles.value}>{membershipPlan.startDate || 'TBD'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>End Date</Text>
                <Text style={styles.value}>{membershipPlan.endDate || 'TBD'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Sessions</Text>
                <Text style={styles.value}>{membershipPlan.sessionsRemaining || 0} left</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Type</Text>
                <Text style={styles.value}>{membershipPlan.type || 'Standard'}</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
              <Text style={styles.progressLabel}>Active Membership</Text>
            </View>
          </GlassCard>
        ) : (
          <GlassCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Info size={24} color={nebulaGold.colors.gold.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>No plan assigned yet</Text>
                <Text style={styles.infoBody}>
                  Your gym admin will assign a membership plan to you. You can still complete setup.
                </Text>
              </View>
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
  loading: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
     ...nebulaGold.typography.caption,
     color: nebulaGold.colors.text.secondary,
     marginTop: 12,
  },
  card: {
    backgroundColor: nebulaGold.colors.background.secondary + '80',
    padding: 24,
  },
  planName: {
    ...nebulaGold.typography.heading2,
    color: nebulaGold.colors.gold.primary,
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: nebulaGold.colors.gold.primary,
    opacity: 0.2,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  gridItem: {
    width: '50%',
    marginBottom: 16,
  },
  label: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.text.primary,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: nebulaGold.colors.background.tertiary,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: nebulaGold.colors.gold.primary,
  },
  progressLabel: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.gold.primary,
    textAlign: 'center',
    fontWeight: '700',
  },
  infoCard: {
    borderLeftWidth: 4,
    borderLeftColor: nebulaGold.colors.accent.blue,
    backgroundColor: nebulaGold.colors.background.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    ...nebulaGold.typography.label,
    color: nebulaGold.colors.text.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoBody: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    lineHeight: 18,
  },
});

import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { CreditCard, CheckCircle, Info, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useApiCall } from '../../src/hooks/useApiCall';
import { membershipService } from '../../src/services/membershipService';
import { traineeService } from '../../src/services/traineeService';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { SkeletonRows } from '../../src/components/reports/SkeletonRows';
import { showToast } from '../../src/utils/toast';

export default function PlansScreen() {
  const router = useRouter();
  const [traineeId, setTraineeId] = useState<string | null>(null);

  // Get traineeId from API — most reliable approach
  useEffect(() => {
    traineeService.getMe()
      .then((profile: any) => {
        // Log once to confirm field name, remove after fixed
        console.log('MY PROFILE RESPONSE:', JSON.stringify(profile, null, 2));
        const id = profile?.id ?? profile?.traineeId ?? profile?.userId;
        setTraineeId(id ? String(id) : null);
      })
      .catch(e => {
        console.error('getMe error:', e);
        showToast('Failed to load profile. Please log in again.', 'error');
      });
  }, []);

  const { data: plansData, loading, error } = useApiCall(
    () => membershipService.getPlans(),
    []
  );

  const { data: currentMembershipData } = useApiCall(
    () => membershipService.getMyMembership(),
    []
  );

  const plans = plansData || [];
  const currentMembership = currentMembershipData?.data || currentMembershipData;

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Membership Plans"
        showBack
        onBackPress={() => router.back()}
        subtitle="Choose a plan that works for you"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current plan banner */}
        {currentMembership?.status === 'ACTIVE' && (
          <View style={styles.activePlanBanner}>
            <CheckCircle size={16} color="#2ECC71" />
            <Text style={styles.activePlanText}>
              You have an active plan: {currentMembership.planName}
              {' '}({currentMembership.daysRemaining} days left)
            </Text>
          </View>
        )}

        {loading && <SkeletonRows count={3} />}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && plans.length === 0 && (
          <View style={styles.emptyState}>
            <CreditCard size={28} color="rgba(201,168,76,0.4)" />
            <Text style={styles.emptyText}>
              No membership plans available yet.
              {'\n'}Ask your gym admin to create plans.
            </Text>
          </View>
        )}

        {plans.map((plan: any) => {
          const isCurrentPlan = currentMembership?.planId === plan.id && currentMembership?.status === 'ACTIVE';
          const isSelected = selectedPlan?.id === plan.id;

          return (
            <TouchableOpacity
              key={plan.id}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedPlan(isSelected ? null : plan);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.planCard,
                isCurrentPlan && styles.planCardCurrent,
                isSelected && styles.planCardSelected
              ]}
            >
              {/* Plan header */}
              <View style={styles.planHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planNameText}>{plan.name}</Text>
                  {plan.description && (
                    <Text style={styles.planDescriptionText}>{plan.description}</Text>
                  )}
                </View>
                {isCurrentPlan && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>

              {/* Price + duration */}
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>${plan.price?.toFixed(2)}</Text>
                <Text style={styles.durationText}>/ {plan.durationDays} days</Text>
              </View>

              <View style={styles.divider} />

              {/* Subscribe button */}
              {isCurrentPlan ? (
                <View style={styles.activeButtonPlaceholder}>
                  <Text style={styles.activeButtonText}>✓ Active Plan</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPlan(plan);
                    setPaymentModalVisible(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  }}
                  style={[
                    styles.subscribeButton,
                    isSelected && styles.subscribeButtonSelected
                  ]}
                >
                  <Text style={[
                    styles.subscribeButtonText,
                    isSelected && styles.subscribeButtonTextSelected
                  ]}>
                    Subscribe — ${plan.price?.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          visible={paymentModalVisible}
          plan={selectedPlan}
          traineeId={traineeId}
          onClose={() => {
            setPaymentModalVisible(false);
            setSelectedPlan(null);
          }}
          onSuccess={() => {
            setPaymentModalVisible(false);
            setSelectedPlan(null);
            showToast('Subscription request sent! Activation pending admin payment verification.', 'success');
            router.replace('/(trainee)/home' as any);
          }}
        />
      )}
    </View>
  );
}

function PaymentModal({ visible, plan, traineeId, onClose, onSuccess }: any) {
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    // Strict guard
    if (!traineeId || traineeId === 'null' || traineeId === '') {
      setError('Could not identify your account. Please log out and back in.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // ✅ STEP: Assign plan ONLY — this creates the PENDING membership
      // The admin will now see this request and record the payment to activate it.
      await membershipService.assign(traineeId, plan.id, today);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? '';
      
      if (msg.toLowerCase().includes('already') ||
          msg.toLowerCase().includes('active')) {
        setError('You already have a subscription request or an active membership.');
      } else if (msg.toLowerCase().includes('forbidden')) {
        setError('Permission denied. Please log out and log in again.');
      } else {
        setError(msg || 'Subscription request failed. Please try again.');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} disabled={submitting}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Complete Payment</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.modalScrollContent}>
          {/* Error */}
          {error && (
            <View style={styles.modalErrorBanner}>
              <AlertCircle size={16} color="#E74C3C" />
              <Text style={styles.modalErrorText}>{error}</Text>
            </View>
          )}

          {/* Plan summary */}
          <View style={styles.planSummaryBox}>
            <Text style={styles.planSummaryLabel}>Subscribing to</Text>
            <Text style={styles.planSummaryName}>{plan.name}</Text>
            <Text style={styles.planSummaryDuration}>{plan.durationDays} days access</Text>
            
            <View style={styles.amountBox}>
              <Text style={styles.amountText}>${plan.price?.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment method */}
          <Text style={styles.paymentMethodTitle}>Payment Method</Text>
          <View style={styles.methodRow}>
            {([
              { value: 'CASH', label: 'Cash', icon: '💵' },
              { value: 'CARD', label: 'Card', icon: '💳' },
              { value: 'TRANSFER', label: 'Transfer', icon: '🏦' },
            ] as const).map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => {
                  setMethod(m.value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.methodButton,
                  method === m.value && styles.methodButtonSelected
                ]}
              >
                <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                <Text style={[
                  styles.methodButtonText,
                  method === m.value && styles.methodButtonTextSelected
                ]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note for cash/transfer */}
          {method !== 'CARD' && (
            <View style={styles.methodInfoBanner}>
              <Info size={14} color="#3B82F6" style={{ marginTop: 1 }} />
              <Text style={styles.methodInfoText}>
                {method === 'CASH'
                  ? 'Please pay the amount at the gym reception. Your plan will be activated once confirmed.'
                  : 'Please transfer the amount to the gym account. Your plan will be activated once the transfer is confirmed.'}
              </Text>
            </View>
          )}

          {/* Confirm button */}
          <TouchableOpacity
            onPress={handlePay}
            disabled={submitting}
            style={[
              styles.confirmButton,
              submitting && { opacity: 0.6 }
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={nebulaGold.colors.background.primary} />
            ) : (
              <Text style={styles.confirmButtonText}>
                Confirm & Activate — ${plan.price?.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By confirming you agree to the gym's membership terms.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  activePlanBanner: {
    backgroundColor: 'rgba(46,204,113,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(46,204,113,0.3)',
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activePlanText: {
    fontSize: 13,
    color: '#2ECC71',
    flex: 1,
  },
  errorBanner: {
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
    borderColor: 'rgba(231,76,60,0.3)',
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#E74C3C',
  },
  emptyState: {
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: nebulaGold.colors.text.secondary,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
    marginBottom: 12,
  },
  planCardCurrent: {
    borderColor: '#2ECC71',
  },
  planCardSelected: {
    borderColor: nebulaGold.colors.gold.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: nebulaGold.colors.text.primary,
  },
  planDescriptionText: {
    fontSize: 13,
    color: nebulaGold.colors.text.secondary,
    marginTop: 4,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(46,204,113,0.15)',
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2ECC71',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 16,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '800',
    color: nebulaGold.colors.gold.primary,
  },
  durationText: {
    fontSize: 14,
    color: nebulaGold.colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  activeButtonPlaceholder: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(46,204,113,0.1)',
  },
  activeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ECC71',
  },
  subscribeButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1,
    borderColor: nebulaGold.colors.gold.primary,
  },
  subscribeButtonSelected: {
    backgroundColor: nebulaGold.colors.gold.primary,
  },
  subscribeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: nebulaGold.colors.gold.primary,
  },
  subscribeButtonTextSelected: {
    color: nebulaGold.colors.background.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,168,76,0.2)',
    backgroundColor: nebulaGold.colors.background.secondary,
  },
  modalCancelText: {
    fontSize: 15,
    color: nebulaGold.colors.text.secondary,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: nebulaGold.colors.text.primary,
  },
  modalScrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  modalErrorBanner: {
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
    borderColor: 'rgba(231,76,60,0.3)',
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalErrorText: {
    fontSize: 13,
    color: '#E74C3C',
    flex: 1,
  },
  planSummaryBox: {
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  planSummaryLabel: {
    fontSize: 13,
    color: nebulaGold.colors.text.secondary,
    marginBottom: 6,
  },
  planSummaryName: {
    fontSize: 22,
    fontWeight: '700',
    color: nebulaGold.colors.text.primary,
    marginBottom: 4,
  },
  planSummaryDuration: {
    fontSize: 14,
    color: nebulaGold.colors.text.secondary,
    marginBottom: 16,
  },
  amountBox: {
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  amountText: {
    fontSize: 36,
    fontWeight: '800',
    color: nebulaGold.colors.gold.primary,
    textAlign: 'center',
  },
  paymentMethodTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: nebulaGold.colors.text.secondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#18181F',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  methodButtonSelected: {
    backgroundColor: 'rgba(201,168,76,0.2)',
    borderColor: nebulaGold.colors.gold.primary,
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: nebulaGold.colors.text.secondary,
  },
  methodButtonTextSelected: {
    color: nebulaGold.colors.gold.primary,
  },
  methodInfoBanner: {
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  methodInfoText: {
    fontSize: 12,
    color: '#3B82F6',
    flex: 1,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: nebulaGold.colors.gold.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: nebulaGold.colors.background.primary,
  },
  termsText: {
    fontSize: 11,
    color: '#5A5750',
    textAlign: 'center',
    marginTop: 12,
  },
});

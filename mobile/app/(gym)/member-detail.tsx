import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Edit2 as Pencil, Shield, Calendar, Phone, Mail, User, Activity, Clock, ChevronRight, AlertCircle, UserPlus, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format, parseISO, isSameMonth } from 'date-fns';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useApiCall } from '../../src/hooks/useApiCall';
import { traineeService } from '../../src/services/traineeService';
import { membershipService } from '../../src/services/membershipService';
import { attendanceService } from '../../src/services/attendanceService';
import { sessionService } from '../../src/services/sessionService';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { SectionLabel } from '../../src/components/nebula/SectionLabel';
import { StatusBadge } from '../../src/components/nebula/StatusBadge';
import { Skeleton } from '../../src/components/nebula/Skeleton';
import { ErrorState } from '../../src/components/nebula/ErrorState';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { InfoRow } from '../../src/components/admin/InfoRow';
import { FormField } from '../../src/components/nebula/FormField';
import { formatEnum, formatEnumWithSpaces } from '../../src/utils/formatters';
import { adminStyles, adminSharedStyles } from '../../src/styles/adminStyles';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { showToast } from '../../src/utils/toast';
import { AssignCoachModal } from '../../src/components/admin/AssignCoachModal';

export default function MemberDetailScreen() {
  const { traineeId } = useLocalSearchParams();
  const router = useRouter();
  
  // Modal & Save states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [markingAttendance, setMarkingAttendance] = useState(false);

  // Form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editGoal, setEditGoal] = useState('');
  const [editEcName, setEditEcName] = useState('');
  const [editEcPhone, setEditEcPhone] = useState('');
  const [editMedical, setEditMedical] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');

  // Fix: Custom back button behavior
  const handleBack = useCallback(() => {
    router.replace('/(gym)/members');
    return true;
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => subscription.remove();
    }, [handleBack])
  );

  // Helper to open edit modal with pre-filled data
  const openEditModal = () => {
    if (!trainee) return;
    setEditName(trainee.name ?? '');
    setEditEmail(trainee.email ?? '');
    setEditPhone(trainee.phone ?? '');
    setEditPassword(''); 
    setEditHeight(trainee.height?.toString() ?? '');
    setEditWeight(trainee.weight?.toString() ?? '');
    setEditDob(trainee.dateOfBirth ?? '');
    setEditGender(trainee.gender ?? '');
    setEditBloodGroup(trainee.bloodGroup ?? '');
    setEditGoal(trainee.fitnessGoal ?? '');
    setEditEcName(trainee.emergencyContactName ?? '');
    setEditEcPhone(trainee.emergencyContactPhone ?? '');
    setEditMedical(trainee.medicalConditions ?? '');
    setEditPhotoUrl(trainee.profilePhotoUrl ?? '');
    setEditError(null);
    setEditModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle save API call
  const handleMarkAttendance = async () => {
    if (markingAttendance) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMarkingAttendance(true);
    
    try {
      const today = new Date();
      const payload = {
        traineeId: Number(traineeId),
        attendanceDate: format(today, 'yyyy-MM-dd'),
        status: 'PRESENT',
        checkInTime: format(today, 'HH:mm'),
        checkInMethod: 'MANUAL',
        notes: `Marked present by Admin at ${format(today, 'HH:mm')}`
      };

      await attendanceService.checkIn(payload);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Member marked present successfully', 'success');
      
      // Refresh both trainee details (for last visit) and attendance list
      refetch();
      refetchAttendance();
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || e.message || 'Failed to mark attendance';
      showToast(errorMsg, 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setEditError('Name is required');
      return;
    }
    if (!editEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      setEditError('Valid email is required');
      return;
    }
    if (editPassword && editPassword.length < 6) {
      setEditError('New password must be at least 6 characters');
      return;
    }

    setEditError(null);
    setSaving(true);

    try {
      const payload: Record<string, any> = {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        phone: editPhone.trim() || null,
        height: editHeight ? parseFloat(editHeight) : null,
        weight: editWeight ? parseFloat(editWeight) : null,
        dateOfBirth: editDob || null,
        gender: editGender || null,
        bloodGroup: editBloodGroup || null,
        fitnessGoal: editGoal || null,
        emergencyContactName: editEcName.trim() || null,
        emergencyContactPhone: editEcPhone.trim() || null,
        medicalConditions: editMedical.trim() || null,
        profilePhotoUrl: editPhotoUrl.trim() || null,
      };

      if (editPassword.trim()) {
        payload.password = editPassword;
      }

      await traineeService.update(traineeId as string, payload);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Member updated successfully', 'success');
      setEditModalVisible(false);
      refetch();
    } catch (e: any) {
      setEditError(e.message ?? 'Failed to update. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const { data: trainee, loading, error, refetch } = useApiCall(
    () => traineeService.getById(traineeId as string),
    [traineeId]
  );

  const { data: memberships } = useApiCall(
    () => membershipService.getAllMembershipsForTrainee(traineeId as string),
    [traineeId]
  );

  const { data: attendance, refetch: refetchAttendance } = useApiCall(
    () => attendanceService.getForTrainee(traineeId as string),
    [traineeId]
  );

  const { data: sessions } = useApiCall(
    () => sessionService.getForTrainee(traineeId as string),
    [traineeId]
  );

  if (loading) {
    return (
      <View style={adminSharedStyles.container}>
        <ScreenHeader title="Loading..." onBackPress={handleBack} showBack />
        <View style={{ padding: 16 }}>
          <Skeleton height={180} borderRadius={16} style={{ marginBottom: 16 }} />
          <Skeleton height={40} width={150} style={{ marginBottom: 8 }} />
          <Skeleton height={200} borderRadius={14} style={{ marginBottom: 16 }} />
          <Skeleton height={40} width={150} style={{ marginBottom: 8 }} />
          <Skeleton height={100} borderRadius={12} style={{ marginBottom: 16 }} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={adminSharedStyles.container}>
        <ScreenHeader title="Error" onBackPress={handleBack} showBack />
        <ErrorState message={error} />
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!trainee) return null;

  return (
    <View style={adminSharedStyles.container}>
      <ScreenHeader
        title={trainee.name}
        onBackPress={handleBack}
        showBack
        rightSlot={
          <TouchableOpacity 
            onPress={openEditModal}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Pencil size={20} color="#000000" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={adminSharedStyles.scrollContent}
      >
        {/* ── Profile Header Card ── */}
        <GlassCard style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {trainee.profilePhotoUrl ? (
              <Image
                source={{ uri: trainee.profilePhotoUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarPlaceholder}>
                {trainee.name?.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          {/* Name */}
          <Text style={styles.profileName}>{trainee.name}</Text>

          {/* Email */}
          <Text style={styles.profileEmail}>{trainee.email}</Text>

          {/* Status badge + membership end date row */}
          <View style={styles.statusRow}>
            <StatusBadge status={trainee.membershipStatus || 'NO_PLAN'} />
            {trainee.membershipEndDate && (
              <Text style={styles.expiryText}>
                {trainee.membershipStatus === 'EXPIRED'
                  ? `Expired ${format(parseISO(trainee.membershipEndDate), 'dd MMM yyyy')}`
                  : `Expires ${format(parseISO(trainee.membershipEndDate), 'dd MMM yyyy')}`
                }
              </Text>
            )}
          </View>

          {/* Mark Attendance Button - Peak White Commanding Style */}
          <TouchableOpacity 
            style={[styles.markPresentBtn, markingAttendance && { opacity: 0.7 }]}
            onPress={handleMarkAttendance}
            disabled={markingAttendance}
          >
            {markingAttendance ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.markPresentBtnText}>MARK PRESENT</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        {/* ── Info Grid ── */}
        <SectionLabel label="PERSONAL INFO" />
        <View style={adminStyles.infoCard}>
          {[
            { label: 'Phone',         value: trainee.phone         ?? '—' },
            { label: 'Date of Birth', value: trainee.dateOfBirth
                ? format(parseISO(trainee.dateOfBirth), 'dd MMM yyyy') : '—' },
            { label: 'Gender',        value: formatEnum(trainee.gender) },
            { label: 'Blood Group',   value: trainee.bloodGroup    ?? '—' },
            { label: 'Height',        value: trainee.height ? `${trainee.height} cm` : '—' },
            { label: 'Weight',        value: trainee.weight ? `${trainee.weight} kg` : '—' },
            { label: 'Fitness Goal',  value: formatEnumWithSpaces(trainee.fitnessGoal) },
          ].map((row, i, arr) => (
            <InfoRow
              key={row.label}
              label={row.label}
              value={row.value}
              isLast={i === arr.length - 1}
            />
          ))}
        </View>

        {/* ── Emergency Contact ── */}
        {(trainee.emergencyContactName || trainee.emergencyContactPhone) && (
          <>
            <SectionLabel label="EMERGENCY CONTACT" style={{ marginTop: 8 }} />
            <View style={adminStyles.infoCard}>
              {[
                { label: 'Name',  value: trainee.emergencyContactName  ?? '—' },
                { label: 'Phone', value: trainee.emergencyContactPhone ?? '—' },
              ].map((row, i, arr) => (
                <InfoRow 
                  key={row.label} 
                  label={row.label} 
                  value={row.value}
                  isLast={i === arr.length - 1} 
                />
              ))}
            </View>
          </>
        )}

        {/* ── Medical & Other ── */}
        {(trainee.medicalConditions || trainee.referralSource || trainee.qrCodeId) && (
          <>
            <SectionLabel label="MEDICAL & OTHER" />
            <View style={adminStyles.infoCard}>
              {[
                trainee.medicalConditions && {
                  label: 'Medical Conditions',
                  value: trainee.medicalConditions,
                  multiline: true,
                },
                trainee.referralSource && {
                  label: 'Referral Source',
                  value: trainee.referralSource,
                },
                trainee.qrCodeId && {
                  label: 'QR Code ID',
                  value: trainee.qrCodeId,
                  mono: true,
                },
              ]
                .filter(Boolean)
                .map((row: any, i, arr) => (
                  <InfoRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    isLast={i === arr.length - 1}
                  />
                ))}
            </View>
          </>
        )}

        {/* ── Assigned Coach ── */}
        <SectionLabel label="ASSIGNED COACH" style={{ marginTop: 8 }} />

        {trainee.assignedCoach ? (
          <View style={[adminStyles.infoCard, { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: '#000000',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                {trainee.assignedCoach.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#000000' }}>
                {trainee.assignedCoach.name}
              </Text>
              <Text style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>
                {trainee.assignedCoach.specialization ?? 'Coach'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setAssignModalVisible(true)}
              style={{
                paddingHorizontal: 12, paddingVertical: 6,
                borderRadius: 8, borderWidth: 1, borderColor: '#000000',
              }}
            >
              <Text style={{ fontSize: 12, color: '#000000', fontWeight: '700' }}>
                Reassign
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setAssignModalVisible(true)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16, borderWidth: 1,
              borderColor: '#EBEBF0',
              borderStyle: 'dashed',
              padding: 20, marginBottom: 12,
              flexDirection: 'row', alignItems: 'center',
              justifyContent: 'center', gap: 10,
              ...nebulaGold.colors.shadow.light,
            }}
          >
            <UserPlus size={18} color="#000" />
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#000' }}>
              Assign a Coach
            </Text>
          </TouchableOpacity>
        )}

        {trainee.trainingType === 'SELF_TRAINING' && (
          <View style={{
            backgroundColor: 'rgba(158,154,142,0.08)',
            borderRadius: 10, padding: 12, marginBottom: 16,
            flexDirection: 'row', gap: 8, alignItems: 'center',
          }}>
            <Info size={13} color="#9E9A8E" />
            <Text style={{ fontSize: 12, color: '#9E9A8E', flex: 1 }}>
              This member is enrolled in Self Training and does not need a coach assigned.
            </Text>
          </View>
        )}

        {/* ── Membership History ── */}
        <SectionLabel label="MEMBERSHIP HISTORY" style={{ marginTop: 8 }} />
        {(!memberships || memberships.length === 0) ? (
          <View style={adminStyles.infoCard}>
            <Text style={[styles.emptyText, { padding: 20, textAlign: 'center' }]}>No membership plans assigned</Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {memberships.map((m: any) => (
              <View key={m.id} style={[
                styles.historyItem,
                { borderLeftColor: m.status === 'ACTIVE' ? '#34C759' : m.status === 'EXPIRING' ? '#FF9500' : '#FF3B30' }
              ]}>
                <View style={styles.historyHeader}>
                  <Text style={styles.planName}>{m.planName}</Text>
                  <StatusBadge status={m.status} small />
                </View>
                <Text style={styles.planDates}>
                  {format(parseISO(m.startDate), 'dd MMM yyyy')}
                  {' → '}
                  {format(parseISO(m.endDate), 'dd MMM yyyy')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Attendance Summary ── */}
        <SectionLabel label="ATTENDANCE" style={{ marginTop: 8 }} />
        <View style={styles.statsGrid}>
          {[
            {
              label: 'This Month',
              value: attendance?.filter((a: any) =>
                isSameMonth(parseISO(a.date), new Date())
              ).length ?? 0,
            },
            {
              label: 'Total',
              value: attendance?.length ?? 0,
            },
            {
              label: 'Last Visit',
              value: attendance && attendance.length > 0
                ? format(parseISO(
                    [...attendance].sort((a, b) =>
                      b.date.localeCompare(a.date)
                    )[0].date
                  ), 'dd MMM')
                : '—',
            },
          ].map(stat => (
            <GlassCard key={stat.label} style={styles.statBox} containerStyle={{ padding: 12, alignItems: 'center' }}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* ── Upcoming Sessions ── */}
        <SectionLabel label="UPCOMING SESSIONS" />
        {(!sessions || sessions.filter((s: any) =>
            s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS'
          ).length === 0) ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No upcoming sessions</Text>
          </GlassCard>
        ) : (
          sessions
            .filter((s: any) => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS')
            .map((s: any) => (
              <GlassCard key={s.id} style={styles.sessionItem}>
                <View>
                  <Text style={styles.coachName}>{s.coachName}</Text>
                  <Text style={styles.sessionTime}>
                    {format(parseISO(s.date), 'dd MMM yyyy')} · {s.startTime}
                  </Text>
                </View>
                <StatusBadge status={s.status} small />
              </GlassCard>
            ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AssignCoachModal
        visible={assignModalVisible}
        preselectedTraineeId={traineeId as string}
        onClose={() => setAssignModalVisible(false)}
        onSuccess={() => {
          setAssignModalVisible(false)
          refetch() // refresh member detail
        }}
      />

      {/* ── Edit Modal Refactored to Light Theme ── */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#F2F2F7',
            backgroundColor: '#FFFFFF',
          }}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} disabled={saving}>
              <Text style={{ fontSize: 16, color: '#8E8E93', fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 17, fontWeight: '700', color: '#000000' }}>Edit Member</Text>

            <TouchableOpacity onPress={handleSaveEdit} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#000000' }}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {editError && (
                <View style={{
                  backgroundColor: '#FF3B3010',
                  borderWidth: 1,
                  borderColor: '#FF3B3030',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <AlertCircle size={16} color="#FF3B30" />
                  <Text style={{ fontSize: 13, color: '#FF3B30', flex: 1 }}>{editError}</Text>
                </View>
              )}

              <SectionLabel label="ACCOUNT INFO" />
              <FormField label="Full Name *" value={editName} onChangeText={setEditName} placeholder="Full name" />
              <FormField label="Email *" value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" placeholder="Email address" />
              <FormField label="Phone" value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" placeholder="Phone" />

              <SectionLabel label="PHYSICAL INFO" style={{ marginTop: 8 }} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <FormField label="Height" value={editHeight} onChangeText={setEditHeight} keyboardType="decimal-pad" suffix="cm" />
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label="Weight" value={editWeight} onChangeText={setEditWeight} keyboardType="decimal-pad" suffix="kg" />
                </View>
              </View>
              <FormField label="Date of Birth" value={editDob} onChangeText={setEditDob} placeholder="YYYY-MM-DD" />

              <SectionLabel label="MEDICAL" style={{ marginTop: 8 }} />
              <TextInput
                style={{
                  backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EBEBF0', borderRadius: 12,
                  padding: 14, fontSize: 15, color: '#000', minHeight: 80, textAlignVertical: 'top', marginBottom: 14,
                }}
                placeholder="Medical conditions (optional)"
                placeholderTextColor="#8E8E93"
                value={editMedical}
                onChangeText={setEditMedical}
                multiline
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    ...nebulaGold.colors.shadow.light,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  markPresentBtn: {
    marginTop: 20,
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4
  },
  markPresentBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  historyList: {
    marginBottom: 8,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 8,
    ...nebulaGold.colors.shadow.light,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  planDates: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 2,
  },
  sessionItem: {
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coachName: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '700',
  },
  sessionTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#C9A84C',
    borderRadius: 8,
  },
  retryText: {
    color: '#09090F',
    fontWeight: '600',
  },
});

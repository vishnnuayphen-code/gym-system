import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { useAuthStore } from '../../store/authStore';
import { useApiCall } from '../../src/hooks/useApiCall';
import { traineeService } from '../../src/services/traineeService';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { membershipService } from '../../src/services/membershipService';
import { StatusBadge } from '../../src/components/nebula/StatusBadge';
import { CreditCard } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';

export default function TraineeProfile() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  
  const { data: profileData, loading, refreshing, refetch } = useApiCall(
    () => traineeService.getMe(),
    []
  );

  const { data: membershipData } = useApiCall(
    () => membershipService.getMyMembership(),
    []
  );

  const { data: paymentsData } = useApiCall(
    () => membershipService.getMyPayments(),
    []
  );
  
  const profile = profileData?.data || profileData;
  const membership = membershipData?.data || membershipData;
  const payments = paymentsData?.data || paymentsData;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await traineeService.update(user?.id?.toString() || '', form);
      setEditing(false);
      refetch();
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Profile" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={nebulaGold.colors.gold.primary} />}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
            <ActivityIndicator size="large" color={nebulaGold.colors.gold.primary} />
          </View>
        ) : (
          <>
            <View style={styles.headerSection}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(profile?.name || user?.name || 'T').charAt(0).toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity style={styles.changePhotoBtn}>
                <Text style={styles.changePhotoText}>Edit Photo</Text>
              </TouchableOpacity>
              
              {!editing ? (
                <Text style={styles.profileName}>{profile?.name || user?.name || 'Trainee'}</Text>
              ) : (
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  placeholder="Enter name"
                  placeholderTextColor="#8E8E93"
                />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Details</Text>
              <View style={styles.card}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <Text style={styles.fieldValueReadOnly}>{profile?.email || user?.email}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Phone</Text>
                  {!editing ? (
                    <Text style={styles.fieldValue}>{profile?.phone || '--'}</Text>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={form.phone}
                      onChangeText={(text) => setForm({ ...form, phone: text })}
                      keyboardType="phone-pad"
                      placeholder="Enter phone"
                      placeholderTextColor="#8E8E93"
                    />
                  )}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
              <View style={styles.card}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Name</Text>
                  {!editing ? (
                    <Text style={styles.fieldValue}>{profile?.emergencyContactName || '--'}</Text>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={form.emergencyContactName}
                      onChangeText={(text) => setForm({ ...form, emergencyContactName: text })}
                      placeholder="Contact name"
                      placeholderTextColor="#8E8E93"
                    />
                  )}
                </View>
                <View style={styles.divider} />
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Phone</Text>
                  {!editing ? (
                    <Text style={styles.fieldValue}>{profile?.emergencyContactPhone || '--'}</Text>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={form.emergencyContactPhone}
                      onChangeText={(text) => setForm({ ...form, emergencyContactPhone: text })}
                      keyboardType="phone-pad"
                      placeholder="Contact phone"
                      placeholderTextColor="#8E8E93"
                    />
                  )}
                </View>
              </View>
            </View>

            {/* ── My Membership Section ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Membership Plan</Text>
              {membership ? (
                <View style={styles.membershipCard}>
                  <View style={styles.membershipHeader}>
                    <Text style={styles.planName}>{membership.planName}</Text>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>{membership.status || 'ACTIVE'}</Text>
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={[
                      styles.progressBar, 
                      { width: `${Math.max(5, Math.min(100, (membership.daysRemaining / (membership.totalDays || 30)) * 100))}%` }
                    ]} />
                  </View>
                  
                  <Text style={styles.remainingText}>
                    {membership.daysRemaining > 0 ? `${membership.daysRemaining} days remaining` : 'Plan Expired'}
                  </Text>

                  <View style={styles.dateRow}>
                    <View>
                      <Text style={styles.dateLabel}>Start Date</Text>
                      <Text style={styles.dateValue}>
                        {membership.startDate ? format(parseISO(membership.startDate), 'dd MMM yyyy') : '—'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.dateLabel}>Expiry Date</Text>
                      <Text style={styles.dateValue}>
                        {membership.endDate ? format(parseISO(membership.endDate), 'dd MMM yyyy') : '—'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => router.push('/(trainee)/plans' as any)}
                    style={styles.changePlanBtn}
                  >
                    <Text style={styles.changePlanText}>
                      {membership.status === 'EXPIRED' ? 'RENEW SUBSCRIPTION' : 'UPGRADE PLAN'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => router.push('/(trainee)/plans' as any)}
                  style={styles.subscribeCard}
                >
                  <CreditCard size={24} color="#000000" />
                  <Text style={styles.subscribeTitle}>No Active Plan</Text>
                  <Text style={styles.subscribeSubtitle}>Browse available membership plans</Text>
                </TouchableOpacity>
              )}

              {payments && payments.length > 0 && (
                <>
                  <Text style={styles.sectionSubtitle}>Last Payments</Text>
                  {payments.slice(0, 3).map((p: any) => (
                    <View key={p.id} style={styles.paymentItem}>
                      <View>
                        <Text style={styles.paymentPlan}>{p.planName}</Text>
                        <Text style={styles.paymentDate}>
                          {p.date ? format(parseISO(p.date), 'dd MMM yyyy') : '—'}
                        </Text>
                      </View>
                      <Text style={styles.paymentAmount}>${p.amount?.toFixed(2)}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>

            <View style={styles.actionSection}>
              {!editing ? (
                <TouchableOpacity style={styles.commandBtn} onPress={() => setEditing(true)}>
                  <Text style={styles.commandBtnText}>Edit Profile</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                   style={[styles.commandBtn, saving && { opacity: 0.7 }]} 
                   onPress={handleSave} 
                   disabled={saving}
                >
                  <Text style={styles.commandBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
                </TouchableOpacity>
              )}
              {editing && (
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={() => {
                    setEditing(false);
                    setForm({
                      name: profile?.name || '',
                      phone: profile?.phone || '',
                      emergencyContactName: profile?.emergencyContactName || '',
                      emergencyContactPhone: profile?.emergencyContactPhone || ''
                    });
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 20 },
  headerSection: { alignItems: 'center', marginTop: 24, marginBottom: 24 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA'
  },
  avatarInitial: { fontSize: 40, fontWeight: '700', color: '#000000' },
  changePhotoBtn: { marginTop: 16 },
  changePhotoText: { fontSize: 13, fontWeight: '600', color: '#000000', textTransform: 'uppercase', letterSpacing: 0.5 },
  profileName: { fontSize: 24, fontWeight: '700', color: '#000000', marginTop: 16 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 40 },
  fieldLabel: { fontSize: 15, color: '#8E8E93', fontWeight: '500' },
  fieldValue: { fontSize: 16, color: '#000000', fontWeight: '600', flex: 1, textAlign: 'right' },
  fieldValueReadOnly: { fontSize: 15, color: '#8E8E93', flex: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 12 },
  input: {
    flex: 1,
    color: '#000000',
    textAlign: 'right',
    padding: 0,
    fontSize: 16,
    fontWeight: '600'
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    textAlign: 'center'
  },
  membershipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16
  },
  membershipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  planName: { fontSize: 17, fontWeight: '700', color: '#000000' },
  activeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  activeBadgeText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  progressContainer: { height: 6, borderRadius: 3, backgroundColor: '#F2F2F7', marginBottom: 8 },
  progressBar: { height: '100%', borderRadius: 3, backgroundColor: '#000000' },
  remainingText: { fontSize: 13, color: '#8E8E93', marginBottom: 16 },
  dateRow: { flexDirection: 'row', gap: 24, marginBottom: 20 },
  dateLabel: { fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', marginBottom: 4 },
  dateValue: { fontSize: 14, color: '#000000', fontWeight: '600' },
  changePlanBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center'
  },
  changePlanText: { fontSize: 13, fontWeight: '700', color: '#000000', letterSpacing: 0.5 },
  subscribeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  subscribeTitle: { fontSize: 16, fontWeight: '700', color: '#000000' },
  subscribeSubtitle: { fontSize: 13, color: '#8E8E93', textAlign: 'center' },
  sectionSubtitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    marginBottom: 8
  },
  paymentPlan: { fontSize: 15, color: '#000000', fontWeight: '600' },
  paymentDate: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  paymentAmount: { fontSize: 16, fontWeight: '700', color: '#000000' },
  actionSection: { paddingHorizontal: 20, marginTop: 12 },
  commandBtn: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4
  },
  commandBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  cancelBtn: { marginTop: 12, paddingVertical: 16, alignItems: 'center' },
  cancelBtnText: { color: '#8E8E93', fontSize: 15, fontWeight: '600' },
  logoutBtn: { marginTop: 40, marginBottom: 20, alignSelf: 'center', padding: 10 },
  logoutText: { fontSize: 13, fontWeight: '700', color: '#FF3B30', textTransform: 'uppercase', letterSpacing: 1 },
});

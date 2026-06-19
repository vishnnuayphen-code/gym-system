import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, TextInput, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Pencil, UserPlus, AlertCircle, Calendar, Clock, ChevronRight } from 'lucide-react-native';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { SectionLabel } from '../../src/components/nebula/SectionLabel';
import { StatusBadge } from '../../src/components/nebula/StatusBadge';
import { FormField } from '../../src/components/nebula/FormField';
import { InfoRow } from '../../src/components/admin/InfoRow';
import { adminStyles, adminSharedStyles } from '../../src/styles/adminStyles';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { useApiCall } from '../../src/hooks/useApiCall';
import { coachService } from '../../src/services/coachService';
import { traineeService } from '../../src/services/traineeService';
import { sessionService } from '../../src/services/sessionService';
import { showToast } from '../../src/utils/toast';
import { formatEnum } from '../../src/utils/formatters';
import { parseISO, format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { AssignCoachModal } from '../../src/components/admin/AssignCoachModal';

export default function CoachDetailScreen() {
  const { coachId } = useLocalSearchParams();
  const router = useRouter();

  const { data: coach, loading, error, refetch }
    = useApiCall(() => coachService.getById(coachId as string), [coachId]);

  const { data: trainees }
    = useApiCall(() => coachService.getCoachTrainees(coachId as string), [coachId]);

  const { data: sessionsResponse }
    = useApiCall(() => sessionService.getForCoach(coachId as string), [coachId]);

  const sessions = sessionsResponse?.data || [];

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Editable fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('');
  const [editExperienceYears, setEditExperienceYears] = useState('');
  const [editCertifications, setEditCertifications] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editProfilePhotoUrl, setEditProfilePhotoUrl] = useState('');
  const [editEmploymentType, setEditEmploymentType] = useState<'FULL_TIME' | 'SESSION_BASED'>('FULL_TIME');
  const [editSessionType, setEditSessionType] = useState<'BOTH' | 'MORNING' | 'EVENING'>('BOTH');

  // Assign Trainee Modal State
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { data: allTrainees } = useApiCall(() => traineeService.getAll(), []);

  const openEditModal = () => {
    if (!coach) return;
    setEditName(coach.name || '');
    setEditEmail(coach.email || '');
    setEditPassword('');
    setEditPhone(coach.phone || '');
    setEditSpecialization(coach.specialization || '');
    setEditExperienceYears(coach.experienceYears?.toString() || '');
    setEditCertifications(coach.certificationName || '');
    setEditBio(coach.bio || '');
    setEditDateOfBirth(coach.dateOfBirth || '');
    setEditGender(coach.gender || '');
    setEditProfilePhotoUrl(coach.profilePhotoUrl || '');
    setEditEmploymentType(coach.employmentType || 'FULL_TIME');
    setEditSessionType(coach.sessionType || 'BOTH');
    setEditError(null);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) { setEditError('Name is required'); return; }
    
    setSaving(true);
    setEditError(null);

    try {
      const payload: Record<string, any> = {
        name: editName.trim(),
        phone: editPhone.trim(),
        specialization: editSpecialization.trim(),
        experienceYears: editExperienceYears ? parseInt(editExperienceYears) : null,
        certificationName: editCertifications.trim(),
        bio: editBio.trim(),
        dateOfBirth: editDateOfBirth,
        gender: editGender,
        profilePhotoUrl: editProfilePhotoUrl.trim(),
        employmentType: editEmploymentType,
        sessionType: editSessionType,
      };

      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      await coachService.update(coachId as string, payload);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Coach updated successfully', 'success');
      setEditModalVisible(false);
      refetch();
    } catch (e: any) {
      setEditError(e.message || 'Failed to update coach');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/(gym)/coaches');
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  if (loading) {
    return (
      <View style={[adminSharedStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={nebulaGold.colors.gold.primary} />
      </View>
    );
  }

  if (error || !coach) {
    return (
      <View style={[adminSharedStyles.container, { backgroundColor: '#FFFFFF' }]}>
        <ScreenHeader title="Coach Details" showBack onBackPress={() => router.replace('/(gym)/coaches')} />
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#FF3B30', textAlign: 'center', fontWeight: '600' }}>{error || 'Coach not found'}</Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 16 }}>
            <Text style={{ color: '#007AFF', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[adminSharedStyles.container, { backgroundColor: '#F2F2F7' }]}>
      <ScreenHeader
        title={coach.name}
        showBack
        onBackPress={() => router.replace('/(gym)/coaches')}
        rightSlot={
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity onPress={() => setAssignModalVisible(true)}>
              <UserPlus size={22} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openEditModal}>
              <Pencil size={22} color="#000000" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        {/* Profile Card Fixed Contrast */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 24,
          alignItems: 'center',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#EBEBF0',
          ...nebulaGold.colors.shadow.light,
        }}>
          <View style={{
            width: 90, height: 90, borderRadius: 45,
            backgroundColor: '#F2F2F7',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            overflow: 'hidden'
          }}>
            {coach.profilePhotoUrl ? (
              <Image
                source={{ uri: coach.profilePhotoUrl }}
                style={{ width: 90, height: 90 }}
              />
            ) : (
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#8E8E93' }}>
                {coach.name?.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#000000', marginBottom: 4 }}>
            {coach.name}
          </Text>
          <Text style={{ fontSize: 14, color: '#8E8E93', fontWeight: '600', marginBottom: 12 }}>
            {coach.email}
          </Text>
          {coach.specialization && (
            <View style={{
              paddingHorizontal: 16, paddingVertical: 6,
              borderRadius: 99,
              backgroundColor: '#000000',
            }}>
              <Text style={{ fontSize: 13, color: '#FFFFFF', fontWeight: '700' }}>
                {coach.specialization}
              </Text>
            </View>
          )}
        </View>

        {/* Professional Info */}
        <SectionLabel label="PROFESSIONAL INFO" />
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#EBEBF0', marginBottom: 20 }}>
          <InfoRow label="Specialization" value={coach.specialization ?? '—'} />
          <InfoRow label="Experience" value={coach.experienceYears ? `${coach.experienceYears} years` : '—'} />
          <InfoRow label="Employment" value={formatEnum(coach.employmentType)} />
          {coach.employmentType === 'SESSION_BASED' && (
            <InfoRow label="Session Type" value={formatEnum(coach.sessionType)} />
          )}
          <InfoRow label="Certifications" value={coach.certificationName ?? '—'} isLast />
        </View>

        {/* Bio */}
        {coach.bio && (
          <>
            <SectionLabel label="BIO" />
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#EBEBF0', marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: '#000000', lineHeight: 22, fontWeight: '500' }}>
                {coach.bio}
              </Text>
            </View>
          </>
        )}

        {/* Personal Info */}
        <SectionLabel label="PERSONAL INFO" />
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#EBEBF0', marginBottom: 20 }}>
          <InfoRow label="Phone" value={coach.phone ?? '—'} />
          <InfoRow
            label="Date of Birth"
            value={coach.dateOfBirth ? format(parseISO(coach.dateOfBirth), 'dd MMM yyyy') : '—'}
          />
          <InfoRow label="Gender" value={formatEnum(coach.gender)} isLast />
        </View>

        {/* Assigned Trainees Fixed Contrast */}
        <SectionLabel label="ASSIGNED TRAINEES" />
        {(!trainees || trainees.length === 0) ? (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#EBEBF0' }}>
            <Text style={{ fontSize: 14, color: '#8E8E93', marginBottom: 16, fontWeight: '600' }}>No members assigned yet</Text>
            <TouchableOpacity
              onPress={() => setAssignModalVisible(true)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: '#000000',
                paddingHorizontal: 20, paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <UserPlus size={18} color="#FFFFFF" />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>
                Assign Member
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#EBEBF0' }}>
              {trainees.map((t: any, i: number) => (
                <View key={t.id} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16, paddingVertical: 16,
                  borderBottomWidth: i < trainees.length - 1 ? 1 : 0,
                  borderBottomColor: '#F2F2F7',
                  gap: 12,
                }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: '#F2F2F7',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#8E8E93' }}>
                      {t.name?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, color: '#000000', fontWeight: '700' }}>{t.name}</Text>
                    <Text style={{ fontSize: 13, color: '#8E8E93', fontWeight: '500', marginTop: 2 }}>{t.email}</Text>
                  </View>
                  <StatusBadge status={t.membershipStatus ?? 'NO_PLAN'} small />
                </View>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setAssignModalVisible(true)}
              style={{
                marginTop: 12, alignSelf: 'center',
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingVertical: 10, paddingHorizontal: 16,
              }}
            >
              <UserPlus size={16} color="#007AFF" />
              <Text style={{ fontSize: 14, color: '#007AFF', fontWeight: '700' }}>
                Assign another member
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Edit Modal Overhauled */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20, paddingTop: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#F2F2F7',
            backgroundColor: '#FFFFFF',
          }}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} disabled={saving}>
              <Text style={{ fontSize: 16, color: '#FF3B30', fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#000000' }}>Edit Coach</Text>
            <TouchableOpacity onPress={handleSaveEdit} disabled={saving}>
              {saving
                ? <ActivityIndicator size="small" color="#000" />
                : <Text style={{ fontSize: 16, fontWeight: '800', color: '#007AFF' }}>Save</Text>
              }
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {editError && (
                <View style={{ backgroundColor: '#FF3B3015', borderWidth: 1, borderColor: '#FF3B3030', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} color="#FF3B30" />
                  <Text style={{ fontSize: 13, color: '#FF3B30', flex: 1 }}>{editError}</Text>
                </View>
              )}

              <SectionLabel label="ACCOUNT INFO" />
              <FormField label="Full Name *" value={editName} onChangeText={setEditName} autoCapitalize="words" />
              <FormField label="Email" value={editEmail} editable={false} />
              <FormField label="Password" value={editPassword} onChangeText={setEditPassword} secureTextEntry placeholder="Leave empty to keep current" />
              <FormField label="Phone" value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />

              <SectionLabel label="PROFESSIONAL INFO" style={{ marginTop: 8 }} />
              <FormField label="Specialization" value={editSpecialization} onChangeText={setEditSpecialization} autoCapitalize="words" />
              <FormField label="Experience (Years)" value={editExperienceYears} onChangeText={setEditExperienceYears} keyboardType="number-pad" suffix="yrs" />
              <FormField label="Certifications" value={editCertifications} onChangeText={setEditCertifications} autoCapitalize="words" />

              <Text style={{ fontSize: 11, fontWeight: '800', color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bio</Text>
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#EBEBF0', marginBottom: 20 }}>
                <TextInput
                  style={{ fontSize: 15, color: '#000000', minHeight: 100, textAlignVertical: 'top', fontWeight: '500' }}
                  value={editBio}
                  onChangeText={setEditBio}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <SectionLabel label="PERSONAL INFO" style={{ marginTop: 8 }} />
              <FormField label="Date of Birth" value={editDateOfBirth} onChangeText={setEditDateOfBirth} placeholder="YYYY-MM-DD" />

              <Text style={{ fontSize: 11, fontWeight: '800', color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Gender</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                {['MALE', 'FEMALE', 'OTHER'].map(g => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => {
                      setEditGender(g);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{
                      flex: 1, paddingVertical: 12,
                      borderRadius: 12, alignItems: 'center',
                      backgroundColor: editGender === g ? '#000000' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: editGender === g ? '#000000' : '#EBEBF0',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: editGender === g ? '#FFFFFF' : '#8E8E93' }}>
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <SectionLabel label="EMPLOYMENT CONFIG" style={{ marginTop: 8 }} />
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Employment Type</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                {['FULL_TIME', 'SESSION_BASED'].map(type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setEditEmploymentType(type as any);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{
                      flex: 1, paddingVertical: 12,
                      borderRadius: 12, alignItems: 'center',
                      backgroundColor: editEmploymentType === type ? '#000000' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: editEmploymentType === type ? '#000000' : '#EBEBF0',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: editEmploymentType === type ? '#FFFFFF' : '#8E8E93' }}>
                      {type === 'FULL_TIME' ? 'Full Time' : 'Session Based'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FormField label="Profile Photo URL" value={editProfilePhotoUrl} onChangeText={setEditProfilePhotoUrl} keyboardType="url" autoCapitalize="none" />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <AssignCoachModal
        visible={assignModalVisible}
        preselectedCoachId={coachId as string}
        onClose={() => setAssignModalVisible(false)}
        onSuccess={() => {
          setAssignModalVisible(false)
          refetch()
        }}
      />
    </View>
  );
}

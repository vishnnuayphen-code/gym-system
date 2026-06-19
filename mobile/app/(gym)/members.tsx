import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, Text, TouchableOpacity, Modal, ActivityIndicator, RefreshControl, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import { StatBadge } from '../../src/components/nebula/StatBadge';
import { SectionLabel } from '../../src/components/nebula/SectionLabel';
import { FormField } from '../../src/components/nebula/FormField';
import { Search, Filter, UserPlus, AlertCircle } from 'lucide-react-native';
import { useApiCall } from '../../src/hooks/useApiCall';
import { traineeService } from '../../src/services/traineeService';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { showToast } from '../../src/utils/toast';
import { StatusBadge } from '../../src/components/nebula/StatusBadge';
import { useMemo, useEffect } from 'react';

const FILTERS = ['All', 'Active', 'Expiring', 'Expired'] as const;
type FilterType = typeof FILTERS[number];

const GENDER_OPTIONS = [
  { label: 'Male',   value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other',  value: 'OTHER' },
];

const FITNESS_GOAL_OPTIONS = [
  { label: 'Weight Loss',       value: 'WEIGHT_LOSS' },
  { label: 'Muscle Gain',       value: 'MUSCLE_GAIN' },
  { label: 'Endurance',         value: 'ENDURANCE' },
  { label: 'Flexibility',       value: 'FLEXIBILITY' },
  { label: 'General Fitness',   value: 'GENERAL_FITNESS' },
  { label: 'Athletic Training', value: 'ATHLETIC_TRAINING' },
  { label: 'Rehabilitation',    value: 'REHABILITATION' },
];

const BLOOD_GROUP_OPTIONS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

const TRAINING_TYPE_OPTIONS = [
  { label: 'Personal Training', value: 'PERSONAL_TRAINING' },
  { label: 'Self Training',     value: 'SELF_TRAINING' },
];

const PREFERRED_TIME_OPTIONS = [
  { label: 'Flexible',      value: 'FLEXIBLE' },
  { label: 'Early Morning', value: 'EARLY_MORNING' },
  { label: 'Morning',       value: 'MORNING' },
  { label: 'Afternoon',     value: 'AFTERNOON' },
  { label: 'Evening',       value: 'EVENING' },
  { label: 'Night',         value: 'NIGHT' },
];

export default function GymAdminMembers() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Trigger modal from navigation params
  useEffect(() => {
    if (params.add === 'true') {
      setModalVisible(true);
      // Optional: Clear param so it doesn't re-open on reload if desired
      // router.setParams({ add: undefined });
    }
  }, [params.add]);

  // Form State
  const [name, setName]                           = useState('');
  const [email, setEmail]                         = useState('');
  const [password, setPassword]                   = useState('');
  const [phone, setPhone]                         = useState('');
  const [height, setHeight]                       = useState('');
  const [weight, setWeight]                       = useState('');
  const [dateOfBirth, setDateOfBirth]             = useState('');
  const [gender, setGender]                       = useState<'MALE'|'FEMALE'|'OTHER'|''>('');
  const [bloodGroup, setBloodGroup]               = useState('');
  const [emergencyContactName, setEmergencyContactName]   = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [fitnessGoal, setFitnessGoal]             = useState<string>('');
  const [referralSource, setReferralSource]       = useState('');
  const [qrCodeId, setQrCodeId]                   = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl]     = useState('');
  const [trainingType, setTrainingType]           = useState<'PERSONAL_TRAINING'|'SELF_TRAINING'>('SELF_TRAINING');
  const [preferredTime, setPreferredTime]         = useState('FLEXIBLE');

  const { data: members, loading, refreshing, refetch } = useApiCall(
    () => traineeService.getAll(), []
  );

  const [trainees, setTrainees] = useState<any[]>([]);
  // Use useEffect to sync trainees state when data is loaded
  React.useEffect(() => {
    if (members) {
      setTrainees(members);
    }
  }, [members]);

  const validateForm = (): string | null => {
    if (!name.trim())
      return 'Full name is required';
    if (!email.trim())
      return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return 'Enter a valid email address';
    if (!password.trim())
      return 'Password is required';
    if (password.length < 6)
      return 'Password must be at least 6 characters';
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth))
      return 'Date of birth must be in YYYY-MM-DD format';
    if (height && isNaN(parseFloat(height)))
      return 'Height must be a valid number';
    if (weight && isNaN(parseFloat(weight)))
      return 'Weight must be a valid number';
    return null;
  };

  const handleAddMember = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      const payload: Record<string, any> = {
        name:     name.trim(),
        email:    email.trim().toLowerCase(),
        password: password,
        phone:    phone.trim(),
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        dateOfBirth,
        gender: gender || 'MALE',
        bloodGroup,
        emergencyContactName,
        emergencyContactPhone,
        medicalConditions,
        fitnessGoal,
        referralSource,
        qrCodeId,
        profilePhotoUrl,
        trainingType,
        preferredTime,
        role: 'TRAINEE'
      };

      await traineeService.create(payload);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Member added successfully', 'success');

      closeAndReset();
      refetch();

    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || '';
      if (msg.toLowerCase().includes('409') ||
          msg.toLowerCase().includes('already exists') ||
          msg.toLowerCase().includes('duplicate')) {
        setFormError('A member with this email already exists');
      } else {
        setFormError(msg || 'Failed to add member. Please try again.');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  const closeAndReset = () => {
    setModalVisible(false);
    setName(''); setEmail(''); setPassword(''); setPhone('');
    setHeight(''); setWeight(''); setDateOfBirth('');
    setGender(''); setBloodGroup('');
    setEmergencyContactName(''); setEmergencyContactPhone('');
    setMedicalConditions(''); setFitnessGoal('');
    setReferralSource(''); setQrCodeId(''); setProfilePhotoUrl('');
    setTrainingType('SELF_TRAINING'); setPreferredTime('FLEXIBLE');
    setFormError(null);
  };

  const displayMembers = useMemo(() => {
    let filtered = trainees;
    
    // Status filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter((m: any) => m.membershipStatus === activeFilter.toUpperCase());
    }

    // Text search
    if (searchQuery) {
      filtered = filtered.filter((m: any) => 
        (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [trainees, activeFilter, searchQuery]);

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Members" 
        rightSlot={
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <UserPlus color="#000" size={24} />
          </TouchableOpacity>
        }
      />
      
      {/* Search Bar - Peak White style */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#8E8E93" size={20} />
          <TextInput 
            placeholder="Search members..." 
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Row - Peak White pills */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTERS.map((filter) => (
            <TouchableOpacity 
              key={filter} 
              onPress={() => {
                setActiveFilter(filter);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.filterPill,
                activeFilter === filter && styles.activeFilterPill
              ]}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText
              ]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Member List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : displayMembers.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={styles.emptyText}>
            No members found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayMembers}
          keyExtractor={(item: any) => item.id?.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor="#000" />}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: '/(gym)/member-detail' as any,
                    params: { traineeId: item.id }
                  });
                }}
              >
                <GlassCard style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <View style={styles.avatarWrap}>
                      <AvatarRing size="md" name={item.name} imageUri={item.profilePhotoUrl} />
                    </View>
                    <View style={styles.details}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.email}>{item.email}</Text>
                    </View>
                    <View style={styles.rightContent}>
                      <StatusBadge status={item.membershipStatus || 'NO_PLAN'} small />
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Add Member Modal Overhauled with Full Fields & Light Theme */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAndReset}
      >
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#F2F2F7',
            backgroundColor: '#FFFFFF',
          }}>
            <TouchableOpacity onPress={closeAndReset} disabled={submitting}>
              <Text style={{ fontSize: 16, color: '#FF3B30', fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 17, fontWeight: '800', color: '#000000' }}>Add Member</Text>

            <TouchableOpacity onPress={handleAddMember} disabled={submitting}>
              {submitting
                ? <ActivityIndicator size="small" color="#000" />
                : <Text style={{ fontSize: 16, fontWeight: '800', color: '#007AFF' }}>Save</Text>
              }
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {formError && (
                <View style={{ backgroundColor: '#FF3B3015', borderWidth: 1, borderColor: '#FF3B3030', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} color="#FF3B30" />
                  <Text style={{ fontSize: 13, color: '#FF3B30', flex: 1 }}>{formError}</Text>
                </View>
              )}

              {/* ── Section 1: Account Info ── */}
              <SectionLabel label="ACCOUNT INFO" />
              <FormField label="Full Name *" placeholder="Member Name" value={name} onChangeText={setName} />
              <FormField label="Email *" placeholder="member@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <FormField label="Password *" placeholder="Min 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
              <FormField label="Phone" placeholder="+91..." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              {/* ── Section 2: Physical Info ── */}
              <SectionLabel label="PHYSICAL INFO" style={{ marginTop: 8 }} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <FormField label="Height" placeholder="0.0" value={height} onChangeText={setHeight} keyboardType="decimal-pad" suffix="cm" />
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label="Weight" placeholder="0.0" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" suffix="kg" />
                </View>
              </View>
              <FormField label="Date of Birth" placeholder="YYYY-MM-DD" value={dateOfBirth} onChangeText={setDateOfBirth} keyboardType="numbers-and-punctuation" />

              <Text style={styles.inputGroupLabel}>Gender</Text>
              <View style={styles.selectableRow}>
                {GENDER_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setGender(opt.value as any)}
                    style={[styles.selectableItem, gender === opt.value && styles.activeSelectableItem]}
                  >
                    <Text style={[styles.selectableText, gender === opt.value && styles.activeSelectableText]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputGroupLabel}>Blood Group</Text>
              <View style={styles.gridSelectableRow}>
                {BLOOD_GROUP_OPTIONS.map(bg => (
                  <TouchableOpacity
                    key={bg}
                    onPress={() => setBloodGroup(bg)}
                    style={[styles.gridSelectableItem, bloodGroup === bg && styles.activeSelectableItem]}
                  >
                    <Text style={[styles.selectableText, bloodGroup === bg && styles.activeSelectableText]}>{bg}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Section 3: Training Config ── */}
              <SectionLabel label="TRAINING CONFIG" style={{ marginTop: 8 }} />
              <Text style={styles.inputGroupLabel}>Training Type</Text>
              <View style={styles.selectableRow}>
                {TRAINING_TYPE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setTrainingType(opt.value as any)}
                    style={[styles.selectableItem, trainingType === opt.value && styles.activeSelectableItem]}
                  >
                    <Text style={[styles.selectableText, trainingType === opt.value && styles.activeSelectableText]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputGroupLabel}>Preferred Time</Text>
              <View style={styles.gridSelectableRow}>
                {PREFERRED_TIME_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setPreferredTime(opt.value)}
                    style={[styles.gridSelectableItem, { width: '31%' }, preferredTime === opt.value && styles.activeSelectableItem]}
                  >
                    <Text style={[styles.selectableSmallText, preferredTime === opt.value && styles.activeSelectableText]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Section 4: Fitness Goals ── */}
              <SectionLabel label="FITNESS GOALS" style={{ marginTop: 8 }} />
              <View style={styles.gridSelectableRow}>
                {FITNESS_GOAL_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setFitnessGoal(opt.value)}
                    style={[styles.gridSelectableItem, { width: '48%' }, fitnessGoal === opt.value && styles.activeSelectableItem]}
                  >
                    <Text style={[styles.selectableSmallText, fitnessGoal === opt.value && styles.activeSelectableText]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Section 5: Medical & Emergency ── */}
              <SectionLabel label="MEDICAL & EMERGENCY" style={{ marginTop: 8 }} />
              <View style={[styles.textAreaContainer, nebulaGold.colors.shadow.light]}>
                <Text style={styles.textAreaLabel}>Medical Conditions</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Medical conditions (optional)"
                  placeholderTextColor="#8E8E93"
                  value={medicalConditions}
                  onChangeText={setMedicalConditions}
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <FormField label="EC Name" placeholder="Contact Name" value={emergencyContactName} onChangeText={setEmergencyContactName} />
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label="EC Phone" placeholder="Phone" value={emergencyContactPhone} onChangeText={setEmergencyContactPhone} keyboardType="phone-pad" />
                </View>
              </View>

              {/* ── Section 6: Others ── */}
              <SectionLabel label="OTHERS" style={{ marginTop: 8 }} />
              <FormField label="Referral Source" placeholder="How did they find us?" value={referralSource} onChangeText={setReferralSource} />
              <FormField label="Profile Photo API URL" placeholder="https://..." value={profilePhotoUrl} onChangeText={setProfilePhotoUrl} autoCapitalize="none" />
              
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    ...nebulaGold.colors.shadow.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 14,
  },
  inputGroupLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectableRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  selectableItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEBF0',
    ...nebulaGold.colors.shadow.light,
  },
  activeSelectableItem: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  selectableText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
  },
  selectableSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    textAlign: 'center',
  },
  activeSelectableText: {
    color: '#FFFFFF',
  },
  gridSelectableRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  gridSelectableItem: {
    width: '23%',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEBF0',
    ...nebulaGold.colors.shadow.light,
  },
  textAreaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    marginBottom: 8,
  },
  textAreaLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textArea: {
    fontSize: 14,
    color: '#000000',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  filterRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEBF0',
    ...nebulaGold.colors.shadow.light,
  },
  activeFilterPill: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  memberCard: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    ...nebulaGold.colors.shadow.light,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatarWrap: {
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  email: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '500',
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
});

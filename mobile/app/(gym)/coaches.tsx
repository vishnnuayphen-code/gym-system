import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import { StatBadge } from '../../src/components/nebula/StatBadge';
import { Search, UserPlus, Filter } from 'lucide-react-native';
import { useApiCall } from '../../src/hooks/useApiCall';
import { coachService } from '../../src/services/coachService';
import { ActivityIndicator, RefreshControl, Modal, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { showToast } from '../../src/utils/toast';
import { FormField } from '../../src/components/nebula/FormField';
import { SectionLabel } from '../../src/components/nebula/SectionLabel';
import { AlertCircle } from 'lucide-react-native';
import { useMemo, useEffect } from 'react';

const COACH_FILTERS = ['All', 'Strength', 'Yoga', 'Cardio', 'HIIT', 'Zumba'] as const;
type CoachFilterType = typeof COACH_FILTERS[number];

const EMPLOYMENT_TYPE_OPTIONS = [
  { label: 'Full Time',     value: 'FULL_TIME' },
  { label: 'Session Based', value: 'SESSION_BASED' },
];

const SESSION_TYPE_OPTIONS = [
  { label: 'Both',    value: 'BOTH' },
  { label: 'Morning', value: 'MORNING' },
  { label: 'Evening', value: 'EVENING' },
];

export default function GymAdminCoaches() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data: coachesData, loading, refreshing, refetch } = useApiCall(
    () => coachService.getAll(), []
  );

  const [activeFilter, setActiveFilter] = useState<CoachFilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Trigger modal from navigation params
  useEffect(() => {
    if (params.add === 'true') {
      setAddModalVisible(true);
    }
  }, [params.add]);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [certifications, setCertifications] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [employmentType, setEmploymentType] = useState<'FULL_TIME' | 'SESSION_BASED'>('FULL_TIME');
  const [sessionType, setSessionType] = useState<'BOTH' | 'MORNING' | 'EVENING'>('BOTH');

  const closeAndReset = () => {
    setAddModalVisible(false);
    setName(''); setEmail(''); setPassword('');
    setPhone(''); setSpecialization('');
    setExperienceYears(''); setCertifications('');
    setBio(''); setDateOfBirth('');
    setGender(''); setProfilePhotoUrl('');
    setEmploymentType('FULL_TIME'); setSessionType('BOTH');
    setFormError(null);
  };

  const handleAddCoach = async () => {
    if (!name.trim()) { setFormError('Name is required'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Valid email is required'); return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters'); return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      const payload: Record<string, any> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      };

      if (phone) payload.phone = phone.trim();
      if (specialization) payload.specialization = specialization.trim();
      if (experienceYears) payload.experienceYears = parseInt(experienceYears);
      if (certifications) payload.certificationName = certifications.trim(); // matched to backend DTO field
      if (bio) payload.bio = bio.trim();
      if (dateOfBirth) payload.dateOfBirth = dateOfBirth;
      if (gender) payload.gender = gender;
      if (profilePhotoUrl) payload.profilePhotoUrl = profilePhotoUrl.trim();
      
      payload.employmentType = employmentType;
      payload.sessionType = sessionType;

      await coachService.create(payload);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Coach added successfully', 'success');

      closeAndReset();
      refetch();

    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || '';
      if (msg.toLowerCase().includes('409') ||
          msg.toLowerCase().includes('already exists')) {
        setFormError('A coach with this email already exists');
      } else {
        setFormError(msg || 'Failed to add coach. Please try again.');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  const displayCoaches = useMemo(() => {
    let filtered = coachesData || [];
    
    // Specialization filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter((c: any) => 
        (c.specialization || '').toLowerCase().includes(activeFilter.toLowerCase()) ||
        (c.specialty || '').toLowerCase().includes(activeFilter.toLowerCase())
      );
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c: any) => 
        (c.name || '').toLowerCase().includes(query) ||
        (c.email || '').toLowerCase().includes(query) ||
        (c.specialization || '').toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [coachesData, activeFilter, searchQuery]);

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Coaches" 
        rightSlot={
          <TouchableOpacity 
            onPress={() => setAddModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <UserPlus color="#000000" size={24} />
          </TouchableOpacity>
        }
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, nebulaGold.colors.shadow.light]}>
          <Search color="#8E8E93" size={20} />
          <TextInput 
            placeholder="Search coaches..." 
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Row */}
      <View style={{ marginBottom: 12 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {COACH_FILTERS.map((filter) => (
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

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (!displayCoaches || displayCoaches.length === 0) ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...nebulaGold.typography.body, color: '#8E8E93' }}>
            {searchQuery || activeFilter !== 'All' ? 'No coaches match your search.' : 'No coaches found.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayCoaches}
          keyExtractor={(item: any) => item.id?.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor="#000" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/(gym)/coach-detail' as any,
                  params: { coachId: item.id }
                });
              }}
            >
              <View style={[styles.coachCard, nebulaGold.colors.shadow.light]}>
                <View style={styles.coachInfo}>
                  <AvatarRing size="md" name={item.name} imageUri={item.profilePhotoUrl} />
                  <View style={styles.details}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.specialty}>{item.specialization || item.specialty || 'General Training'}</Text>
                  </View>
                  <View style={styles.rightContent}>
                    <StatBadge value={item.traineeCount || item.trainees || 0} label="Trainees" />
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: '#34C759' }
                    ]} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Add Coach Modal Overhauled to Peak White Theme */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAndReset}
      >
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>

          {/* Header */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20, paddingTop: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#F2F2F7',
            backgroundColor: '#FFFFFF',
          }}>
            <TouchableOpacity onPress={closeAndReset} disabled={submitting}>
              <Text style={{ fontSize: 16, color: '#FF3B30', fontWeight: '700' }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#000000' }}>
              Add Coach
            </Text>
            <TouchableOpacity onPress={handleAddCoach} disabled={submitting}>
              {submitting
                ? <ActivityIndicator size="small" color="#000" />
                : <Text style={{ fontSize: 16, fontWeight: '800', color: '#007AFF' }}>
                    Save
                  </Text>
              }
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {formError && (
                <View style={{
                  backgroundColor: '#FF3B3015',
                  borderWidth: 1,
                  borderColor: '#FF3B3030',
                  borderRadius: 12,
                  padding: 12, marginBottom: 16,
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                }}>
                  <AlertCircle size={16} color="#FF3B30" />
                  <Text style={{ fontSize: 13, color: '#FF3B30', flex: 1 }}>
                    {formError}
                  </Text>
                </View>
              )}

              {/* ── Account Info ── */}
              <SectionLabel label="ACCOUNT INFO" />
              <FormField label="Full Name *"   value={name}     onChangeText={setName}     autoCapitalize="words"  placeholder="Enter coach full name" />
              <FormField label="Email *"       value={email}    onChangeText={setEmail}    keyboardType="email-address" autoCapitalize="none" placeholder="coach@gymname.com" />
              <FormField label="Password *"    value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" placeholder="Min 6 characters" />
              <FormField label="Phone"         value={phone}    onChangeText={setPhone}    keyboardType="phone-pad" placeholder="+91..." />

              {/* ── Professional Info ── */}
              <SectionLabel label="PROFESSIONAL INFO" style={{ marginTop: 8 }} />
              <FormField
                label="Specialization"
                value={specialization}
                onChangeText={setSpecialization}
                placeholder="e.g. Strength, Yoga, HIIT"
                autoCapitalize="words"
              />
              <FormField
                label="Experience (Years)"
                value={experienceYears}
                onChangeText={setExperienceYears}
                keyboardType="number-pad"
                placeholder="0"
                suffix="yrs"
              />
              <FormField
                label="Certifications"
                value={certifications}
                onChangeText={setCertifications}
                placeholder="e.g. ACE, NASM"
                autoCapitalize="words"
              />

              {/* Bio — multiline */}
              <Text style={styles.inputGroupLabel}>Bio</Text>
              <View style={[styles.textAreaContainer, nebulaGold.colors.shadow.light]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Tell us about the coach..."
                  placeholderTextColor="#8E8E93"
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* ── Personal Info ── */}
              <SectionLabel label="PERSONAL INFO" style={{ marginTop: 8 }} />
              <FormField
                label="Date of Birth"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
              />

              {/* Gender selector */}
              <Text style={styles.inputGroupLabel}>Gender</Text>
              <View style={styles.selectableRow}>
                {['MALE', 'FEMALE', 'OTHER'].map(g => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => {
                      setGender(g);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.selectableItem,
                      gender === g && styles.activeSelectableItem
                    ]}
                  >
                    <Text style={[
                      styles.selectableText,
                      gender === g && styles.activeSelectableText
                    ]}>
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Employment info ── */}
              <SectionLabel label="EMPLOYMENT CONFIG" style={{ marginTop: 8 }} />
              
              <Text style={styles.inputGroupLabel}>Employment Type</Text>
              <View style={styles.selectableRow}>
                {EMPLOYMENT_TYPE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => {
                      setEmploymentType(opt.value as any)
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }}
                    style={[
                      styles.selectableItem,
                      employmentType === opt.value && styles.activeSelectableItem
                    ]}
                  >
                    <Text style={[
                      styles.selectableText,
                      employmentType === opt.value && styles.activeSelectableText
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {employmentType === 'SESSION_BASED' && (
                <>
                  <Text style={styles.inputGroupLabel}>Session Capacity</Text>
                  <View style={styles.selectableRow}>
                    {SESSION_TYPE_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => {
                          setSessionType(opt.value as any)
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        }}
                        style={[
                          styles.selectableItem,
                          sessionType === opt.value && styles.activeSelectableItem
                        ]}
                      >
                        <Text style={[
                          styles.selectableText,
                          sessionType === opt.value && styles.activeSelectableText
                        ]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <FormField
                label="Profile Photo URL"
                value={profilePhotoUrl}
                onChangeText={setProfilePhotoUrl}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="https://..."
              />

              <Text style={{
                fontSize: 11, color: '#8E8E93',
                textAlign: 'center', marginTop: 12, fontWeight: '600'
              }}>
                * Required fields
              </Text>
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#000000',
    fontSize: 15,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    backgroundColor: '#FFFFFF',
  },
  activeFilterPill: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  coachCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000000',
  },
  specialty: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 4,
  },
  // Form Styles
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
  activeSelectableText: {
    color: '#FFFFFF',
  },
  textAreaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    marginBottom: 16,
  },
  textArea: {
    fontSize: 15,
    color: '#000000',
    minHeight: 80,
    textAlignVertical: 'top',
    fontWeight: '500',
  }
});

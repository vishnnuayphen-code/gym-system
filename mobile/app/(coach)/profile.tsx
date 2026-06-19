import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import { GoldButton } from '../../src/components/nebula/GoldButton';
import { useAuthStore } from '../../store/authStore';
import { useApiCall } from '../../src/hooks/useApiCall';
import { coachService } from '../../src/services/coachService';
import { ActivityIndicator, RefreshControl } from 'react-native';

export default function CoachProfile() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  
  const { data: profileData, loading, refreshing, refetch } = useApiCall(
    () => coachService.getCoachProfile(user?.id?.toString() || ''),
    [user?.id]
  );
  
  const profile = profileData;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    specialty: '',
    bio: '',
    experienceYears: '0',
    phone: ''
  });

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        specialty: profile.specialty || '',
        bio: profile.bio || '',
        experienceYears: profile.experienceYears?.toString() || '0',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await coachService.updateCoachProfile(user?.id?.toString() || '', {
        ...form,
        experienceYears: parseInt(form.experienceYears, 10) || 0,
      });
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
              <AvatarRing size="lg" name={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.email || 'Coach'} imageUri={profile?.photoUrl || undefined} />
              <TouchableOpacity style={styles.changePhotoBtn}>
                <Text style={styles.changePhotoText}>Tap to change</Text>
              </TouchableOpacity>
              
              {!editing ? (
                <Text style={styles.profileName}>{`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Your Name'}</Text>
              ) : (
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                  <TextInput
                    style={[styles.input, styles.nameInput, {flex: 1}]}
                    value={form.firstName}
                    onChangeText={(text) => setForm({ ...form, firstName: text })}
                    placeholder="First"
                    placeholderTextColor={nebulaGold.colors.text.secondary}
                  />
                  <TextInput
                    style={[styles.input, styles.nameInput, {flex: 1}]}
                    value={form.lastName}
                    onChangeText={(text) => setForm({ ...form, lastName: text })}
                    placeholder="Last"
                    placeholderTextColor={nebulaGold.colors.text.secondary}
                  />
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Info</Text>
              <GlassCard style={styles.card}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Role</Text>
                  <Text style={styles.fieldValueReadOnly}>Coach</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Specialty</Text>
                  {!editing ? (
                    <Text style={styles.fieldValue}>{profile?.specialty || '--'}</Text>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={form.specialty}
                      onChangeText={(text) => setForm({ ...form, specialty: text })}
                      placeholder="e.g. Bodybuilding"
                      placeholderTextColor={nebulaGold.colors.text.secondary}
                    />
                  )}
                </View>
                <View style={styles.divider} />
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Experience (Yrs)</Text>
                  {!editing ? (
                    <Text style={styles.fieldValue}>{profile?.experienceYears || '0'}</Text>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={form.experienceYears}
                      onChangeText={(text) => setForm({ ...form, experienceYears: text })}
                      keyboardType="numeric"
                      placeholder="Years"
                      placeholderTextColor={nebulaGold.colors.text.secondary}
                    />
                  )}
                </View>
              </GlassCard>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <GlassCard style={styles.card}>
                <View style={{ minHeight: 60 }}>
                  {!editing ? (
                    <Text style={styles.bioText}>{profile?.bio || 'Add a bio describing your training style...'}</Text>
                  ) : (
                    <TextInput
                      style={styles.bioInput}
                      value={form.bio}
                      onChangeText={(text) => setForm({ ...form, bio: text })}
                      placeholder="Bio..."
                      placeholderTextColor={nebulaGold.colors.text.secondary}
                      multiline
                    />
                  )}
                </View>
              </GlassCard>
            </View>

            <View style={styles.actionSection}>
              {!editing ? (
                <GoldButton title="Edit Profile" onPress={() => setEditing(true)} />
              ) : (
                <GoldButton 
                  title={saving ? "Saving..." : "Save Changes"} 
                  onPress={handleSave} 
                  disabled={saving}
                />
              )}
              {editing && (
                <GoldButton 
                  title="Cancel" 
                  onPress={() => {
                    setEditing(false);
                    setForm({
                      firstName: profile?.firstName || '',
                      lastName: profile?.lastName || '',
                      specialty: profile?.specialty || '',
                      bio: profile?.bio || '',
                      experienceYears: profile?.experienceYears?.toString() || '0',
                      phone: profile?.phone || ''
                    });
                  }} 
                  variant="outline" 
                  style={{ marginTop: 12 }} 
                />
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
  container: { flex: 1, backgroundColor: nebulaGold.colors.background.primary },
  scrollContent: { paddingBottom: 20 },
  headerSection: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  changePhotoBtn: { marginTop: 12 },
  changePhotoText: { ...nebulaGold.typography.caption, color: nebulaGold.colors.gold.primary },
  profileName: { ...nebulaGold.typography.heading2, color: nebulaGold.colors.text.primary, marginTop: 16 },
  section: { paddingHorizontal: nebulaGold.spacing.lg, marginBottom: 24 },
  sectionTitle: { ...nebulaGold.typography.label, color: nebulaGold.colors.text.secondary, marginBottom: 12 },
  card: { padding: 16 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 },
  fieldLabel: { ...nebulaGold.typography.body, color: nebulaGold.colors.text.secondary, width: 90 },
  fieldValue: { ...nebulaGold.typography.body, color: nebulaGold.colors.text.primary, flex: 1, textAlign: 'right' },
  fieldValueReadOnly: { ...nebulaGold.typography.body, color: nebulaGold.colors.text.secondary, flex: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: 'rgba(201, 168, 76, 0.1)', marginVertical: 12 },
  input: {
    flex: 1,
    color: nebulaGold.colors.gold.primary,
    textAlign: 'right',
    padding: 0,
    ...nebulaGold.typography.body
  },
  nameInput: {
    ...nebulaGold.typography.heading2,
    borderBottomWidth: 1,
    borderBottomColor: nebulaGold.colors.gold.primary,
    textAlign: 'center'
  },
  bioText: { ...nebulaGold.typography.body, color: nebulaGold.colors.text.primary },
  bioInput: { ...nebulaGold.typography.body, color: nebulaGold.colors.gold.primary, padding: 0, textAlignVertical: 'top', minHeight: 60 },
  actionSection: { paddingHorizontal: nebulaGold.spacing.lg, marginTop: 8 },
  logoutBtn: { marginTop: 40, alignItems: 'center', alignSelf: 'center', padding: 10 },
  logoutText: { ...nebulaGold.typography.label, color: nebulaGold.colors.status.danger, textTransform: 'uppercase', letterSpacing: 1 },
});

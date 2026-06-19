import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { nebulaGold } from '../../../src/theme/nebulaGold';
import { ScreenHeader } from '../../../src/components/nebula/ScreenHeader';
import { GoldButton } from '../../../src/components/nebula/GoldButton';
import { Search, User, Mail, Shield, Building2, Key, PlusCircle, X, RefreshCw } from 'lucide-react-native';
import { useApiCall } from '../../../src/hooks/useApiCall';
import { superAdminService } from '../../../src/services/superAdminService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SuperAdminAdmins() {
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gymId, setGymId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: admins, loading, refetch } = useApiCall(() => superAdminService.getAllAdmins(), []);
  const { data: gyms } = useApiCall(() => superAdminService.getAllGyms(), []);

  const filteredAdmins = (admins || []).filter((a: any) => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = async (adminId: number, currentStatus: boolean) => {
    Alert.alert(
      currentStatus ? 'Deactivate Admin?' : 'Activate Admin?',
      currentStatus ? 'This admin will no longer be able to log in.' : 'This admin will be allowed to log in.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: currentStatus ? 'Deactivate' : 'Activate', 
          style: currentStatus ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await superAdminService.toggleAdminStatus(adminId);
              refetch();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  const handleCreateAdmin = async () => {
    if (!name || !email || !password || !gymId) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await superAdminService.createAdmin({ name, email, password, gymId: Number(gymId) });
      Alert.alert('Success', 'Gym Admin created successfully!');
      setShowAddModal(false);
      setName(''); setEmail(''); setPassword(''); setGymId('');
      refetch();
    } catch (e: any) {
      Alert.alert('Creation Failed', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAdmin = async () => {
    if (!name || !email || !selectedAdminId) return;
    setIsSubmitting(true);
    try {
      await superAdminService.updateAdmin(selectedAdminId, { name, email, gymId: gymId ? Number(gymId) : null });
      Alert.alert('Success', 'Admin updated successfully!');
      setShowEditModal(false);
      refetch();
    } catch (e: any) {
      Alert.alert('Update Failed', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !selectedAdminId) return;
    setIsSubmitting(true);
    try {
      await superAdminService.resetAdminPassword(selectedAdminId, password);
      Alert.alert('Success', 'Password has been reset.');
      setShowResetModal(false);
      setPassword('');
    } catch (e: any) {
      Alert.alert('Reset Failed', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (admin: any) => {
    setSelectedAdminId(admin.id);
    setName(admin.name);
    setEmail(admin.email);
    setGymId(admin.gym?.id?.toString() || '');
    setShowEditModal(true);
  };

  const openResetModal = (adminId: number) => {
    setSelectedAdminId(adminId);
    setPassword('');
    setShowResetModal(true);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Admin Management"
        subtitle="Platform Gym Admins"
        showBack={false}
        rightSlot={
          <View style={styles.headerRightSlot}>
            <TouchableOpacity onPress={() => refetch()} style={styles.headerBtn} disabled={loading}>
              <RefreshCw size={20} color={nebulaGold.colors.gold.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.headerBtn}>
              <PlusCircle size={20} color={nebulaGold.colors.gold.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.searchContainer}>
        <Search color={nebulaGold.colors.text.secondary} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search admins by name or email..."
          placeholderTextColor={nebulaGold.colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#000000" style={{ marginTop: 40 }} />
        ) : filteredAdmins.length > 0 ? (
          filteredAdmins.map((admin: any) => (
            <View key={admin.id} style={styles.adminCard}>
              <View style={styles.adminHeader}>
                <View style={styles.adminTitleRow}>
                  <User size={20} color="#000000" />
                  <Text style={styles.adminName}>{admin.name}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.statusBadge, admin.isActive ? styles.badgeActive : styles.badgeInactive]}
                  onPress={() => handleToggleStatus(admin.id, admin.isActive)}
                >
                  <Text style={[styles.statusText, admin.isActive ? styles.textActive : styles.textInactive]}>
                    {admin.isActive ? 'Active' : 'Disabled'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.adminDetailsRow}>
                <Mail size={14} color="#8E8E93" />
                <Text style={styles.adminDetailText}>{admin.email}</Text>
              </View>
              
              <View style={styles.adminDetailsRow}>
                <Building2 size={14} color="#8E8E93" />
                <Text style={styles.adminDetailText}>{admin.gym ? admin.gym.name : 'No Gym Assigned'}</Text>
              </View>
              
              <View style={styles.adminFooter}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openResetModal(admin.id)}>
                  <Key size={14} color="#000000" />
                  <Text style={styles.actionBtnText}>Reset Password</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(admin)}>
                  <Shield size={14} color="#000000" />
                  <Text style={styles.actionBtnText}>Edit Access</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No admins found.</Text>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Admin Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === 'ios' ? 20 : insets.top + 20 }]}>
            <Text style={styles.modalTitle}>Create Gym Admin</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeBtn}>
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.inputGroup}>
              <User size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Full Name *" value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputGroup}>
              <Mail size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} autoCapitalize="none" />
            </View>
            <View style={styles.inputGroup}>
              <Key size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
            <View style={styles.inputGroup}>
              <Building2 size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Gym ID *" value={gymId} onChangeText={setGymId} keyboardType="numeric" />
            </View>
            <GoldButton title={isSubmitting ? "Creating..." : "Create Admin"} onPress={handleCreateAdmin} disabled={isSubmitting} style={{ marginTop: 24, height: 56 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === 'ios' ? 20 : insets.top + 20 }]}>
            <Text style={styles.modalTitle}>Edit Admin Details</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.closeBtn}>
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.inputGroup}>
              <User size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Full Name *" value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputGroup}>
              <Mail size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} autoCapitalize="none" />
            </View>
            <View style={styles.inputGroup}>
              <Building2 size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Gym ID" value={gymId} onChangeText={setGymId} keyboardType="numeric" />
            </View>
            <GoldButton title={isSubmitting ? "Saving..." : "Save Changes"} onPress={handleUpdateAdmin} disabled={isSubmitting} style={{ marginTop: 24, height: 56 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Reset Password Modal */}
      <Modal visible={showResetModal} animationType="fade" transparent={true}>
        <View style={styles.overlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Reset Password</Text>
            <Text style={styles.dialogMessage}>Enter the new password for this admin account.</Text>
            <View style={[styles.inputGroup, { marginBottom: 24 }]}>
              <Key size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="New Password" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
            <View style={styles.dialogActions}>
              <TouchableOpacity onPress={() => setShowResetModal(false)} style={styles.dialogCancelBtn}>
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleResetPassword} style={styles.dialogConfirmBtn}>
                <Text style={styles.dialogConfirmText}>{isSubmitting ? 'Saving...' : 'Reset'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: nebulaGold.colors.background.primary },
  headerRightSlot: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: { padding: 8 },
  headerAddBtn: { padding: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 24, paddingHorizontal: 16, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#EBEBF0', marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#000000', height: '100%' },
  scrollContent: { paddingHorizontal: 24 },
  
  adminCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F2F2F7', ...nebulaGold.colors.shadow.light },
  adminHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  adminTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adminName: { fontSize: 16, fontWeight: '800', color: '#000000' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeActive: { backgroundColor: '#34C75915' },
  badgeInactive: { backgroundColor: '#FF3B3015' },
  statusText: { fontSize: 10, fontWeight: '800' },
  textActive: { color: '#34C759' },
  textInactive: { color: '#FF3B30' },
  
  adminDetailsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  adminDetailText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  
  adminFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionBtnText: { fontSize: 11, fontWeight: '800', color: '#000000' },
  
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontWeight: '600' },

  // Modal Styles
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  closeBtn: { padding: 4, marginRight: -4 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#000000' },
  modalScroll: { padding: 24 },
  
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'transparent' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#000000', height: '100%' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialogCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: '100%' },
  dialogTitle: { fontSize: 18, fontWeight: '800', color: '#000000', marginBottom: 8 },
  dialogMessage: { fontSize: 14, color: '#8E8E93', marginBottom: 24 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  dialogCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  dialogCancelText: { fontSize: 14, fontWeight: '700', color: '#8E8E93' },
  dialogConfirmBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#000000' },
  dialogConfirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' }
});

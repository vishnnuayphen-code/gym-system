import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GoldButton } from '../../src/components/nebula/GoldButton';
import { Search, Building2, MapPin, Phone, User, Mail, Lock, PlusCircle, ArrowLeft } from 'lucide-react-native';
import { useApiCall } from '../../src/hooks/useApiCall';
import { superAdminService } from '../../src/services/superAdminService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SuperAdminGyms() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(params.add === 'true');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.add === 'true') {
      setShowAddModal(true);
    }
  }, [params.add]);

  const closeAddModal = () => {
    setShowAddModal(false);
    router.setParams({ add: 'false' });
  };
  
  const { data: gyms, loading, refetch } = useApiCall(() => superAdminService.getAllGyms(), []);

  // Form State
  const [gymName, setGymName] = useState('');
  const [gymAddress, setGymAddress] = useState('');
  const [gymPhone, setGymPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  const filteredGyms = (gyms || []).filter((g: any) => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.address && g.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleStatus = async (gymId: number, currentStatus: boolean) => {
    Alert.alert(
      currentStatus ? 'Suspend Gym?' : 'Activate Gym?',
      currentStatus ? 'This will prevent all users of this gym from accessing the platform.' : 'This will restore access for all users of this gym.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: currentStatus ? 'Suspend' : 'Activate', 
          style: currentStatus ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await superAdminService.toggleGymStatus(gymId);
              refetch();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  const handleCreateTenant = async () => {
    if (!gymName || !ownerName || !ownerEmail || !ownerPassword) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await superAdminService.createGymTenant({
        gymName,
        gymAddress,
        gymPhone,
        ownerName,
        ownerEmail,
        ownerPassword
      });
      Alert.alert('Success', 'Tenant and Owner account created successfully!');
      closeAddModal();
      
      // Reset form
      setGymName(''); setGymAddress(''); setGymPhone('');
      setOwnerName(''); setOwnerEmail(''); setOwnerPassword('');
      refetch();
    } catch (e: any) {
      Alert.alert('Creation Failed', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Manage Tenants" 
        subtitle="Platform Gyms"
        showBack={true}
        onBackPress={() => router.push('/(superadmin)/(tabs)/overview')}
        rightSlot={
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.headerAddBtn}>
            <PlusCircle size={20} color={nebulaGold.colors.gold.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <Search color={nebulaGold.colors.text.secondary} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search gyms..."
          placeholderTextColor={nebulaGold.colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#000000" style={{ marginTop: 40 }} />
        ) : filteredGyms.length > 0 ? (
          filteredGyms.map((gym: any) => (
            <View key={gym.id} style={styles.gymCard}>
              <View style={styles.gymHeader}>
                <View style={styles.gymTitleRow}>
                  <Building2 size={20} color="#000000" />
                  <Text style={styles.gymName}>{gym.name}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.statusBadge, gym.isActive ? styles.badgeActive : styles.badgeInactive]}
                  onPress={() => handleToggleStatus(gym.id, gym.isActive)}
                >
                  <Text style={[styles.statusText, gym.isActive ? styles.textActive : styles.textInactive]}>
                    {gym.isActive ? 'Active' : 'Suspended'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.gymDetailsRow}>
                <MapPin size={14} color="#8E8E93" />
                <Text style={styles.gymDetailText}>{gym.address || 'No address provided'}</Text>
              </View>
              
              <View style={styles.gymDetailsRow}>
                <Phone size={14} color="#8E8E93" />
                <Text style={styles.gymDetailText}>{gym.phone || 'No phone provided'}</Text>
              </View>
              
              <View style={styles.gymFooter}>
                <Text style={styles.dateText}>Onboarded: {new Date(gym.createdAt).toLocaleDateString()}</Text>
                <TouchableOpacity 
                  style={styles.viewBtn}
                  onPress={() => router.push(`/(superadmin)/gym/${gym.id}` as any)}
                >
                  <Text style={styles.viewBtnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No gyms found.</Text>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Tenant Onboarding Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === 'ios' ? 20 : insets.top + 20 }]}>
            <TouchableOpacity onPress={closeAddModal} style={styles.closeBtn}>
              <ArrowLeft size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Onboard New Tenant</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.sectionTitle}>Gym Details</Text>
            
            <View style={styles.inputGroup}>
              <Building2 size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Gym Name *" value={gymName} onChangeText={setGymName} />
            </View>
            
            <View style={styles.inputGroup}>
              <MapPin size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Address" value={gymAddress} onChangeText={setGymAddress} />
            </View>

            <View style={styles.inputGroup}>
              <Phone size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Phone Number" value={gymPhone} onChangeText={setGymPhone} keyboardType="phone-pad" />
            </View>

            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Owner Account Setup</Text>
            <Text style={styles.helperText}>This will create the initial Super/Gym Admin for this specific tenant.</Text>
            
            <View style={styles.inputGroup}>
              <User size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Owner Full Name *" value={ownerName} onChangeText={setOwnerName} />
            </View>

            <View style={styles.inputGroup}>
              <Mail size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Owner Email *" value={ownerEmail} onChangeText={setOwnerEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.inputGroup}>
              <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Initial Password *" value={ownerPassword} onChangeText={setOwnerPassword} secureTextEntry />
            </View>

            <GoldButton 
              title={isSubmitting ? "Creating..." : "Create Tenant & Owner"}
              onPress={handleCreateTenant}
              disabled={isSubmitting}
              style={{ marginTop: 24, height: 56 }}
            />
            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: nebulaGold.colors.background.primary },
  headerAddBtn: { padding: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 24, paddingHorizontal: 16, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#EBEBF0', marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#000000', height: '100%' },
  scrollContent: { paddingHorizontal: 24 },
  
  gymCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F2F2F7', ...nebulaGold.colors.shadow.light },
  gymHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  gymTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gymName: { fontSize: 16, fontWeight: '800', color: '#000000' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeActive: { backgroundColor: '#34C75915' },
  badgeInactive: { backgroundColor: '#FF3B3015' },
  statusText: { fontSize: 10, fontWeight: '800' },
  textActive: { color: '#34C759' },
  textInactive: { color: '#FF3B30' },
  
  gymDetailsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  gymDetailText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  
  gymFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
  dateText: { fontSize: 11, color: '#C7C7CC', fontWeight: '600' },
  viewBtn: { backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  viewBtnText: { fontSize: 11, fontWeight: '800', color: '#000000' },
  
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontWeight: '600' },

  // Modal Styles
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  closeBtn: { padding: 4, marginLeft: -4 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#000000' },
  modalScroll: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#000000', marginBottom: 16 },
  helperText: { fontSize: 13, color: '#8E8E93', marginBottom: 20, marginTop: -8 },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 24 },
  
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'transparent' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#000000', height: '100%' }
});

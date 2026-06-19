import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenHeader } from '../../../src/components/nebula/ScreenHeader';
import { GoldButton } from '../../../src/components/nebula/GoldButton';
import { nebulaGold } from '../../../src/theme/nebulaGold';
import { superAdminService } from '../../../src/services/superAdminService';
import { useApiCall } from '../../../src/hooks/useApiCall';
import { Users, UserCircle, DollarSign, Activity, Settings, Building2, MapPin, Phone, X, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function GymDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const gymId = Number(id);

  const { data: gymDetails, loading, refetch } = useApiCall(() => superAdminService.getGymDetails(gymId), [gymId]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [gymName, setGymName] = useState('');
  const [gymAddress, setGymAddress] = useState('');
  const [gymPhone, setGymPhone] = useState('');
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [showOpeningTimePicker, setShowOpeningTimePicker] = useState(false);
  const [showClosingTimePicker, setShowClosingTimePicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Pre-fill form when modal opens
  useEffect(() => {
    if (showEditModal && gymDetails?.gym) {
      setGymName(gymDetails.gym.name || '');
      setGymAddress(gymDetails.gym.address || '');
      setGymPhone(gymDetails.gym.phone || '');
      setOpeningTime(gymDetails.gym.openingTime || '06:00');
      setClosingTime(gymDetails.gym.closingTime || '22:00');
    }
  }, [showEditModal, gymDetails]);

  const handleUpdate = async () => {
    if (!gymName) {
      Alert.alert('Error', 'Gym Name is required');
      return;
    }

    setIsUpdating(true);
    try {
      await superAdminService.updateGym(gymId, {
        gymName,
        gymAddress,
        gymPhone,
        openingTime,
        closingTime
      });
      setShowEditModal(false);
      refetch();
    } catch (e: any) {
      Alert.alert('Update Failed', e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpeningTimeChange = (_event: any, time?: Date) => {
    if (time) {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      setOpeningTime(`${hours}:${minutes}`);
    }
    setShowOpeningTimePicker(false);
  };

  const handleClosingTimeChange = (_event: any, time?: Date) => {
    if (time) {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      setClosingTime(`${hours}:${minutes}`);
    }
    setShowClosingTimePicker(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={gymDetails?.gym?.name || "Gym Details"} 
        subtitle={gymDetails ? `ID: ${gymDetails.gym.id} • ${gymDetails.gym.isActive ? 'Active' : 'Suspended'}` : 'Loading...'}
        showBack={true}
        onBackPress={() => router.back()}
        rightSlot={
          <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.headerBtn}>
            <Settings size={20} color="#000000" />
          </TouchableOpacity>
        }
      />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#000000" style={{ marginTop: 40 }} />
        ) : gymDetails ? (
          <>
            <View style={styles.bentoGrid}>
              <View style={[styles.bentoBox, styles.bentoLeft]}>
                <View style={styles.iconContainer}>
                  <Users size={20} color="#000000" />
                </View>
                <Text style={styles.bentoValue}>{gymDetails.totalMembers}</Text>
                <Text style={styles.bentoLabel}>Total Trainees</Text>
              </View>
              
              <View style={[styles.bentoBox, styles.bentoRight]}>
                <View style={styles.iconContainer}>
                  <UserCircle size={20} color="#000000" />
                </View>
                <Text style={styles.bentoValue}>{gymDetails.totalCoaches}</Text>
                <Text style={styles.bentoLabel}>Total Coaches</Text>
              </View>

              <View style={[styles.bentoBox, styles.bentoLeft]}>
                <View style={[styles.iconContainer, { backgroundColor: '#34C75915' }]}>
                  <DollarSign size={20} color="#34C759" />
                </View>
                <Text style={[styles.bentoValue, { color: '#34C759' }]}>{gymDetails.revenue}</Text>
                <Text style={styles.bentoLabel}>Monthly Revenue</Text>
              </View>

              <View style={[styles.bentoBox, styles.bentoRight]}>
                <View style={styles.iconContainer}>
                  <Activity size={20} color="#000000" />
                </View>
                <Text style={styles.bentoValue}>{gymDetails.activeSessions}</Text>
                <Text style={styles.bentoLabel}>Active Sessions</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Tenant Information</Text>
              <View style={styles.infoRow}>
                <MapPin size={16} color="#8E8E93" />
                <Text style={styles.infoText}>{gymDetails.gym.address || 'No address provided'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={16} color="#8E8E93" />
                <Text style={styles.infoText}>{gymDetails.gym.phone || 'No phone provided'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Clock size={16} color="#8E8E93" />
                <Text style={styles.infoText}>{gymDetails.gym.openingTime || '06:00'} - {gymDetails.gym.closingTime || '22:00'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Onboarded:</Text>
                <Text style={styles.infoText}>{new Date(gymDetails.gym.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Failed to load gym details.</Text>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === 'ios' ? 20 : insets.top + 20 }]}>
            <Text style={styles.modalTitle}>Edit Gym Details</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.closeBtn}>
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.modalScroll}>
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

            <Text style={styles.sectionLabel}>Operating Hours</Text>

            <View style={styles.timeRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>Opening Time</Text>
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setShowOpeningTimePicker(true)}
                >
                  <Clock size={18} color={nebulaGold.colors.gold.primary} />
                  <Text style={styles.timeInputText}>{openingTime}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>Closing Time</Text>
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setShowClosingTimePicker(true)}
                >
                  <Clock size={18} color={nebulaGold.colors.gold.primary} />
                  <Text style={styles.timeInputText}>{closingTime}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showOpeningTimePicker && (
              <DateTimePicker
                value={new Date(`2000-01-01T${openingTime}`)}
                mode="time"
                display="spinner"
                onChange={handleOpeningTimeChange}
              />
            )}

            {showClosingTimePicker && (
              <DateTimePicker
                value={new Date(`2000-01-01T${closingTime}`)}
                mode="time"
                display="spinner"
                onChange={handleClosingTimeChange}
              />
            )}

            <GoldButton
              title={isUpdating ? "Saving..." : "Save Changes"}
              onPress={handleUpdate}
              disabled={isUpdating}
              style={{ marginTop: 24, height: 56 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  headerBtn: {
    padding: 8,
  },
  content: {
    padding: 24,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bentoBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    ...nebulaGold.colors.shadow.light,
  },
  bentoLeft: {
    marginRight: '2%',
  },
  bentoRight: {
    marginLeft: '2%',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bentoValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  bentoLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    ...nebulaGold.colors.shadow.light,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    width: 80,
  },
  infoText: {
    fontSize: 15,
    color: '#3A3A3C',
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 40,
    fontWeight: '600',
  },
  
  // Modal Styles
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F2F2F7' 
  },
  closeBtn: { padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#000000' },
  modalScroll: { padding: 24 },
  
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#000000', height: '100%' },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeColumn: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
  },
  timeInputText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
});

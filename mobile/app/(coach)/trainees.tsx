import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import { Search, ChevronRight, User, CalendarPlus, X, Check } from 'lucide-react-native';
import { useCoachAuth } from '../../src/hooks/useCoachAuth';
import { coachService } from '../../src/services/coachService';
import { sessionService } from '../../src/services/sessionService';
import { Trainee } from '../../src/types/coach';
import { Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function CoachTrainees() {
  const { coachId } = useCoachAuth();
  const router = useRouter();
  const [trainees, setTrainees] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Modal State
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState(new Date());
  const [bookingTime, setBookingTime] = useState(new Date());
  const [sessionType, setSessionType] = useState('PERSONAL_TRAINING');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  useEffect(() => {
    if (!coachId) return;
    coachService.getAssignedTrainees(coachId)
      .then((data: any) => {
        // Backend returns array of {id, name, email, fitnessGoal, ...}
        setTrainees(Array.isArray(data) ? data : []);
        setFiltered(Array.isArray(data) ? data : []);
      })
      .catch((e: any) => setError(e?.message || 'Failed to load trainees'))
      .finally(() => setLoading(false));
  }, [coachId]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(trainees);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      trainees.filter((t: any) =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.firstName || '').toLowerCase().includes(q) ||
        (t.lastName || '').toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q)
      )
    );
  }, [search, trainees]);

  const getDisplayName = (t: any) => {
    if (t.firstName || t.lastName) return `${t.firstName || ''} ${t.lastName || ''}`.trim();
    return t.name || 'Unknown';
  };

  const getMembershipStatus = (t: any): string => t.membershipStatus || 'UNKNOWN';

  const getMembershipColor = (status: string) => {
    if (status === 'ACTIVE') return nebulaGold.colors.status.active;
    if (status === 'EXPIRED') return nebulaGold.colors.status.danger;
    return nebulaGold.colors.status.warning;
  };

  const handleBookSession = (trainee: any) => {
    setSelectedTrainee(trainee);
    setBookingDate(new Date());
    setBookingTime(new Date());
    setSessionType('PERSONAL_TRAINING');
    setBookingModalVisible(true);
  };

  const confirmBooking = async () => {
    if (!selectedTrainee) return;
    setIsBookingLoading(true);
    
    // Format date as YYYY-MM-DD
    const dateStr = bookingDate.toISOString().split('T')[0];
    
    // Format time as HH:MM
    const hours = bookingTime.getHours().toString().padStart(2, '0');
    const minutes = bookingTime.getMinutes().toString().padStart(2, '0');
    const startTimeStr = `${hours}:${minutes}`;
    
    // Calculate end time (assume 1 hour)
    const endHour = (bookingTime.getHours() + 1) % 24;
    const endTimeStr = `${endHour.toString().padStart(2, '0')}:${minutes}`;
    
    try {
      await sessionService.create({
        coachId: coachId,
        traineeId: selectedTrainee.id,
        sessionDate: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        sessionType: sessionType,
        sessionNotes: "Coach initiated booking"
      });
      alert('Session booked successfully!');
      setBookingModalVisible(false);
      setSelectedTrainee(null);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to book session');
    } finally {
      setIsBookingLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Trainees" />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color={nebulaGold.colors.text.secondary} size={20} />
          <TextInput
            placeholder="Search trainees..."
            placeholderTextColor={nebulaGold.colors.text.secondary}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={nebulaGold.colors.gold.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <User size={48} color={nebulaGold.colors.background.tertiary} />
          <Text style={styles.emptyText}>
            {search ? 'No trainees found for that search.' : 'No trainees assigned yet.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const status = getMembershipStatus(item);
            const statusColor = getMembershipColor(status);
            return (
              <GlassCard
                style={styles.traineeCard}
                onPress={() => router.push(`/(coach)/trainee/${item.id}` as any)}
              >
                <View style={styles.traineeInfo}>
                  <AvatarRing
                    size="md"
                    name={getDisplayName(item)}
                    imageUri={item.profilePhotoUrl}
                  />
                  <View style={styles.details}>
                    <Text style={styles.name}>{getDisplayName(item)}</Text>
                    <View style={styles.subInfo}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
                      {item.fitnessGoal ? (
                        <>
                          <Text style={styles.dot}> • </Text>
                          <Text style={styles.goalText} numberOfLines={1}>{item.fitnessGoal}</Text>
                        </>
                      ) : null}
                    </View>
                    {item.lastAttendanceDate ? (
                      <Text style={styles.visitText}>Last visit: {item.lastAttendanceDate}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity 
                    style={styles.bookBtn} 
                    onPress={() => handleBookSession(item)}
                  >
                    <CalendarPlus color="#000" size={18} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            );
          }}
        />
      )}

      {/* Booking Modal */}
      <Modal visible={bookingModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book Session</Text>
            <Text style={styles.modalSubtitle}>For {selectedTrainee ? getDisplayName(selectedTrainee) : ''}</Text>
            
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Date</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker value={bookingDate} mode="date" onChange={(e, d) => d && setBookingDate(d)} />
              ) : (
                <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
                  <Text>{bookingDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}
              {showDatePicker && Platform.OS !== 'ios' && (
                <DateTimePicker 
                  value={bookingDate} 
                  mode="date" 
                  onChange={(e, d) => { setShowDatePicker(false); d && setBookingDate(d); }} 
                />
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Time</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker value={bookingTime} mode="time" onChange={(e, t) => t && setBookingTime(t)} />
              ) : (
                <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowTimePicker(true)}>
                  <Text>{bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>
              )}
              {showTimePicker && Platform.OS !== 'ios' && (
                <DateTimePicker 
                  value={bookingTime} 
                  mode="time" 
                  onChange={(e, t) => { setShowTimePicker(false); t && setBookingTime(t); }} 
                />
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Session Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity 
                  style={[styles.typeBtn, sessionType === 'PERSONAL_TRAINING' && styles.typeBtnActive]}
                  onPress={() => setSessionType('PERSONAL_TRAINING')}
                >
                  <Text style={[styles.typeBtnText, sessionType === 'PERSONAL_TRAINING' && styles.typeBtnTextActive]}>1-on-1</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, sessionType === 'GROUP_CLASS' && styles.typeBtnActive]}
                  onPress={() => setSessionType('GROUP_CLASS')}
                >
                  <Text style={[styles.typeBtnText, sessionType === 'GROUP_CLASS' && styles.typeBtnTextActive]}>Group</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setBookingModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmBooking} disabled={isBookingLoading}>
                {isBookingLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>Confirm</Text>}
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
  searchContainer: { padding: nebulaGold.spacing.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: nebulaGold.borderRadius.md,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: nebulaGold.colors.text.primary,
    ...nebulaGold.typography.body,
  },
  listContent: {
    paddingHorizontal: nebulaGold.spacing.lg,
    paddingBottom: 20,
  },
  traineeCard: { marginBottom: nebulaGold.spacing.sm },
  traineeInfo: { flexDirection: 'row', alignItems: 'center' },
  details: { flex: 1, marginLeft: 16 },
  name: { ...nebulaGold.typography.heading3, color: nebulaGold.colors.text.primary },
  subInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { ...nebulaGold.typography.caption, fontWeight: '700' },
  dot: { color: nebulaGold.colors.text.secondary },
  goalText: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    flex: 1,
  },
  visitText: { ...nebulaGold.typography.caption, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  errorText: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.status.danger,
    textAlign: 'center',
  },
  emptyText: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.text.secondary,
    textAlign: 'center',
  },
  bookBtn: {
    backgroundColor: '#F2F2F7',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: { ...nebulaGold.typography.heading2, color: '#000', textAlign: 'center' },
  modalSubtitle: { ...nebulaGold.typography.body, color: '#8E8E93', textAlign: 'center', marginBottom: 20, marginTop: 4 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { ...nebulaGold.typography.label, color: '#000', marginBottom: 8 },
  datePickerBtn: { padding: 12, borderWidth: 1, borderColor: '#EBEBF0', borderRadius: 12 },
  typeSelector: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EBEBF0', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#000', borderColor: '#000' },
  typeBtnText: { ...nebulaGold.typography.caption, fontWeight: '700', color: '#8E8E93' },
  typeBtnTextActive: { color: '#FFF' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#EBEBF0', alignItems: 'center' },
  cancelBtnText: { ...nebulaGold.typography.label, color: '#8E8E93' },
  confirmBtn: { flex: 2, padding: 14, borderRadius: 14, backgroundColor: '#000', alignItems: 'center' },
  confirmBtnText: { ...nebulaGold.typography.label, color: '#FFF', fontWeight: '800' }
});

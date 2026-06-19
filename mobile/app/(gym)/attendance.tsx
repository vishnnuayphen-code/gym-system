import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Image, Alert } from 'react-native';
import { format, parseISO, subDays } from 'date-fns';
import { UserCheck, ClipboardList, Calendar, Search, CheckCircle, AlertCircle, Pencil, Trash2, Info, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { SectionLabel } from '../../src/components/nebula/SectionLabel';
import { FormField } from '../../src/components/nebula/FormField';
import { useApiCall } from '../../src/hooks/useApiCall';
import { useAuthStore } from '../../store/authStore';
import { attendanceService } from '../../src/services/attendanceService';
import { coachAttendanceService } from '../../src/services/coachAttendanceService';
import { traineeService } from '../../src/services/traineeService';
import { coachService } from '../../src/services/coachService';
import { showToast } from '../../src/utils/toast';
import { AttendanceRow, AttendanceRecord } from '../../src/components/attendance/AttendanceRow';
import { AttendanceRowSkeleton } from '../../src/components/attendance/AttendanceRowSkeleton';
import { SwipeableAttendanceRow } from '../../src/components/attendance/SwipeableAttendanceRow';
import { GlassCard } from '../../src/components/nebula/GlassCard';

/**
 * TripGlide Attendance Screen - Fully refactored to Peak White theme.
 */
export default function AdminAttendanceScreen() {
  const { user: currentUser } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'HALF_DAY'>('ALL');
  const [activeTab, setActiveTab] = useState<'TRAINEES' | 'COACHES'>('TRAINEES');
  const [markModalVisible, setMarkModalVisible] = useState(false);
  const [markCoachModalVisible, setMarkCoachModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const { data: traineeRecords, loading: traineeLoading, error: traineeError, refreshing: traineeRefreshing, refetch: refetchTrainees } = useApiCall(
    () => attendanceService.getByDate(selectedDate),
    [selectedDate]
  );

  const { data: coachRecords, loading: coachLoading, error: coachError, refreshing: coachRefreshing, refetch: refetchCoaches } = useApiCall(
    () => coachAttendanceService.getByDate(selectedDate),
    [selectedDate]
  );

  const { data: allTrainees } = useApiCall(() => traineeService.getAll(), []);
  const { data: allCoaches } = useApiCall(() => coachService.getAll(), []);

  const records = activeTab === 'TRAINEES' ? traineeRecords : coachRecords;
  const loading = activeTab === 'TRAINEES' ? traineeLoading : coachLoading;
  const error = activeTab === 'TRAINEES' ? traineeError : coachError;
  const refreshing = activeTab === 'TRAINEES' ? traineeRefreshing : coachRefreshing;
  const refetch = activeTab === 'TRAINEES' ? refetchTrainees : refetchCoaches;

  const filtered = useMemo(() => {
    if (!records || !Array.isArray(records)) return [];
    
    const normalized = (records as any[]).map(r => ({
      ...r,
      traineeId: r.traineeId || r.coachId,
      traineeName: r.traineeName || r.coachName,
      traineePhoto: r.traineePhoto || r.coachPhoto,
      checkInMethod: r.checkInMethod || 'MANUAL'
    }));

    if (statusFilter === 'ALL') return normalized;
    return normalized.filter(r => r.status === statusFilter);
  }, [records, statusFilter, activeTab]);

  const stats = useMemo(() => {
    const r = (filtered as any[]) || [];
    return {
      total: r.length,
      present: r.filter(record => record.status === 'PRESENT').length,
      absent: r.filter(record => record.status === 'ABSENT').length,
      excused: r.filter(record => record.status === 'EXCUSED' || record.status === 'HALF_DAY').length,
    };
  }, [filtered]);

  const handleDeleteTrainee = (record: any) => {
    Alert.alert('Delete Record', `Remove attendance for ${record.traineeName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await attendanceService.delete(record.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showToast('Record deleted', 'info');
          refetchTrainees();
        } catch (e: any) {
          showToast(e.message ?? 'Failed to delete', 'error');
        }
      }}
    ]);
  };

  const handleDeleteCoach = (record: any) => {
    Alert.alert('Delete Record', `Remove attendance for ${record.coachName || record.traineeName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await coachAttendanceService.delete(record.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showToast('Record deleted', 'info');
          refetchCoaches();
        } catch (e: any) {
          showToast(e.message ?? 'Failed to delete', 'error');
        }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Attendance"
        subtitle={format(parseISO(selectedDate), 'EEEE, dd MMM yyyy')}
        rightSlot={
          <TouchableOpacity
            onPress={() => activeTab === 'TRAINEES' ? setMarkModalVisible(true) : setMarkCoachModalVisible(true)}
            style={styles.addCircle}
          >
            <UserCheck size={22} color="#ffffff" />
          </TouchableOpacity>
        }
      />

      {/* Tab Switcher - Peak White Style */}
      <View style={styles.tabContainer}>
        {['TRAINEES', 'COACHES'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              setActiveTab(tab as any);
              setStatusFilter('ALL');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.tabButton, activeTab === tab && { backgroundColor: '#000', borderColor: '#000' }]}
          >
            <Text style={[styles.tabText, activeTab === tab && { color: '#FFF' }]}>
              {tab === 'TRAINEES' ? 'Members' : 'Coaches'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor="#000000" />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Date Selector Strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateSelectorContent}>
          {Array.from({ length: 7 }, (_, i) => {
            const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
            const isSelected = date === selectedDate;
            const isToday = date === format(new Date(), 'yyyy-MM-dd');
            return (
              <TouchableOpacity
                key={date}
                onPress={() => {
                  setSelectedDate(date);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.datePill, isSelected && { backgroundColor: '#000', borderColor: '#000' }, isToday && !isSelected && { borderColor: '#000' }]}
              >
                <Text style={[styles.dateDayText, isSelected && { color: 'rgba(255,255,255,0.7)' }]}>
                  {format(parseISO(date), 'EEE')}
                </Text>
                <Text style={[styles.dateNumText, isSelected && { color: '#FFF' }]}>
                  {format(parseISO(date), 'd')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Stats Row - Redesigned with GlassCard */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total, color: '#000000' },
            { label: 'Present', value: stats.present, color: '#34C759' },
            { label: 'Absent', value: stats.absent, color: '#FF3B30' },
            { label: 'Excused', value: stats.excused, color: '#FF9500' },
          ].map(stat => (
            <GlassCard key={stat.label} style={styles.statBox} containerStyle={styles.statBoxInner}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Status Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {(activeTab === 'TRAINEES' ? ['ALL', 'PRESENT', 'ABSENT', 'EXCUSED'] : ['ALL', 'PRESENT', 'HALF_DAY', 'ABSENT']).map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => {
                setStatusFilter(s as any);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.filterPill, statusFilter === s && { backgroundColor: '#000' }]}
            >
              <Text style={[styles.filterText, statusFilter === s && { color: '#FFF' }]}>
                {s === 'ALL' ? 'All' : s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Attendance List */}
        <SectionLabel label="CHECK-IN LOG" style={{ marginTop: 8 }} />

        {loading && !refreshing && Array.from({ length: 5 }).map((_, i) => <AttendanceRowSkeleton key={i} />)}

        {!loading && !error && filtered.length === 0 && (
          <View style={styles.emptyState}>
            <ClipboardList size={32} color="#8E8E93" />
            <Text style={styles.emptyText}>No records for this day</Text>
          </View>
        )}

        {filtered.map((record: AttendanceRecord) => (
          <SwipeableAttendanceRow
            key={record.id}
            onEdit={() => {
              setEditingRecord({ ...record, type: activeTab === 'TRAINEES' ? 'TRAINEE' : 'COACH' });
              setEditModalVisible(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onDelete={() => activeTab === 'TRAINEES' ? handleDeleteTrainee(record) : handleDeleteCoach(record)}
          >
            <AttendanceRow record={record} />
          </SwipeableAttendanceRow>
        ))}
        
        {/* Bottom space for Tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals Refactored to Light Theme */}
      <MarkAttendanceModal
        visible={markModalVisible}
        onClose={() => setMarkModalVisible(false)}
        onSuccess={() => { setMarkModalVisible(false); refetch(); }}
        trainees={allTrainees}
      />

      <MarkCoachAttendanceModal
        visible={markCoachModalVisible}
        onClose={() => setMarkCoachModalVisible(false)}
        onSuccess={() => { setMarkCoachModalVisible(false); refetch(); }}
        coaches={allCoaches}
      />

      <EditAttendanceModal
        visible={editModalVisible}
        record={editingRecord}
        onClose={() => { setEditModalVisible(false); setEditingRecord(null); }}
        onSuccess={() => { setEditModalVisible(false); setEditingRecord(null); refetch(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  addCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#000000',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 12,
  },
  tabButton: {
    flex: 1, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tabButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  tabText: {
    fontSize: 14, fontWeight: '600', color: '#8E8E93',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dateSelectorContent: {
    gap: 10,
    paddingBottom: 12,
  },
  datePill: {
    width: 58, height: 72, borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  datePillSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  datePillToday: {
    borderColor: '#007AFF',
  },
  dateDayText: {
    fontSize: 11, fontWeight: '600', color: '#8E8E93',
  },
  dateDayTextSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  dateNumText: {
    fontSize: 18, fontWeight: '800', color: '#000000', marginTop: 2,
  },
  dateNumTextSelected: {
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row', gap: 10, marginBottom: 12,
  },
  statBox: {
    flex: 1,
  },
  statBoxInner: {
    padding: 10, alignItems: 'center',
  },
  statValue: {
    fontSize: 18, fontWeight: '800',
  },
  statLabel: {
    fontSize: 10, color: '#8E8E93', fontWeight: '500', marginTop: 1,
  },
  filterContent: {
    gap: 8, marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  filterPillActive: {
    backgroundColor: '#000000',
  },
  filterText: {
    fontSize: 12, fontWeight: '600', color: '#8E8E93',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    backgroundColor: '#FFFFFF', borderRadius: 24,
    padding: 30, alignItems: 'center', gap: 10,
    marginTop: 6,
    borderWidth: 1, borderColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyText: {
    fontSize: 13, color: '#8E8E93', fontWeight: '500',
  },
});

/** Modal Components Refactored to Light Theme **/

function MarkAttendanceModal({ visible, onClose, onSuccess, trainees }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('PRESENT');
  const [search, setSearch] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<any>(null);
  
  // New API fields
  const [notes, setNotes] = useState('');
  const [temperature, setTemperature] = useState('');
  const [isMaskWorn, setIsMaskWorn] = useState(true);
  const [checkInTime, setCheckInTime] = useState(format(new Date(), 'HH:mm'));
  const [checkOutTime, setCheckOutTime] = useState('');

  const filteredTrainees = (trainees || []).filter((t: any) => 
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!selectedTrainee) return;
    setSubmitting(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      await attendanceService.checkIn({
        traineeId: selectedTrainee.id,
        status: status,
        attendanceDate: today,
        notes: notes,
        temperatureReading: temperature ? parseFloat(temperature) : null,
        isMaskWorn: isMaskWorn,
        checkInTime: `${today}T${checkInTime}:00`,
        checkOutTime: checkOutTime ? `${today}T${checkOutTime}:00` : null
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Attendance recorded', 'success');
      
      // Reset defaults
      setNotes('');
      setTemperature('');
      setIsMaskWorn(true);
      setSelectedTrainee(null);
      setSearch('');

      onSuccess();
    } catch (e: any) {
      showToast(e.message ?? 'Failed to record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose}><Text style={modalStyles.headerBtn}>Cancel</Text></TouchableOpacity>
          <Text style={modalStyles.headerTitle}>Mark Attendance</Text>
          <TouchableOpacity onPress={handleCreate} disabled={!selectedTrainee || submitting}>
            {submitting ? <ActivityIndicator size="small" color="#000" /> : <Text style={[modalStyles.headerBtn, { color: selectedTrainee ? '#000000' : '#C7C7CC', fontWeight: '800' }]}>Record</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <SectionLabel label="SELECT MEMBER" />
          <View style={modalStyles.searchContainer}>
            <Search size={18} color="#8E8E93" />
            <TextInput 
              placeholder="Search members..." 
              style={modalStyles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#999"
            />
          </View>

          <View style={{ maxHeight: 200, marginBottom: 24 }}>
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {filteredTrainees.map((t: any) => (
                <TouchableOpacity 
                  key={t.id} 
                  onPress={() => {
                    setSelectedTrainee(t);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                   style={[modalStyles.selectionRow, selectedTrainee?.id === t.id && { backgroundColor: '#000000' }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[modalStyles.selectionName, selectedTrainee?.id === t.id && { color: '#FFF' }]}>{t.name}</Text>
                    <Text style={[modalStyles.selectionSub, selectedTrainee?.id === t.id && { color: 'rgba(255,255,255,0.6)' }]}>{t.email || 'No email'}</Text>
                  </View>
                  {selectedTrainee?.id === t.id && <CheckCircle size={18} color="#FFF" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <SectionLabel label="STATUS" />
          <View style={modalStyles.actionGrid}>
             {['PRESENT', 'ABSENT', 'EXCUSED'].map(s => (
               <TouchableOpacity 
                 key={s} 
                 onPress={() => {
                   setStatus(s);
                   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                 }}
                 style={[modalStyles.actionBtn, status === s && modalStyles.actionBtnActive]}
               >
                 <Text style={[modalStyles.actionBtnText, status === s && modalStyles.actionBtnTextActive]}>
                   {s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
                 </Text>
               </TouchableOpacity>
             ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <View style={{ flex: 1 }}>
              <SectionLabel label="CLOCK IN" />
              <FormField
                label="Time"
                value={checkInTime}
                onChangeText={setCheckInTime}
                placeholder="HH:mm"
                light={true}
              />
            </View>
            <View style={{ flex: 1 }}>
              <SectionLabel label="CLOCK OUT" />
              <FormField
                label="Time"
                value={checkOutTime}
                onChangeText={setCheckOutTime}
                placeholder="HH:mm"
                light={true}
              />
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <SectionLabel label="TEMPERATURE" />
            <FormField
              label="Reading (°C)"
              value={temperature}
              onChangeText={setTemperature}
              placeholder="36.5"
              keyboardType="numeric"
              light={true}
            />
          </View>

          <SectionLabel label="SAFETY" style={{ marginTop: 12 }} />
          <TouchableOpacity 
            onPress={() => {
              setIsMaskWorn(!isMaskWorn);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[modalStyles.toggleBtn, isMaskWorn && modalStyles.toggleBtnActive]}
          >
            <Text style={[modalStyles.toggleText, isMaskWorn && modalStyles.toggleTextActive]}>
              {isMaskWorn ? 'Mask On ✓' : 'No Mask'}
            </Text>
          </TouchableOpacity>

          <SectionLabel label="NOTES" style={{ marginTop: 12 }} />
          <FormField
            label="Comments"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add health or training notes..."
            multiline
            numberOfLines={4}
            light={true}
          />
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function MarkCoachAttendanceModal({ visible, onClose, onSuccess, coaches }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('PRESENT');
  const [search, setSearch] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  
  // New API fields for Coach
  const [notes, setNotes] = useState('');
  const [sessionAttended, setSessionAttended] = useState('MORNING');
  const [checkInTime, setCheckInTime] = useState(format(new Date(), 'HH:mm'));
  const [checkOutTime, setCheckOutTime] = useState('');

  const filteredCoaches = (coaches || []).filter((c: any) => 
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!selectedCoach) return;
    setSubmitting(true);
    try {
      await coachAttendanceService.markAttendance({
        coachId: selectedCoach.id,
        status: status,
        attendanceDate: format(new Date(), 'yyyy-MM-dd'),
        notes: notes,
        sessionAttended: sessionAttended,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Attendance recorded', 'success');
      
      // Reset
      setNotes('');
      setSessionAttended('MORNING');
      setCheckInTime(format(new Date(), 'HH:mm'));
      setSelectedCoach(null);

      onSuccess();
    } catch (e: any) {
      showToast(e.message ?? 'Failed to record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose}><Text style={modalStyles.headerBtn}>Cancel</Text></TouchableOpacity>
          <Text style={modalStyles.headerTitle}>Coach Attendance</Text>
          <TouchableOpacity onPress={handleCreate} disabled={!selectedCoach || submitting}>
            {submitting ? <ActivityIndicator size="small" color="#000" /> : <Text style={[modalStyles.headerBtn, { color: selectedCoach ? '#007AFF' : '#C7C7CC' }]}>Record</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <SectionLabel label="SELECT COACH" />
          <View style={modalStyles.searchContainer}>
            <Search size={18} color="#8E8E93" />
            <TextInput 
              placeholder="Search coaches..." 
              style={modalStyles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#999"
            />
          </View>

          <View style={{ maxHeight: 200, marginBottom: 24 }}>
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {filteredCoaches.map((c: any) => (
                <TouchableOpacity 
                  key={c.id} 
                  onPress={() => {
                    setSelectedCoach(c);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[modalStyles.selectionRow, selectedCoach?.id === c.id && modalStyles.selectionRowActive]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[modalStyles.selectionName, selectedCoach?.id === c.id && { color: '#FFF' }]}>{c.name}</Text>
                    <Text style={[modalStyles.selectionSub, selectedCoach?.id === c.id && { color: '#FFFFFF70' }]}>{c.specialization || 'Coach'}</Text>
                  </View>
                  {selectedCoach?.id === c.id && <CheckCircle size={18} color="#FFF" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <SectionLabel label="SESSION" />
              <View style={modalStyles.actionGrid}>
                {['MORNING', 'EVENING'].map(s => (
                  <TouchableOpacity 
                    key={s} 
                    onPress={() => {
                      setSessionAttended(s);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[modalStyles.actionBtn, sessionAttended === s && modalStyles.actionBtnActive]}
                  >
                    <Text style={[modalStyles.actionBtnText, sessionAttended === s && modalStyles.actionBtnTextActive]}>
                      {s === 'MORNING' ? 'AM' : 'PM'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <SectionLabel label="STATUS" />
              <View style={modalStyles.actionGrid}>
                {['PRESENT', 'ABSENT', 'HALF_DAY'].map(s => (
                  <TouchableOpacity 
                    key={s} 
                    onPress={() => {
                      setStatus(s);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[modalStyles.actionBtn, status === s && modalStyles.actionBtnActive]}
                  >
                    <Text style={[modalStyles.actionBtnText, status === s && modalStyles.actionBtnTextActive]}>
                      {s === 'HALF_DAY' ? '1/2' : s.charAt(0)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <View style={{ flex: 1 }}>
              <SectionLabel label="CLOCK IN" />
              <FormField
                label="Time"
                value={checkInTime}
                onChangeText={setCheckInTime}
                placeholder="09:00"
                light={true}
              />
            </View>
            <View style={{ flex: 1 }}>
              <SectionLabel label="CLOCK OUT" />
              <FormField
                label="Time"
                value={checkOutTime}
                onChangeText={setCheckOutTime}
                placeholder="17:00"
                light={true}
              />
            </View>
          </View>

          <SectionLabel label="NOTES" style={{ marginTop: 12 }} />
          <FormField
            label="Comments"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add log notes..."
            multiline
            numberOfLines={4}
            light={true}
          />
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function EditAttendanceModal({ visible, record, onClose, onSuccess }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(record?.status || 'PRESENT');
  
  // New API fields for Edit
  const [notes, setNotes] = useState(record?.notes || '');
  const [temperature, setTemperature] = useState(record?.temperatureReading?.toString() || '');
  const [isMaskWorn, setIsMaskWorn] = useState(record?.isMaskWorn ?? true);
  const [sessionAttended, setSessionAttended] = useState(record?.sessionAttended || 'MORNING');
  const [checkInTime, setCheckInTime] = useState(record?.checkInTime || '');
  const [checkOutTime, setCheckOutTime] = useState(record?.checkOutTime || '');

  useEffect(() => { 
    if (record) {
      setStatus(record.status);
      setNotes(record.notes || '');
      setTemperature(record.temperatureReading?.toString() || '');
      setIsMaskWorn(record.isMaskWorn ?? true);
      setSessionAttended(record.sessionAttended || 'MORNING');
      setCheckInTime(record.checkInTime || '');
      setCheckOutTime(record.checkOutTime || '');
    }
  }, [record]);

  if (!record) return null;

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      if (record.type === 'TRAINEE') {
        const dateStr = record.attendanceDate;
        await attendanceService.update(record.id, { 
          status, 
          notes, 
          temperatureReading: temperature ? parseFloat(temperature) : null,
          isMaskWorn,
          checkOutTime: checkOutTime ? `${dateStr}T${checkOutTime}:00` : undefined
        } as any);
      } else {
        await coachAttendanceService.update(record.id, { 
          status, 
          notes,
          sessionAttended,
          checkInTime,
          checkOutTime 
        } as any);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Record updated', 'success');
      onSuccess();
    } catch (e: any) {
      showToast(e.message ?? 'Update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose}><Text style={modalStyles.headerBtn}>Cancel</Text></TouchableOpacity>
          <Text style={modalStyles.headerTitle}>Edit Record</Text>
          <TouchableOpacity onPress={handleUpdate} disabled={submitting}>
            {submitting ? <ActivityIndicator size="small" color="#000" /> : <Text style={[modalStyles.headerBtn, { color: '#007AFF' }]}>Save</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <View style={modalStyles.profileCard}>
            <View style={modalStyles.avatarCircle}>
              <Text style={modalStyles.avatarText}>
                {(record.traineeName || record.coachName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={modalStyles.profileName}>
                {record.traineeName || record.coachName}
              </Text>
              <Text style={modalStyles.profileSub}>
                {format(parseISO(record.attendanceDate), 'EEEE, dd MMM yyyy')}
              </Text>
            </View>
          </View>
          
          <SectionLabel label="STATUS" />
          <View style={modalStyles.actionGrid}>
             {(record.type === 'TRAINEE' ? ['PRESENT', 'ABSENT', 'EXCUSED'] : ['PRESENT', 'ABSENT', 'HALF_DAY']).map(s => (
               <TouchableOpacity 
                 key={s} 
                 onPress={() => {
                   setStatus(s);
                   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                 }}
                 style={[modalStyles.actionBtn, status === s && modalStyles.actionBtnActive]}
               >
                 <Text style={[modalStyles.actionBtnText, status === s && modalStyles.actionBtnTextActive]}>
                   {s === 'HALF_DAY' ? 'Half Day' : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
                 </Text>
               </TouchableOpacity>
             ))}
          </View>

          {record.type === 'TRAINEE' ? (
            <>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <View style={{ flex: 1 }}>
                  <SectionLabel label="TIME IN" />
                  <FormField
                    label="Clock In"
                    value={checkInTime}
                    onChangeText={setCheckInTime}
                    placeholder="HH:mm"
                    light={true}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <SectionLabel label="TIME OUT" />
                  <FormField
                    label="Clock Out"
                    value={checkOutTime}
                    onChangeText={setCheckOutTime}
                    placeholder="HH:mm"
                    light={true}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <SectionLabel label="TEMPERATURE" />
                  <FormField
                    label="Reading (°C)"
                    value={temperature}
                    onChangeText={setTemperature}
                    placeholder="36.5"
                    keyboardType="numeric"
                    light={true}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <SectionLabel label="SAFETY" />
                  <TouchableOpacity 
                    onPress={() => {
                      setIsMaskWorn(!isMaskWorn);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[modalStyles.toggleBtn, isMaskWorn && modalStyles.toggleBtnActive]}
                  >
                    <Text style={[modalStyles.toggleText, isMaskWorn && modalStyles.toggleTextActive]}>
                      {isMaskWorn ? 'Mask On ✓' : 'No Mask'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <View style={{ flex: 1 }}>
                  <SectionLabel label="SESSION" />
                  <View style={modalStyles.actionGrid}>
                    {['MORNING', 'EVENING'].map(s => (
                      <TouchableOpacity 
                        key={s} 
                        onPress={() => {
                          setSessionAttended(s);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[modalStyles.actionBtn, sessionAttended === s && modalStyles.actionBtnActive]}
                      >
                        <Text style={[modalStyles.actionBtnText, sessionAttended === s && modalStyles.actionBtnTextActive]}>
                          {s === 'MORNING' ? 'AM' : 'PM'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <SectionLabel label="ATTENDANCE TIME" />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <FormField
                        label="In"
                        value={checkInTime}
                        onChangeText={setCheckInTime}
                        placeholder="In"
                        light={true}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <FormField
                        label="Out"
                        value={checkOutTime}
                        onChangeText={setCheckOutTime}
                        placeholder="Out"
                        light={true}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}

          <SectionLabel label="RECORD NOTES" style={{ marginTop: 12 }} />
          <FormField
            label="Comments"
            value={notes}
            onChangeText={setNotes}
            placeholder="Edit record notes..."
            multiline
            numberOfLines={4}
            light={true}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
  },
  headerBtn: { fontSize: 16, color: '#FF3B30', fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#000' },
  profileCard: { 
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, marginBottom: 24,
    borderWidth: 1, borderColor: '#F2F2F7',
    ...nebulaGold.colors.shadow.light,
  },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#000' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#000', letterSpacing: -0.5 },
  profileSub: { fontSize: 13, color: '#8E8E93', marginTop: 2, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F2F2F7', paddingHorizontal: 16, height: 54, borderRadius: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#EBEBF0',
  },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '600', color: '#000' },
  selectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F2F2F7',
  },
  selectionRowActive: { backgroundColor: '#000', borderRadius: 16, borderBottomWidth: 0 },
  selectionName: { fontSize: 16, fontWeight: '700', color: '#000' },
  selectionSub: { fontSize: 12, color: '#8E8E93', marginTop: 2, fontWeight: '600' },
  actionGrid: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 4 },
  actionBtn: { 
    flex: 1, height: 48, borderRadius: 14, backgroundColor: '#F2F2F7', 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#EBEBF0',
  },
  actionBtnActive: {
    backgroundColor: '#000000', borderColor: '#000000',
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
  actionBtnTextActive: { color: '#FFFFFF' },
  toggleBtn: {
    height: 48, borderRadius: 12, backgroundColor: '#F2F2F7',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#EBEBF0',
  },
  toggleBtnActive: {
    backgroundColor: '#34C75920', borderColor: '#34C759',
  },
  toggleText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
  toggleTextActive: { color: '#34C759' },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { GoldButton } from '../../src/components/nebula/GoldButton';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import { Calendar } from 'lucide-react-native';
import { useCoachAuth } from '../../src/hooks/useCoachAuth';
import { coachService } from '../../src/services/coachService';
import { sessionService } from '../../src/services/sessionService';
import { machineService } from '../../src/services/machineService';
import { workoutService } from '../../src/services/workoutService';
import { format, addDays, startOfWeek } from 'date-fns';
import { CheckCircle, Dumbbell, Plus, Check, X } from 'lucide-react-native';

const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: nebulaGold.colors.accent.blue,
  IN_PROGRESS: nebulaGold.colors.gold.primary,
  COMPLETED: nebulaGold.colors.status.active,
  CANCELLED: nebulaGold.colors.status.danger,
};

export default function CoachSchedule() {
  const { coachId } = useCoachAuth();
  const router = useRouter();

  // Selected day index (0=MON...6=SUN) within the current week
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(() => {
    const jsDay = new Date().getDay(); // 0=Sun
    const mapped = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon
    return mapped;
  });
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Acceptance Modal States
  const [acceptanceModalVisible, setAcceptanceModalVisible] = useState(false);
  const [machineModalVisible, setMachineModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedWorkoutPlanId, setSelectedWorkoutPlanId] = useState<number | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const [isQuickCreatingPlan, setIsQuickCreatingPlan] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [isCreatingPlanLoading, setIsCreatingPlanLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [rejectingSessionId, setRejectingSessionId] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);

  // Compute the date string for the selected day
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const selectedDate = addDays(weekStart, selectedDayIdx);
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const handleFetch = () => {
    if (!coachId) return;
    setLoading(true);
    setSessions([]);
    coachService.getCoachSessions(coachId, selectedDateStr)
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    handleFetch();
  }, [coachId, selectedDateStr]);

  const fetchWorkoutPlans = async (traineeId: string) => {
    try {
      const plans = await workoutService.getForTrainee(traineeId);
      setWorkoutPlans(plans);
    } catch (error) {
      console.error('Failed to fetch plans', error);
    }
  };

  const fetchMachines = async () => {
    try {
      const machinesList = await machineService.getAll();
      setMachines(machinesList.filter((m: any) => m.status === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to fetch machines', error);
    }
  };

  const handleAcceptPress = async (session: any) => {
    setSelectedSession(session);
    fetchWorkoutPlans(session.traineeId.toString());
    fetchMachines();
    setAcceptanceModalVisible(true);
    setIsQuickCreatingPlan(false);
    setNewPlanTitle('');
  };

  const handleAcceptConfirm = async () => {
    if (!selectedSession) return;
    
    let finalPlanId = selectedWorkoutPlanId;
    if (!finalPlanId && workoutPlans.length > 0) {
      finalPlanId = workoutPlans[0].id;
    }

    if (!finalPlanId) {
      Alert.alert("Action Required", "Please select or create a workout plan for this mission.");
      return;
    }

    setAccepting(true);
    try {
      await sessionService.accept(selectedSession.id, {
        workoutPlanId: finalPlanId,
        machineId: selectedMachineId || undefined
      });
      setAcceptanceModalVisible(false);
      setSelectedSession(null);
      setSelectedWorkoutPlanId(null);
      setSelectedMachineId(null);
      handleFetch();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to accept session';
      Alert.alert('Error', msg);
    } finally {
      setAccepting(false);
    }
  };

  const handleRejectPress = (session: any) => {
    Alert.alert(
      "Reject Session",
      `Are you sure you want to reject this session for ${session.traineeName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reject", 
          style: "destructive",
          onPress: async () => {
            setRejectingSessionId(session.id);
            try {
              await sessionService.reject(session.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Rejected", "Session has been rejected.");
              handleFetch();
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.message || "Failed to reject session.");
            } finally {
              setRejectingSessionId(null);
            }
          }
        }
      ]
    );
  };

  const handleQuickCreatePlan = async () => {
    if (!newPlanTitle.trim() || !selectedSession) return;
    
    setIsCreatingPlanLoading(true);
    try {
      const newPlan = await workoutService.create({
        title: newPlanTitle.trim(),
        traineeId: selectedSession.traineeId
      });
      
      const updatedPlans = await workoutService.getForTrainee(selectedSession.traineeId.toString());
      setWorkoutPlans(updatedPlans);
      setSelectedWorkoutPlanId(newPlan.id);
      
      setIsQuickCreatingPlan(false);
      setNewPlanTitle('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to initialize protocol.");
    } finally {
      setIsCreatingPlanLoading(false);
    }
  };

  const handleBookMachinePress = (session: any) => {
    setSelectedSession(session);
    fetchMachines();
    setMachineModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSession || !selectedMachineId) return;
    
    setBooking(true);
    try {
      await sessionService.bookMachine(selectedSession.id, selectedMachineId);
      Alert.alert('Success', 'Hardware asset locked for your session.');
      setMachineModalVisible(false);
      setSelectedSession(null);
      setSelectedMachineId(null);
      handleFetch();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to lock hardware');
    } finally {
      setBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="My Schedule" 
        subtitle={format(selectedDate, 'MMMM d, yyyy')} 
        transparent={false}
      />

      <View style={styles.weekContainer}>
        {WEEK_DAYS.map((day, idx) => {
          const dayDate = addDays(weekStart, idx);
          const isToday = format(dayDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDayIdx(idx)}
              style={[
                styles.dayColumn,
                selectedDayIdx === idx && styles.activeDayColumn,
              ]}
            >
              <Text style={[styles.dayText, selectedDayIdx === idx && styles.activeDayText]}>
                {day}
              </Text>
              <Text style={[styles.dayNum, selectedDayIdx === idx && styles.activeDayText]}>
                {dayDate.getDate()}
              </Text>
              {isToday && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={nebulaGold.colors.gold.primary} />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.center}>
          <Calendar size={40} color={nebulaGold.colors.background.tertiary} />
          <Text style={styles.emptyText}>No sessions on this day.</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const statusColor = STATUS_COLORS[item.status] || nebulaGold.colors.accent.blue;
            return (
              <GlassCard style={styles.sessionCard}>
                <View style={styles.sessionRow}>
                  <View style={styles.timeSlot}>
                    <Text style={styles.timeText}>{item.startTime}</Text>
                    <Text style={styles.timeEnd}>–{item.endTime}</Text>
                  </View>
                  <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
                  <View style={styles.details}>
                    <Text style={styles.traineeName}>{item.traineeName}</Text>
                    <View style={styles.badges}>
                      <View style={[styles.typeBadge]}>
                        <Text style={styles.typeBadgeText}>{item.type || 'ONE_ON_ONE'}</Text>
                      </View>
                      <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                        <Text style={[styles.statusBadgeText, { color: statusColor }]}>{item.status}</Text>
                      </View>
                    </View>
                  </View>
                  <AvatarRing size="sm" name={item.traineeName} imageUri={item.traineePhoto} />
                </View>

                <View style={styles.actionRow}>
                  {item.status === 'PENDING' && (
                    <>
                      <TouchableOpacity 
                        onPress={() => handleAcceptPress(item)}
                        style={[styles.actionBtn, { backgroundColor: nebulaGold.colors.status.active + '20' }]}
                      >
                        <CheckCircle size={14} color={nebulaGold.colors.status.active} />
                        <Text style={[styles.actionBtnText, { color: nebulaGold.colors.status.active }]}>Accept</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => handleRejectPress(item)}
                        disabled={rejectingSessionId === item.id}
                        style={[styles.actionBtn, { backgroundColor: nebulaGold.colors.status.danger + '20' }]}
                      >
                        {rejectingSessionId === item.id ? (
                          <ActivityIndicator size="small" color={nebulaGold.colors.status.danger} />
                        ) : (
                          <>
                            <X size={14} color={nebulaGold.colors.status.danger} />
                            <Text style={[styles.actionBtnText, { color: nebulaGold.colors.status.danger }]}>Reject</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                  {item.status === 'ACCEPTED' && !item.machineId && (
                    <TouchableOpacity 
                      onPress={() => handleBookMachinePress(item)}
                      style={[styles.actionBtn, { backgroundColor: nebulaGold.colors.gold.primary + '20' }]}
                    >
                      <Dumbbell size={14} color={nebulaGold.colors.gold.primary} />
                      <Text style={[styles.actionBtnText, { color: nebulaGold.colors.gold.primary }]}>Book Machine</Text>
                    </TouchableOpacity>
                  )}
                  {item.machineName && (
                    <View style={styles.machineInfo}>
                      <Dumbbell size={12} color={nebulaGold.colors.gold.primary} />
                      <Text style={styles.machineText}>{item.machineName}</Text>
                    </View>
                  )}
                </View>
              </GlassCard>
            );
          }}
        />
      )}


      <Modal
        visible={acceptanceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAcceptanceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Session Parameters</Text>
            <Text style={styles.modalSubtitle}>Finalize the plan and equipment for {selectedSession?.traineeName}</Text>
            
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Workout Plan</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.pillRow}
              >
                {isQuickCreatingPlan ? (
                  <View style={styles.quickCreateContainer}>
                    <TextInput
                      style={styles.quickInput}
                      placeholder="PROTOCOL TITLE..."
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      value={newPlanTitle}
                      onChangeText={setNewPlanTitle}
                      autoFocus
                    />
                    <TouchableOpacity 
                      onPress={handleQuickCreatePlan}
                      disabled={isCreatingPlanLoading}
                      style={styles.quickConfirmBtn}
                    >
                      {isCreatingPlanLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Check size={16} color="#FFF" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setIsQuickCreatingPlan(false)}
                      style={styles.quickCancelBtn}
                    >
                      <X size={16} color="#000" />
                    </TouchableOpacity>
                  </View>
                ) : workoutPlans.length === 0 ? (
                  <View style={styles.emptyPlansRow}>
                    <Text style={styles.emptyTextPill}>No plans found</Text>
                    <TouchableOpacity 
                      onPress={() => setIsQuickCreatingPlan(true)}
                      style={styles.inlineCreateBtn}
                    >
                      <Plus size={12} color={nebulaGold.colors.gold.primary} />
                      <Text style={styles.inlineCreateText}>Create Plan Now</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.plansListContainer}>
                    {workoutPlans.map(plan => (
                      <TouchableOpacity
                        key={plan.id}
                        onPress={() => setSelectedWorkoutPlanId(plan.id)}
                        style={[
                          styles.selectablePill,
                          selectedWorkoutPlanId === plan.id && styles.activePill
                        ]}
                      >
                        <Text style={[
                          styles.pillText,
                          selectedWorkoutPlanId === plan.id && styles.activePillText
                        ]}>
                          {plan.name || plan.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity 
                      onPress={() => setIsQuickCreatingPlan(true)}
                      style={styles.pillAddBtn}
                    >
                      <Plus size={14} color="#000" />
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Lock Machine (Optional)</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.pillRow}
              >
                {machines.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setSelectedMachineId(m.id)}
                    style={[
                      styles.selectablePill,
                      selectedMachineId === m.id && styles.activePill
                    ]}
                  >
                    <Text style={[
                      styles.pillText,
                      selectedMachineId === m.id && styles.activePillText
                    ]}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setAcceptanceModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleAcceptConfirm}
                disabled={accepting}
                style={[styles.confirmBtn, accepting && { opacity: 0.7 }]}
              >
                {accepting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirm Session</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={machineModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMachineModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Equipment Allocation</Text>
            <Text style={styles.modalSubtitle}>Allocate hardware for {selectedSession?.traineeName}</Text>
            
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Available Hardware List</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {machines.length === 0 ? (
                  <Text style={styles.emptyText}>No available hardware found.</Text>
                ) : (
                  <View style={styles.machineGrid}>
                    {machines.map(m => (
                      <TouchableOpacity
                        key={m.id}
                        onPress={() => setSelectedMachineId(m.id)}
                        style={[
                          styles.machinePill,
                          selectedMachineId === m.id && styles.activeMachinePill
                        ]}
                      >
                        <Dumbbell size={14} color={selectedMachineId === m.id ? '#FFF' : '#000'} />
                        <Text style={[
                          styles.machinePillText,
                          selectedMachineId === m.id && styles.activeMachinePillText
                        ]}>{m.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setMachineModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleConfirmBooking}
                disabled={booking || !selectedMachineId}
                style={[styles.confirmBtn, (booking || !selectedMachineId) && { opacity: 0.5 }]}
              >
                {booking ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Lock Machine</Text>
                )}
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
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: nebulaGold.spacing.lg,
    paddingVertical: nebulaGold.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 168, 76, 0.1)',
  },
  dayColumn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 20,
    minWidth: 38,
  },
  activeDayColumn: { backgroundColor: 'rgba(201, 168, 76, 0.15)' },
  dayText: { ...nebulaGold.typography.caption, fontWeight: '700', color: nebulaGold.colors.text.secondary },
  dayNum: { ...nebulaGold.typography.caption, fontWeight: '600', color: nebulaGold.colors.text.secondary, marginTop: 2 },
  activeDayText: { color: nebulaGold.colors.gold.primary },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: nebulaGold.colors.gold.primary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: nebulaGold.spacing.lg,
    paddingTop: nebulaGold.spacing.md,
    paddingBottom: 100,
  },
  sessionCard: { marginBottom: nebulaGold.spacing.sm },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeSlot: { width: 52, alignItems: 'flex-end' },
  timeText: { ...nebulaGold.typography.label, color: nebulaGold.colors.text.primary, fontWeight: '700' },
  timeEnd: { ...nebulaGold.typography.caption, color: nebulaGold.colors.text.secondary },
  statusBar: { width: 3, height: 40, borderRadius: 2 },
  details: { flex: 1 },
  traineeName: { ...nebulaGold.typography.heading3, fontSize: 15, color: nebulaGold.colors.text.primary },
  badges: { flexDirection: 'row', gap: 6, marginTop: 4 },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  typeBadgeText: { ...nebulaGold.typography.caption, color: nebulaGold.colors.text.secondary, fontSize: 10 },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: { ...nebulaGold.typography.caption, fontSize: 10, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { ...nebulaGold.typography.body, color: nebulaGold.colors.text.secondary },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: nebulaGold.spacing.lg,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 10,
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    ...nebulaGold.typography.caption,
    fontWeight: '700',
  },
  machineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  machineText: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.gold.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    ...nebulaGold.colors.shadow.light,
  },
  modalTitle: {
    ...nebulaGold.typography.heading2,
    color: '#000000',
    textAlign: 'center',
  },
  modalSubtitle: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    ...nebulaGold.typography.label,
    color: nebulaGold.colors.text.primary,
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: 'row',
  },
  selectablePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  activePill: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  pillText: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    fontWeight: '700',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  emptyTextPill: {
    color: nebulaGold.colors.text.muted,
    fontSize: 12,
  },
  emptyPlansRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inlineCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  inlineCreateText: {
    ...nebulaGold.typography.caption,
    color: '#000000',
    fontWeight: '700',
  },
  quickCreateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F2F2F7',
    padding: 4,
    borderRadius: 12,
    flex: 1,
    minWidth: 250,
  },
  quickInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  quickConfirmBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCancelBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plansListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  cancelBtnText: {
    ...nebulaGold.typography.label,
    color: nebulaGold.colors.text.secondary,
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#000000',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  confirmBtnText: {
    ...nebulaGold.typography.label,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  machineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  machinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    backgroundColor: '#FFFFFF',
    gap: 8,
    width: '48%',
    marginBottom: 8,
  },
  activeMachinePill: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  machinePillText: {
    ...nebulaGold.typography.caption,
    color: '#000000',
    fontWeight: '700',
  },
  activeMachinePillText: {
    color: '#FFFFFF',
  },
});

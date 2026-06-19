import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { nebulaGold } from '../../theme/nebulaGold';
import { ScreenHeader } from '../../components/nebula/ScreenHeader';
import { GlassCard } from '../../components/nebula/GlassCard';
import { GoldButton } from '../../components/nebula/GoldButton';
import { useAvailabilityStore, Day, TimeSlot } from '../../stores/availabilityStore';
import { useCoachAuth } from '../../hooks/useCoachAuth';
import { coachService } from '../../services/coachService';
import { showToast } from '../../utils/toast';
import { Clock, Calendar, Trash2 } from 'lucide-react-native';

const DAYS: Day[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS: Record<Day, string> = {
  MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday',
  FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday'
};

function buildFullList(apiSlots: TimeSlot[]): TimeSlot[] {
  const list: TimeSlot[] = [];
  for (const day of DAYS) {
    const existing = apiSlots.find((s) => s.day === day);
    list.push(
      existing ?? {
        id: `temp-${day}`,
        day,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: false,
        maxSessions: 3,
        bookedCount: 0,
      }
    );
  }
  return list;
}

export const AvailabilityScreen = () => {
  const { coachId } = useCoachAuth();
  const store = useAvailabilityStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [pickerState, setPickerState] = useState<{ day: Day | null, id: string | null, field: 'startTime' | 'endTime' | null }>({ day: null, id: null, field: null });
  const [showOverridePicker, setShowOverridePicker] = useState(false);

  useEffect(() => {
    const loadAvailability = async () => {
      const numericId = Number(coachId);
      if (!coachId || isNaN(numericId) || numericId <= 0) {
        setIsLoading(false);
        setLoadError('Invalid coach ID');
        return;
      }
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await coachService.getAvailability(coachId);
        const full = buildFullList(data.weekly);
        store.setAllSlots(full, data.overrides || []);
      } catch (e: any) {
        setLoadError(e?.message ?? 'Failed to load availability');
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailability();
  }, [coachId]);

  const toggleDay = (day: Day) => {
    const slot = store.slots.find(s => s.day === day);
    if (!slot) return;
    if (slot.isAvailable && slot.bookedCount > 0) {
      Alert.alert('Cannot Disable', `This day has ${slot.bookedCount} active booking(s).`);
      return;
    }
    store.setSlot(day, { isAvailable: !slot.isAvailable });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleOverride = (id: string, currentStatus: boolean) => {
    store.removeOverride(id);
    const override = store.overrides.find(o => o.id === id);
    if (override) {
      store.addOverride({ ...override, isAvailable: !currentStatus });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTimeChange = (date: Date) => {
    if (!pickerState.field) return;
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    if (pickerState.day) {
      store.setSlot(pickerState.day, { [pickerState.field]: timeStr });
    } else if (pickerState.id) {
      const override = store.overrides.find(o => o.id === pickerState.id);
      if (override) {
        store.removeOverride(override.id);
        store.addOverride({ ...override, [pickerState.field]: timeStr });
      }
    }
    setPickerState({ day: null, id: null, field: null });
  };

  const handleAddOverrideDate = (date: Date) => {
    setShowOverridePicker(false);
    const specificDate = date.toISOString().split('T')[0];
    
    if (store.overrides.some(o => o.specificDate === specificDate)) {
      Alert.alert('Duplicate Date', 'An override for this date already exists.');
      return;
    }
    
    store.addOverride({
      id: `temp-override-${Date.now()}`,
      day: 'MON',
      specificDate,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: false,
      maxSessions: 3,
      bookedCount: 0
    });
  };

  const [tempTime, setTempTime] = useState<Date>(new Date());
  
  useEffect(() => {
    if (pickerState.field) {
      setTempTime(parseTimeToDate(
        pickerState.day 
          ? store.slots.find(s => s.day === pickerState.day)![pickerState.field]
          : store.overrides.find(o => o.id === pickerState.id)![pickerState.field]
      ));
    }
  }, [pickerState.field]);

  const parseTimeToDate = (timeStr: string): Date => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const existingIds = [
        ...store.savedSnapshot.slots.filter(s => s.id && !s.id.startsWith('temp-')).map(s => s.id),
        ...store.savedSnapshot.overrides.filter(s => s.id && !s.id.startsWith('temp-')).map(s => s.id)
      ];
         
      const payloadSlots = store.slots.map(s => ({
        day: s.day, startTime: s.startTime, endTime: s.endTime, isAvailable: s.isAvailable, maxSessions: s.maxSessions
      }));

      const payloadOverrides = store.overrides.map(o => ({
        specificDate: o.specificDate, startTime: o.startTime, endTime: o.endTime, isAvailable: o.isAvailable
      }));
      
      await coachService.updateAvailability(coachId, payloadSlots, payloadOverrides, existingIds);
      
      const data = await coachService.getAvailability(coachId);
      store.setAllSlots(buildFullList(data.weekly), data.overrides);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Availability saved successfully', 'success');
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(e?.message ?? 'Failed to save. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard changes?',
      'Your unsaved availability changes will be lost.',
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => { store.resetToSaved(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } },
      ]
    );
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator color={nebulaGold.colors.gold.primary} size="large" /></View>;
  if (loadError) return <View style={styles.container}><ScreenHeader title="Availability" /><View style={styles.center}><Text style={styles.errorText}>{loadError}</Text></View></View>;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Availability" subtitle={store.lastSaved ? `Saved ${new Date(store.lastSaved).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}` : 'Manage your schedule'} />

      {store.isDirty && (
        <View style={styles.unsavedBanner}>
          <Text style={styles.unsavedText}>⚠️ Unsaved changes</Text>
          <TouchableOpacity onPress={handleDiscard}><Text style={styles.discardText}>Discard</Text></TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Weekly Schedule</Text>
        {store.slots.map((slot) => (
          <GlassCard key={slot.day} style={[styles.dayCard, slot.isAvailable && styles.dayCardActive]}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayLabel, slot.isAvailable && styles.dayLabelActive]}>{DAY_LABELS[slot.day]}</Text>
              <Switch
                value={slot.isAvailable}
                onValueChange={() => toggleDay(slot.day)}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: nebulaGold.colors.gold.primary }}
                thumbColor={nebulaGold.colors.background.primary}
              />
            </View>
            
            {slot.isAvailable && (
              <View style={styles.timeEditor}>
                <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerState({ day: slot.day, id: null, field: 'startTime' })}>
                  <Clock size={16} color={nebulaGold.colors.text.secondary} />
                  <Text style={styles.timeText}>{slot.startTime}</Text>
                </TouchableOpacity>
                <Text style={styles.timeSeparator}>to</Text>
                <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerState({ day: slot.day, id: null, field: 'endTime' })}>
                  <Clock size={16} color={nebulaGold.colors.text.secondary} />
                  <Text style={styles.timeText}>{slot.endTime}</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        ))}
        
        <View style={styles.overridesHeader}>
          <Text style={styles.sectionTitle}>Date Overrides</Text>
          <TouchableOpacity onPress={() => setShowOverridePicker(true)} style={styles.addBtn}>
            <Calendar size={16} color={nebulaGold.colors.gold.primary} />
            <Text style={styles.addBtnText}>Add Date</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>Add specific dates where your availability differs from the weekly schedule (e.g. Vacations).</Text>

        {store.overrides.map((override) => (
          <GlassCard key={override.id} style={[styles.dayCard, override.isAvailable && styles.dayCardActive]}>
            <View style={styles.dayHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity onPress={() => store.removeOverride(override.id)}>
                  <Trash2 size={20} color={nebulaGold.colors.status.danger} />
                </TouchableOpacity>
                <Text style={[styles.dayLabel, override.isAvailable && styles.dayLabelActive]}>
                  {override.specificDate} {override.isAvailable ? '(Available)' : '(Unavailable)'}
                </Text>
              </View>
              <Switch
                value={override.isAvailable}
                onValueChange={() => toggleOverride(override.id, override.isAvailable)}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: nebulaGold.colors.gold.primary }}
                thumbColor={nebulaGold.colors.background.primary}
              />
            </View>
            
            {override.isAvailable && (
              <View style={styles.timeEditor}>
                <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerState({ day: null, id: override.id, field: 'startTime' })}>
                  <Clock size={16} color={nebulaGold.colors.text.secondary} />
                  <Text style={styles.timeText}>{override.startTime}</Text>
                </TouchableOpacity>
                <Text style={styles.timeSeparator}>to</Text>
                <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerState({ day: null, id: override.id, field: 'endTime' })}>
                  <Clock size={16} color={nebulaGold.colors.text.secondary} />
                  <Text style={styles.timeText}>{override.endTime}</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        ))}
        {store.overrides.length === 0 && (
          <Text style={styles.emptyText}>No date overrides.</Text>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <GoldButton
          title={isSaving ? 'Saving...' : 'Save Availability'}
          onPress={handleSave}
          variant="primary"
          style={styles.saveBtn}
          disabled={!store.isDirty && store.lastSaved !== null}
        />
      </View>
      
      {pickerState.field && (
        Platform.OS === 'ios' ? (
          <Modal transparent visible animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setPickerState({ day: null, id: null, field: null })}>
                    <Text style={styles.modalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Select Time</Text>
                  <TouchableOpacity onPress={() => handleTimeChange(tempTime)}>
                    <Text style={styles.modalDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  mode="time"
                  display="spinner"
                  value={tempTime}
                  is24Hour={true}
                  onChange={(_, date) => date && setTempTime(date)}
                  themeVariant="light"
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            mode="time"
            value={tempTime}
            is24Hour={true}
            onChange={(_, date) => {
              if (date) handleTimeChange(date);
              else setPickerState({ day: null, id: null, field: null });
            }}
          />
        )
      )}

      {showOverridePicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent visible animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowOverridePicker(false)}>
                    <Text style={styles.modalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Select Date</Text>
                  <View style={{ width: 50 }} />
                </View>
                <DateTimePicker
                  mode="date"
                  display="inline"
                  value={new Date()}
                  minimumDate={new Date()}
                  onChange={(_, date) => {
                    if (date) {
                      handleAddOverrideDate(date);
                    }
                  }}
                  themeVariant="light"
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            mode="date"
            value={new Date()}
            minimumDate={new Date()}
            onChange={(_, date) => {
              if (date) handleAddOverrideDate(date);
              else setShowOverridePicker(false);
            }}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: nebulaGold.colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: nebulaGold.colors.background.primary, padding: 20 },
  errorText: { ...nebulaGold.typography.body, color: nebulaGold.colors.status.danger, textAlign: 'center' },
  scrollContent: { padding: nebulaGold.spacing.lg },
  
  unsavedBanner: {
    marginHorizontal: nebulaGold.spacing.lg,
    marginBottom: nebulaGold.spacing.sm,
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(243, 156, 18, 0.3)',
  },
  unsavedText: { ...nebulaGold.typography.caption, color: nebulaGold.colors.status.warning, fontWeight: '600' },
  discardText: { ...nebulaGold.typography.caption, color: nebulaGold.colors.status.danger, fontWeight: '700' },

  sectionTitle: { ...nebulaGold.typography.heading3, color: nebulaGold.colors.text.primary, marginBottom: 16, marginTop: 8 },
  overridesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 8 },
  helperText: { ...nebulaGold.typography.caption, color: nebulaGold.colors.text.secondary, marginBottom: 16 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(201, 168, 76, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addBtnText: { ...nebulaGold.typography.caption, color: nebulaGold.colors.gold.primary, fontWeight: '600' },
  emptyText: { ...nebulaGold.typography.body, color: nebulaGold.colors.text.secondary, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },

  dayCard: { marginBottom: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dayCardActive: { borderColor: 'rgba(201, 168, 76, 0.3)', backgroundColor: 'rgba(201, 168, 76, 0.05)' },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayLabel: { ...nebulaGold.typography.heading3, color: nebulaGold.colors.text.secondary },
  dayLabelActive: { color: nebulaGold.colors.text.primary },
  
  timeEditor: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', gap: 12 },
  timeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: nebulaGold.colors.background.secondary, paddingVertical: 10, borderRadius: 8, gap: 8 },
  timeText: { ...nebulaGold.typography.body, color: nebulaGold.colors.text.primary, fontWeight: '600' },
  timeSeparator: { ...nebulaGold.typography.caption, color: nebulaGold.colors.text.secondary },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: nebulaGold.spacing.lg, backgroundColor: nebulaGold.colors.background.primary, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  saveBtn: { height: 50 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { backgroundColor: nebulaGold.colors.background.secondary, padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalCancel: { ...nebulaGold.typography.body, color: nebulaGold.colors.text.secondary },
  modalDone: { ...nebulaGold.typography.body, color: nebulaGold.colors.gold.primary, fontWeight: 'bold' },
  modalTitle: { ...nebulaGold.typography.heading3, color: nebulaGold.colors.text.primary },
});

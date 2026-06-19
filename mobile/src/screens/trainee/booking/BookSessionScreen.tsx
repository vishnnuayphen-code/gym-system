import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star, Clock, Calendar, CheckCircle2, User, Users, MessageSquare } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';

import { nebulaGold } from '../../../theme/nebulaGold';
import { useBookingStore, Coach } from '../../../stores/bookingStore';
import { TimeSlot } from '../../../stores/availabilityStore';
import { SectionLabel } from '../../../components/nebula/SectionLabel';
import { sessionService } from '../../../services/sessionService';
import { useAuthStore } from '../../../../store/authStore';
import api from '../../../../lib/api';

const FOCUS_AREAS = [
  'Upper Body', 'Lower Body', 'Core', 
  'Cardio', 'Flexibility', 'Full Body', 'Strength'
];

export const BookSessionScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    selectedCoach, setCoach, 
    selectedDate, setDate, 
    selectedSlot, setSlot,
    selectedSessionType, setSessionType,
    focusAreas, setFocusAreas,
    notes, setNotes,
    reset
  } = useBookingStore();

  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoadingCoaches, setIsLoadingCoaches] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [trainingType, setTrainingType] = useState<'PERSONAL_TRAINING' | 'SELF_TRAINING' | null>(null);
  const [gymSettings, setGymSettings] = useState<{ openingTime: string; closingTime: string } | null>(null);

  useEffect(() => {
    fetchTraineeProfile();
    
    // Auto-select today if no date is selected
    if (!selectedDate) {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, []);

  const fetchTraineeProfile = async () => {
    try {
      const response = await api.get('/trainees/me');
      const profile = response.data;
      if (profile) {
        const type = profile.trainingType || 'SELF_TRAINING';
        setTrainingType(type);
        if (type === 'SELF_TRAINING') {
          setSessionType('GROUP_SESSION'); // Default to Group session for self-training
          fetchGymSettings();
        } else {
          setSessionType('PERSONAL_TRAINING');
          fetchCoaches();
          if (profile.assignedCoach) {
            const ac = profile.assignedCoach;
            const mappedCoach: Coach = {
              id: ac.id.toString(),
              name: ac.name || 'Your Coach',
              specialty: ac.specialization || 'Personal Trainer',
              rating: ac.averageRating || 5.0,
              reviewCount: 0,
              availableDays: [],
              photoUrl: ac.profilePhotoUrl
            };
            setCoach(mappedCoach);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch trainee profile", error);
      setTrainingType('SELF_TRAINING');
      setSessionType('GROUP_SESSION');
      fetchGymSettings();
    }
  };

  const fetchGymSettings = async () => {
    setIsLoadingAvailability(true);
    try {
      const response = await api.get('/gym/settings');
      if (response.data) {
        setGymSettings(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch gym settings", error);
      setGymSettings({ openingTime: "06:00", closingTime: "22:00" });
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const fetchCoaches = async () => {
    setIsLoadingCoaches(true);
    try {
      const response = await api.get('/coaches');
      const data = response.data;
      if (Array.isArray(data)) {
        const mappedCoaches: Coach[] = data.map((c: any) => ({
          id: c.id.toString(),
          name: c.name || 'Unknown Coach',
          specialty: c.specialization || 'General Fitness',
          rating: c.averageRating || 4.9, 
          reviewCount: 0,
          availableDays: [],
          photoUrl: c.profilePhotoUrl
        }));
        setCoaches(mappedCoaches);
        if (mappedCoaches.length > 0 && !selectedCoach) {
          setCoach(mappedCoaches[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch coaches", error);
    } finally {
      setIsLoadingCoaches(false);
    }
  };

  useEffect(() => {
    if (selectedCoach && trainingType === 'PERSONAL_TRAINING') {
      fetchCoachAvailability();
    }
  }, [selectedCoach, trainingType]);

  const fetchCoachAvailability = async () => {
    setIsLoadingAvailability(true);
    try {
      const response = await api.get(`/coach-availability/${selectedCoach?.id}`);
      if (response.data.success) {
        const mapped = response.data.data.map((s: any) => ({
          id: s.id.toString(),
          day: s.dayOfWeek.substring(0, 3) as any,
          period: s.startTime.split(':')[0] < 12 ? 'MORNING' : (s.startTime.split(':')[0] < 18 ? 'AFTERNOON' : 'EVENING'),
          startTime: s.startTime.substring(0, 5),
          endTime: s.endTime.substring(0, 5),
          isAvailable: true,
          maxSessions: 1,
          bookedCount: 0
        }));
        setAvailability(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch coach availability", error);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dayNum = d.getDate();
      const dayKey = dayName.slice(0, 3) as any;
      const hasAvailability = availability.some(s => s.day === dayKey && s.isAvailable);
      
      arr.push({ date: iso, dayName, dayNum, dayKey, hasAvailability });
    }
    return arr;
  }, [availability]);

  const filteredSlots = useMemo(() => {
    if (!selectedDate) return [];

    if (trainingType === 'SELF_TRAINING') {
      const openTime = gymSettings?.openingTime || "06:00";
      const closeTime = gymSettings?.closingTime || "22:00";
      const [startH, startM] = openTime.split(':').map(Number);
      const [endH, endM] = closeTime.split(':').map(Number);
      
      const startMinutes = startH * 60 + (startM || 0);
      const endMinutes = endH * 60 + (endM || 0);
      
      const hourlySlots: TimeSlot[] = [];
      const dayKey = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() as any;
      
      for (let m = startMinutes; m + 60 <= endMinutes; m += 60) {
        const slotStartH = Math.floor(m / 60);
        const slotStartM = m % 60;
        const slotEndH = Math.floor((m + 60) / 60);
        const slotEndM = (m + 60) % 60;
        const pad = (n: number) => n.toString().padStart(2, '0');
        
        hourlySlots.push({
          id: `gym-slot-${pad(slotStartH)}${pad(slotStartM)}`,
          day: dayKey,
          startTime: `${pad(slotStartH)}:${pad(slotStartM)}`,
          endTime: `${pad(slotEndH)}:${pad(slotEndM)}`,
          isAvailable: true,
          maxSessions: 999,
          bookedCount: 0
        });
      }
      return hourlySlots;
    }

    const dateObj = new Date(selectedDate);
    const dayKey = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() as any;
    const daySlots = availability.filter(s => s.day === dayKey && s.isAvailable);

    // Break each availability window into individual 1-hour slots
    const hourlySlots: TimeSlot[] = [];
    daySlots.forEach(slot => {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + (startM || 0);
      const endMinutes = endH * 60 + (endM || 0);

      for (let m = startMinutes; m + 60 <= endMinutes; m += 60) {
        const slotStartH = Math.floor(m / 60);
        const slotStartM = m % 60;
        const slotEndH = Math.floor((m + 60) / 60);
        const slotEndM = (m + 60) % 60;
        const pad = (n: number) => n.toString().padStart(2, '0');
        hourlySlots.push({
          ...slot,
          id: `${slot.id}-${pad(slotStartH)}${pad(slotStartM)}`,
          startTime: `${pad(slotStartH)}:${pad(slotStartM)}`,
          endTime: `${pad(slotEndH)}:${pad(slotEndM)}`,
        });
      }
    });

    return hourlySlots;
  }, [selectedDate, availability, trainingType, gymSettings]);

  const handleFocusToggle = (area: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter(a => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const handleConfirm = async () => {
    const isPersonal = trainingType === 'PERSONAL_TRAINING';
    if (!user?.id || !selectedSlot || (isPersonal && !selectedCoach)) return;
    
    setIsBooking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    try {
      // Ensure time strings have seconds (HH:mm -> HH:mm:ss) for backend LocalTime parsing
      const formatTime = (t: string) => t.length === 5 ? `${t}:00` : t;

      const payload = {
        traineeId: Number(user.id),
        coachId: selectedCoach ? Number(selectedCoach.id) : null,
        sessionDate: selectedDate,
        startTime: formatTime(selectedSlot.startTime),
        endTime: formatTime(selectedSlot.endTime),
        sessionType: selectedSessionType || (isPersonal ? 'PERSONAL_TRAINING' : 'GROUP_SESSION'),
        sessionNotes: notes
      };
      
      const response = await sessionService.create(payload);
      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push('/(trainee)/booking/success');
      } else {
        throw new Error(response.message || "Booking failed");
      }
    } catch (error: any) {
      console.error("Booking failed", error);
      const msg = error?.response?.data?.message || error?.message || "Something went wrong while booking your session.";
      Alert.alert("Booking Failed", msg);
    } finally {
      setIsBooking(false);
    }
  };

  const isFormValid = (trainingType === 'SELF_TRAINING' || selectedCoach) && selectedDate && selectedSlot && selectedSessionType;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Session</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Coach Section */}
        {trainingType === 'PERSONAL_TRAINING' && (
          <View style={styles.section}>
            <SectionLabel label="SELECT COACH" />
            {isLoadingCoaches ? (
              <ActivityIndicator color="#000" style={{ marginTop: 20 }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {coaches.map(coach => {
                  const isSelected = selectedCoach?.id === coach.id;
                  return (
                    <TouchableOpacity
                      key={coach.id}
                      onPress={() => {
                        setCoach(coach);
                        setSlot(null); // Reset slot when changing coach
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.coachCard, isSelected && styles.coachCardActive]}
                    >
                      <View style={styles.coachAvatar}>
                        {coach.photoUrl ? (
                          <Image source={{ uri: coach.photoUrl }} style={styles.coachAvatarImg} />
                        ) : (
                          <Text style={styles.coachAvatarText}>{coach.name.charAt(0)}</Text>
                        )}
                      </View>
                      <Text style={[styles.coachName, isSelected && styles.textWhite]}>{coach.name}</Text>
                      <Text style={[styles.coachSpecialty, isSelected && styles.textWhite70]}>{coach.specialty}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}

        {/* Date Section */}
        <View style={styles.section}>
          <SectionLabel label="SELECT DATE" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {days.map((day: any) => {
              const isSelected = selectedDate === day.date;
              const isToday = new Date().toISOString().split('T')[0] === day.date;
              return (
                <TouchableOpacity
                  key={day.date}
                  onPress={() => {
                    setDate(day.date);
                    setSlot(null);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[styles.dayCard, isSelected && styles.bgBlack]}
                >
                  <Text style={[styles.dayName, isSelected && styles.textWhite]}>{day.dayName}</Text>
                  <Text style={[styles.dayNum, isSelected && styles.textWhite]}>{day.dayNum}</Text>
                  {isToday && !isSelected && <View style={styles.todayIndicator} />}
                  {day.hasAvailability && !isSelected && <View style={styles.availabilityDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Slot Section */}
        <View style={styles.section}>
          <SectionLabel label="SELECT TIME" />
          {isLoadingAvailability ? (
            <ActivityIndicator color="#000" style={{ marginTop: 20 }} />
          ) : filteredSlots.length > 0 ? (
            <Animated.View layout={Layout.springify()} style={styles.slotGrid}>
              {filteredSlots.map(slot => {
                const isSelected = selectedSlot?.id === slot.id;
                const isFull = (slot.maxSessions - slot.bookedCount) <= 0;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    disabled={isFull}
                    onPress={() => {
                      setSlot(slot);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    style={[
                      styles.slotCard, 
                      isSelected && styles.bgBlack,
                      isFull && styles.slotFull
                    ]}
                  >
                    <Clock size={16} color={isSelected ? '#FFF' : '#000'} />
                    <Text style={[styles.slotTime, isSelected && styles.textWhite]}>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          ) : (
            <View style={styles.emptySlots}>
              <Calendar size={24} color="#8E8E93" />
              <Text style={styles.emptySlotsText}>No availability on this date</Text>
            </View>
          )}
        </View>

        {/* Session Details */}
        <View style={styles.section}>
          <SectionLabel label="SESSION TYPE" />
          <View style={styles.typeGrid}>
            <TouchableOpacity 
              onPress={() => {
                setSessionType('PERSONAL_TRAINING');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.typeCard, selectedSessionType === 'PERSONAL_TRAINING' && styles.bgBlack]}
            >
              <User size={24} color={selectedSessionType === 'PERSONAL_TRAINING' ? '#FFF' : '#000'} />
              <View>
                <Text style={[styles.typeTitle, selectedSessionType === 'PERSONAL_TRAINING' && styles.textWhite]}>1-on-1 Training</Text>
                <Text style={[styles.typeSubtitle, selectedSessionType === 'PERSONAL_TRAINING' && styles.textWhite70]}>Private focus</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setSessionType('GROUP_SESSION');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.typeCard, selectedSessionType === 'GROUP_SESSION' && styles.bgBlack]}
            >
              <Users size={24} color={selectedSessionType === 'GROUP_SESSION' ? '#FFF' : '#000'} />
              <View>
                <Text style={[styles.typeTitle, selectedSessionType === 'GROUP_SESSION' && styles.textWhite]}>Group Training</Text>
                <Text style={[styles.typeSubtitle, selectedSessionType === 'GROUP_SESSION' && styles.textWhite70]}>Train with others</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Focus Areas */}
        <View style={styles.section}>
          <SectionLabel label="FOCUS AREAS (OPTIONAL)" />
          <View style={styles.pillsContainer}>
            {FOCUS_AREAS.map(area => {
              const isSelected = focusAreas.includes(area);
              return (
                <TouchableOpacity
                  key={area}
                  onPress={() => handleFocusToggle(area)}
                  style={[styles.pill, isSelected && styles.bgBlack]}
                >
                  <Text style={[styles.pillText, isSelected && styles.textWhite]}>{area}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <SectionLabel label="NOTES (OPTIONAL)" />
          <View style={styles.notesContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Any injuries, preferences, or goals..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <Animated.View entering={FadeInDown} style={styles.footer}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryPrice}>1 Session</Text>
          </View>
          <TouchableOpacity 
            disabled={!isFormValid || isBooking}
            onPress={handleConfirm}
            style={[styles.confirmBtn, (!isFormValid || isBooking) && styles.disabledBtn]}
          >
            {isBooking ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.confirmBtnText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  backButton: { padding: 8, marginLeft: -8 },
  backButtonPlaceholder: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  scrollContent: { paddingTop: 24, paddingBottom: 40 },
  section: { marginBottom: 32 },
  horizontalScroll: { paddingHorizontal: 20, gap: 12 },
  
  coachCard: { width: 140, padding: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  coachCardActive: { backgroundColor: '#000', borderColor: '#000' },
  coachAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  coachAvatarImg: { width: '100%', height: '100%' },
  coachAvatarText: { fontSize: 18, fontWeight: '800', color: '#000' },
  coachName: { fontSize: 15, fontWeight: '800', color: '#000' },
  coachSpecialty: { fontSize: 11, fontWeight: '600', color: '#8E8E93', marginTop: 4 },
  
  dayCard: { width: 64, height: 80, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  dayName: { fontSize: 11, fontWeight: '800', color: '#8E8E93', letterSpacing: 0.5 },
  dayNum: { fontSize: 22, fontWeight: '900', color: '#000', marginTop: 4 },
  todayIndicator: { position: 'absolute', bottom: 10, width: 12, height: 3, backgroundColor: '#000', borderRadius: 2 },
  availabilityDot: { position: 'absolute', bottom: 10, width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' },
  
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20 },
  slotCard: { width: '47%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  slotFull: { opacity: 0.5 },
  slotTime: { fontSize: 15, fontWeight: '800', color: '#000' },
  emptySlots: { paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F9F9F9', marginHorizontal: 20, borderRadius: 20 },
  emptySlotsText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  
  typeGrid: { flexDirection: 'row', gap: 12, paddingHorizontal: 20 },
  typeCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  typeTitle: { fontSize: 14, fontWeight: '800', color: '#000' },
  typeSubtitle: { fontSize: 11, fontWeight: '600', color: '#8E8E93', marginTop: 2 },
  
  pillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  pillText: { fontSize: 13, fontWeight: '700', color: '#000' },
  
  notesContainer: { paddingHorizontal: 20 },
  textArea: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, fontSize: 15, color: '#000', minHeight: 100, fontWeight: '600', borderWidth: 1, borderColor: '#F2F2F7' },
  
  bgBlack: { backgroundColor: '#000', borderColor: '#000' },
  textWhite: { color: '#FFF' },
  textWhite70: { color: 'rgba(255,255,255,0.7)' },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20, borderTopWidth: 1, borderTopColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 10 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 12, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryPrice: { fontSize: 20, fontWeight: '900', color: '#000', marginTop: 4 },
  confirmBtn: { backgroundColor: '#000', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  disabledBtn: { opacity: 0.4 },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});

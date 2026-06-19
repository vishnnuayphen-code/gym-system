import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { Calendar as CalendarIcon, Clock, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming,
  FadeInUp
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { nebulaGold } from '../../../theme/nebulaGold';
import { useBookingStore } from '../../../stores/bookingStore';
import { TimeSlot } from '../../../stores/availabilityStore';
import { GlassCard } from '../../../components/nebula/GlassCard';
import { OnboardingLayout } from '../../../components/onboarding/OnboardingLayout';
import { SectionLabel } from '../../../components/nebula/SectionLabel';
import api from '../../../../lib/api';

const WINDOW_WIDTH = Dimensions.get('window').width;
const DAY_CARD_WIDTH = 64;

export const PickSlotStep = ({ onNext }: { onNext: () => void }) => {
  const { selectedCoach, selectedDate, selectedSlot, setDate, setSlot } = useBookingStore();
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const shakeOffset = useSharedValue(0);

  useEffect(() => {
    if (selectedCoach) {
      fetchCoachAvailability();
    }
  }, [selectedCoach]);

  const fetchCoachAvailability = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/coach-availability/${selectedCoach?.id}`);
      if (response.data.success) {
        // Map backend CoachAvailability to frontend TimeSlot
        const mapped = response.data.data.map((s: any) => ({
          id: s.id.toString(),
          day: s.dayOfWeek.substring(0, 3) as any, // MONDAY -> MON
          period: s.startTime.split(':')[0] < 12 ? 'MORNING' : (s.startTime.split(':')[0] < 18 ? 'AFTERNOON' : 'EVENING'),
          startTime: s.startTime.substring(0, 5), // 09:00:00 -> 09:00
          endTime: s.endTime.substring(0, 5),
          isAvailable: true,
          maxSessions: 1, // Backend doesn't support multiple yet
          bookedCount: 0  // Real count would require date-specific check
        }));
        setAvailability(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch coach availability", error);
    } finally {
      setIsLoading(false);
    }
  };

  const shakeAnimation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    shakeOffset.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }]
  }));

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dayNum = d.getDate();
      
      // Check if coach has ANY availability this day of week
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      // MON/TUE etc. Wait, availabilityStore uses MON-SUN
      const dayKey = dayName.slice(0, 3) as any; // MON, TUE etc.
      const hasAvailability = availability.some(s => s.day === dayKey && s.isAvailable);
      
      arr.push({ date: iso, dayName, dayNum, dayKey, hasAvailability });
    }
    return arr;
  }, [availability]);

  const filteredSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateObj = new Date(selectedDate);
    const dayKey = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() as any;
    return availability.filter(s => s.day === dayKey && s.isAvailable);
  }, [selectedDate, availability]);

  const morningSlots = filteredSlots.filter((s: TimeSlot) => s.period === 'MORNING');
  const afternoonSlots = filteredSlots.filter((s: TimeSlot) => s.period === 'AFTERNOON');
  const eveningSlots = filteredSlots.filter((s: TimeSlot) => s.period === 'EVENING');

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={4}
      title="Pick Date & Slot"
      subtitle={`Choose a time with ${selectedCoach?.name}.`}
      onNext={onNext}
      isNextDisabled={!selectedSlot}
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.calendarStrip}
        contentContainerStyle={styles.calendarContent}
      >
        {days.map((day: any) => {
          const isSelected = selectedDate === day.date;
          const isToday = new Date().toISOString().split('T')[0] === day.date;
          
          return (
            <TouchableOpacity
              key={day.date}
              onPress={() => {
                setDate(day.date);
                setSlot(null); // Reset slot on date change
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.dayCard,
                isSelected && styles.activeDayCard,
              ]}
            >
              <Text style={[styles.dayName, isSelected && styles.activeDayText]}>{day.dayName}</Text>
              <Text style={[styles.dayNum, isSelected && styles.activeDayText]}>{day.dayNum}</Text>
              {isToday && !isSelected && <View style={styles.todayIndicator} />}
              {day.hasAvailability && !isSelected && <View style={styles.availabilityDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedDate ? (
        <Animated.View entering={FadeInUp} style={styles.slotsContainer}>
          <SectionLabel label={`AVAILABLE SLOTS — ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}`} />
          
          {isLoading ? (
            <ActivityIndicator color="#000" style={{ marginTop: 24 }} />
          ) : filteredSlots.length > 0 ? (
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={styles.slotGrid}>
                {[
                  { label: 'Morning', data: morningSlots },
                  { label: 'Afternoon', data: afternoonSlots },
                  { label: 'Evening', data: eveningSlots }
                ].map(section => section.data.length > 0 && (
                  <View key={section.label} style={styles.periodSection}>
                    <Text style={styles.periodLabel}>{section.label}</Text>
                    {section.data.map((slot: TimeSlot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      const spotsLeft = slot.maxSessions - slot.bookedCount;
                      const isFull = spotsLeft <= 0;
                      
                      return (
                        <TouchableOpacity
                          key={slot.id}
                          disabled={isFull}
                          onPress={() => {
                            setSlot(slot);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          }}
                        >
                          <View style={[
                            styles.slotCard,
                            isSelected && styles.selectedSlotCard,
                            isFull && styles.fullSlotCard
                          ] as any}>
                            <View style={styles.slotMain}>
                              <Clock size={16} color={isSelected ? '#FFF' : '#000'} />
                              <Text style={[
                                styles.slotTime,
                                isSelected && styles.activeText
                              ]}>
                                {slot.startTime} – {slot.endTime}
                              </Text>
                            </View>
                            
                            <View style={styles.slotStatus}>
                              <Text style={[
                                styles.spotsText,
                                isSelected && styles.activeText,
                                isFull && { color: '#FF3B30' },
                                !isFull && { color: isSelected ? '#FFFFFF80' : '#8E8E93' }
                              ]}>
                                {isFull ? 'FULLY BOOKED' : `${spotsLeft} ${spotsLeft === 1 ? 'SPOT' : 'SPOTS'} LEFT`}
                              </Text>
                              {isSelected && <CheckCircle2 size={16} color="#FFF" />}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          ) : (
            <View style={styles.noAvailability}>
               <CalendarIcon size={40} color="#F2F2F7" />
               <Text style={styles.noAvailabilityText}>No sessions available for this coach on this date.</Text>
            </View>
          )}
        </Animated.View>
      ) : (
        <View style={styles.emptySlots}>
          <CalendarIcon size={64} color="#F2F2F7" />
          <Text style={styles.emptyText}>Pick a date to see available slots</Text>
        </View>
      )}
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  calendarStrip: { maxHeight: 100, marginBottom: 24 },
  calendarContent: { paddingHorizontal: 20, gap: 10 },
  dayCard: { width: 56, height: 76, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F2F2F7', 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  activeDayCard: { backgroundColor: '#000', borderColor: '#000' },
  dayName: { fontSize: 10, fontWeight: '800', color: '#8E8E93', letterSpacing: 0.5 },
  dayNum: { fontSize: 20, fontWeight: '900', color: '#000', marginTop: 4 },
  activeDayText: { color: '#FFF' },
  todayIndicator: { position: 'absolute', bottom: 10, width: 12, height: 2, backgroundColor: '#000', borderRadius: 1 },
  availabilityDot: { position: 'absolute', bottom: 10, width: 4, height: 4, borderRadius: 2, backgroundColor: '#34C759' },
  slotsContainer: { flex: 1 },
  slotGrid: { gap: 20 },
  periodSection: { gap: 12 },
  periodLabel: { fontSize: 11, fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 },
  slotCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  selectedSlotCard: { backgroundColor: '#000', borderColor: '#000' },
  fullSlotCard: { opacity: 0.4 },
  slotMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slotTime: { fontSize: 15, fontWeight: '700', color: '#000' },
  slotStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spotsText: { fontSize: 11, fontWeight: '800', color: '#34C759' },
  activeText: { color: '#FFF' },
  noAvailability: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center', gap: 16 },
  noAvailabilityText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', maxWidth: 240, fontWeight: '600' },
  emptySlots: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300, gap: 16 },
  emptyText: { fontSize: 14, color: '#8E8E93', fontWeight: '600' }
});

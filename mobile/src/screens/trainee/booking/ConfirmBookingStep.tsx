import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform,
  Image
} from 'react-native';
import { Calendar, Clock, User, Info, CheckCircle2, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { sessionService } from '../../../services/sessionService';
import api from '../../../../lib/api';
import { useBookingStore } from '../../../stores/bookingStore';
import { useAuthStore } from '../../../../store/authStore';
import { OnboardingLayout } from '../../../components/onboarding/OnboardingLayout';

export const ConfirmBookingStep = ({ onNext }: { onNext: () => void }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    selectedCoach, selectedDate, selectedSlot, 
    selectedSessionType, focusAreas, notes, reset 
  } = useBookingStore();
  
  const [isBooking, setIsBooking] = useState(false);

  const handleConfirm = async () => {
    const isPersonal = selectedSessionType === 'PERSONAL_TRAINING';
    if (!user?.id || !selectedSlot || (isPersonal && !selectedCoach)) return;
    
    setIsBooking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    try {
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
        onNext(); // Move to success screen
      } else {
        throw new Error(response.message || "Booking failed");
      }
    } catch (error: any) {
      console.error("Booking failed", error);
      const msg = error?.response?.data?.message || error?.message || "Something went wrong while booking your session. Please try again.";
      Alert.alert("Booking Failed", msg);
    } finally {
      setIsBooking(false);
    }
  };

  const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '';

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={4}
      title="Review & Confirm"
      subtitle="Ready to train?"
      onNext={handleConfirm}
      isNextDisabled={isBooking}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          {/* Coach Section */}
          <View style={styles.summarySection}>
            <View style={styles.coachRow}>
              <View style={styles.avatar}>
                {selectedCoach ? (
                  selectedCoach.photoUrl ? (
                    <Image source={{ uri: selectedCoach.photoUrl }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarText}>{selectedCoach.name.charAt(0)}</Text>
                  )
                ) : (
                  <Text style={styles.avatarText}>G</Text>
                )}
              </View>
              <View style={styles.coachInfo}>
                <Text style={styles.coachName}>{selectedCoach ? selectedCoach.name : 'Gym Access'}</Text>
                <Text style={styles.coachStatus}>{selectedCoach ? 'Assigned Coach' : 'Self Training'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Date & Time Section */}
          <View style={styles.summarySection}>
             <View style={styles.detailRow}>
               <Calendar size={18} color="#000" />
               <Text style={styles.detailText}>{formattedDate}</Text>
             </View>
             <View style={[styles.detailRow, { marginTop: 12 }]}>
               <Clock size={18} color="#000" />
               <Text style={styles.timeText}>{selectedSlot?.startTime} – {selectedSlot?.endTime}</Text>
             </View>
          </View>

          <View style={styles.divider} />

          {/* Additional Details */}
          <View style={styles.summarySection}>
             <View style={styles.typeBadge}>
                <Text style={styles.typeText}>
                  {selectedSessionType === 'PERSONAL_TRAINING' ? '1-ON-1 TRAINING' : 'GROUP SESSION'}
                </Text>
             </View>
             
             {focusAreas.length > 0 && (
               <View style={styles.focusContainer}>
                  {focusAreas.map(area => (
                    <View key={area} style={styles.focusBadge}>
                      <Text style={styles.focusText}>{area}</Text>
                    </View>
                  ))}
               </View>
             )}

             {notes.length > 0 && (
               <View style={styles.notesBox}>
                 <Text style={styles.notesText}>{notes}</Text>
               </View>
             )}
          </View>
        </View>

        <View style={styles.policyRow}>
          <Info size={14} color="#8E8E93" />
          <Text style={styles.policyText}>
            You can cancel up to 2 hours before the session.
          </Text>
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#F2F2F7', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  summarySection: { padding: 24 },
  coachRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#000' },
  coachInfo: { flex: 1 },
  coachName: { fontSize: 18, fontWeight: '900', color: '#000' },
  coachStatus: { fontSize: 13, fontWeight: '700', color: '#8E8E93', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F2F2F7' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailText: { fontSize: 15, fontWeight: '800', color: '#000' },
  timeText: { fontSize: 18, fontWeight: '900', color: '#000', letterSpacing: -0.5 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#000' },
  typeText: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  focusContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  focusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F2F2F7' },
  focusText: { fontSize: 11, fontWeight: '800', color: '#000' },
  notesBox: { marginTop: 16, padding: 16, borderRadius: 16, backgroundColor: '#F9F9F9' },
  notesText: { fontSize: 14, color: '#8E8E93', fontStyle: 'italic', lineHeight: 20, fontWeight: '600' },
  policyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, marginBottom: 40 },
  policyText: { fontSize: 12, color: '#8E8E93', fontWeight: '700' }
});

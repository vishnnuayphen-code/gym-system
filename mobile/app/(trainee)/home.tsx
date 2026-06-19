import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { SectionLabel } from '../../src/components/nebula/SectionLabel';
import { StatBadge } from '../../src/components/nebula/StatBadge';
import { NebulaTransition } from '../../src/components/nebula/NebulaTransition';
import { Dumbbell, Calendar, ClipboardCheck, TrendingUp, LogOut, CreditCard, Zap, Bell, Clock } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useApiCall } from '../../src/hooks/useApiCall';
import { dashboardService } from '../../src/services/dashboardService';
import { membershipService } from '../../src/services/membershipService';
import { machineBookingService } from '../../src/services/machineBookingService';
import { ActivityIndicator, RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useBookingStore } from '../../src/stores/bookingStore';

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const QUICK_ACTIONS = [
  { id: '1', label: 'Book Session', icon: Calendar, route: '/(trainee)/booking' },
  { id: '2', label: 'Book Machine', icon: Zap, route: '/(trainee)/machines' },
  { id: '3', label: 'My Plan', icon: CreditCard, route: '/(trainee)/plans' },
  { id: '4', label: 'Check In', icon: ClipboardCheck, route: '/(trainee)/attendance' },
];

export default function TraineeHome() {
  const { logout, user } = useAuthStore();
  const { setCoach, reset, setStep } = useBookingStore();
  const router = useRouter();

  const { data: dashboard, loading: dashboardLoading, refreshing, refetch } = useApiCall(
    () => dashboardService.getTraineeDashboard(user?.id?.toString() || ''),
    [user?.id]
  );

  const { data: membershipData, loading: membershipLoading } = useApiCall(
    () => membershipService.getMyMembership(),
    []
  );

  const { data: bookedMachinesData, loading: bookingsLoading } = useApiCall(
    () => machineBookingService.getUpcomingBookings(),
    [user?.id]
  );

  const membership = membershipData?.data;
  const bookedMachines = bookedMachinesData || [];
  const notifications: any[] = []; // TODO: Integrate notification service when ready

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const LogoutButton = (
    <TouchableOpacity onPress={handleLogout} style={{ padding: 4 }}>
      <LogOut size={20} color={nebulaGold.colors.gold.primary} />
    </TouchableOpacity>
  );

  const calculateProgress = () => {
    if (membership?.status !== 'ACTIVE' || !membership?.startDate || !membership?.endDate) return 0;
    const start = new Date(membership.startDate).getTime();
    const end = new Date(membership.endDate).getTime();
    const now = new Date().getTime();
    if (now >= end) return 100;
    if (now <= start) return 0;
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };
  const progress = calculateProgress();

  return (
    <NebulaTransition>
      <View style={styles.container}>
      <ScreenHeader 
        title={`Good Morning, ${user?.name?.split(' ')[0] || 'Trainee'}`} 
        subtitle="Fuel your peak performance today" 
        rightSlot={LogoutButton} 
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={nebulaGold.colors.gold.primary} />
        }
      >
        {(dashboardLoading || membershipLoading || bookingsLoading) ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={nebulaGold.colors.gold.primary} />
          </View>
        ) : (
          <>
        {/* Refined Membership Card */}
        <View style={styles.section}>
          <GlassCard style={styles.progressCard}>
            <View style={styles.cardHeader}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {membership?.status === 'ACTIVE' ? 'Active' : (membership?.status || 'None')}
                </Text>
              </View>
              <Text style={styles.planName}>{dashboard?.membershipPlan || 'No Active Plan'}</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
               <View style={styles.progressTrack}>
                 <View style={[styles.progressFill, { width: `${progress}%` }]} />
               </View>
               <Text style={styles.progressPercent}>
                 {progress}%
               </Text>
            </View>
            
            <View style={styles.sessionBox}>
               <Text style={styles.nextLabel}>NEXT SESSION</Text>
               <Text style={styles.nextValue}>
                 {dashboard?.upcomingSessionDetails?.[0] 
                   ? `${new Date(dashboard.upcomingSessionDetails[0].sessionDate).toLocaleDateString()} at ${dashboard.upcomingSessionDetails[0].startTime.substring(0, 5)}`
                   : 'No upcoming sessions'}
               </Text>
            </View>

            {(!membership || membership.status === 'EXPIRED') && (
              <TouchableOpacity
                onPress={() => router.push('/(trainee)/plans')}
                style={styles.browseBtn}
              >
                <Text style={styles.browseBtnText}>Browse Membership Plans</Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        </View>

        <SectionLabel label="TODAY'S FOCUS" />
        <View style={styles.focusContainer}>
          {(!dashboard?.todayExercises || dashboard.todayExercises.length === 0) ? (
            <GlassCard style={styles.focusCard}>
               <View style={styles.focusIconCircle}>
                 <Dumbbell size={32} color="#000" />
               </View>
               <View style={{ flex: 1 }}>
                 <Text style={styles.focusTitle}>Rest Day</Text>
                 <Text style={styles.focusSub}>Recovery is essential for peak performance</Text>
               </View>
            </GlassCard>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {dashboard.todayExercises.map((ex: any, idx: number) => (
                <GlassCard key={idx} style={styles.exerciseCard}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseDetails}>{ex.sets} x {ex.reps}</Text>
                  <View style={styles.muscleBadge}>
                    <Text style={styles.muscleText}>{ex.targetMuscle}</Text>
                  </View>
                </GlassCard>
              ))}
            </ScrollView>
          )}
        </View>

        <SectionLabel label="BOOKED MACHINES" />
        <View style={styles.bookedMachinesContainer}>
          {bookedMachines.length === 0 ? (
            <GlassCard style={styles.emptyStateCard}>
              <View style={styles.emptyStateContent}>
                <Zap size={40} color={nebulaGold.colors.gold.primary} />
                <Text style={styles.emptyStateTitle}>No Machines Booked</Text>
                <Text style={styles.emptyStateSubtitle}>Book a machine to get started</Text>
              </View>
            </GlassCard>
          ) : (
            bookedMachines.map((booking: any) => (
              <GlassCard key={booking.id} style={styles.machineCard}>
                <View style={styles.machineCardHeader}>
                  <View style={styles.machineInfo}>
                    <Text style={styles.machineName}>{booking.machineName}</Text>
                    <Text style={styles.machineType}>{booking.machineType}</Text>
                  </View>
                  <View style={styles.statusBadgeConfirmed}>
                    <Text style={styles.statusBadgeText}>✓ Confirmed</Text>
                  </View>
                </View>

                <View style={styles.machineTimeBox}>
                  <Clock size={16} color={nebulaGold.colors.gold.primary} />
                  <View style={styles.timeDetails}>
                    <Text style={styles.timeLabel}>{booking.bookingDate}</Text>
                    <Text style={styles.timeValue}>{booking.startTime} - {booking.endTime}</Text>
                  </View>
                </View>

                <View style={styles.machineCoachBox}>
                  <Text style={styles.coachLabel}>Coach: <Text style={styles.coachName}>{booking.coachName || 'Gym Access (Self)'}</Text></Text>
                </View>

                <View style={styles.machineActionButtons}>
                  <TouchableOpacity style={styles.rescheduleBtn}>
                    <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))
          )}
        </View>

        <SectionLabel label="RECENT NOTIFICATIONS" />
        <View style={styles.notificationsContainer}>
          {notifications.length === 0 ? (
            <GlassCard style={styles.emptyStateCard}>
              <View style={styles.emptyStateContent}>
                <Bell size={40} color={nebulaGold.colors.gold.primary} />
                <Text style={styles.emptyStateTitle}>No Notifications</Text>
                <Text style={styles.emptyStateSubtitle}>You're all caught up</Text>
              </View>
            </GlassCard>
          ) : (
            notifications.map((notification: any) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.notificationItemUnread
                ]}
              >
                <View style={styles.notificationIconContainer}>
                  {notification.icon === 'zap' && <Zap size={20} color={nebulaGold.colors.gold.primary} />}
                  {notification.icon === 'clock' && <Clock size={20} color={nebulaGold.colors.gold.primary} />}
                  {notification.icon === 'check' && <Calendar size={20} color={nebulaGold.colors.gold.primary} />}
                </View>

                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>
                    {formatTimeAgo(notification.timestamp)}
                  </Text>
                </View>

                {!notification.read && <View style={styles.unreadDot} />}
              </View>
            ))
          )}
        </View>

        <SectionLabel label="QUICK ACTIONS" />
        <View style={styles.bentoGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity 
              key={action.id} 
              onPress={() => {
                Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (action.label === 'Book Session') {
                  reset();
                  // If we have an assigned coach, pre-load them
                  if (dashboard?.coachId) {
                    setCoach({
                      id: dashboard.coachId.toString(),
                      name: dashboard.coachName,
                      specialty: 'Assigned Coach',
                      rating: 5,
                      reviewCount: 0,
                      availableDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
                    });
                  }
                }
                router.push(action.route as any);
              }}
              style={styles.bentoItem}
            >
              <View style={styles.bentoIcon}>
                <action.icon color="#000" size={24} />
              </View>
              <Text style={styles.bentoLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
        </>
        )}
      </ScrollView>
    </View>
  </NebulaTransition>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  section: { paddingHorizontal: 20, paddingTop: 12 },
  progressCard: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 28 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 },
  planName: { fontSize: 14, fontWeight: '700', color: '#000' },
  progressBarContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  progressTrack: { flex: 1, height: 2, backgroundColor: '#F2F2F7', borderRadius: 1, marginRight: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#000' },
  progressPercent: { fontSize: 13, fontWeight: '900', color: '#000' },
  sessionBox: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
  nextLabel: { fontSize: 10, fontWeight: '800', color: '#8E8E93', letterSpacing: 1 },
  nextValue: { fontSize: 15, fontWeight: '600', color: '#000', marginTop: 4 },
  browseBtn: { marginTop: 20, height: 50, borderRadius: 14, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  browseBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  focusContainer: { paddingHorizontal: 20 },
  focusCard: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16, backgroundColor: '#FFFFFF' },
  focusIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  focusTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  focusSub: { fontSize: 13, color: '#8E8E93', marginTop: 2, fontWeight: '500' },
  exerciseCard: { width: 180, marginRight: 12, padding: 20, backgroundColor: '#FFFFFF' },
  exerciseName: { fontSize: 16, fontWeight: '800', color: '#000' },
  exerciseDetails: { fontSize: 13, color: '#8E8E93', marginTop: 4, fontWeight: '600' },
  muscleBadge: { marginTop: 12, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#F2F2F7', borderRadius: 6, alignSelf: 'flex-start' },
  muscleText: { fontSize: 10, fontWeight: '700', color: '#8E8E93' },
  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20 },
  bentoItem: { width: '48%', aspectRatio: 1, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderColor: '#F2F2F7', borderWidth: 1, justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  bentoIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  bentoLabel: { fontSize: 14, fontWeight: '800', color: '#000' },

  // Booked Machines Styles
  bookedMachinesContainer: { paddingHorizontal: 20, gap: 12 },
  machineCard: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 20 },
  machineCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  machineInfo: { flex: 1 },
  machineName: { fontSize: 16, fontWeight: '800', color: '#000', marginBottom: 4 },
  machineType: { fontSize: 12, color: '#8E8E93', fontWeight: '600' },
  statusBadgeConfirmed: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#2ECC71' },
  machineTimeBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7', borderBottomWidth: 1, borderBottomColor: '#F2F2F7', marginVertical: 12 },
  timeDetails: { flex: 1 },
  timeLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '600' },
  timeValue: { fontSize: 14, fontWeight: '700', color: '#000', marginTop: 2 },
  machineCoachBox: { marginVertical: 12, paddingHorizontal: 0 },
  coachLabel: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  coachName: { color: '#000', fontWeight: '700' },
  machineActionButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rescheduleBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderColor: nebulaGold.colors.gold.primary, alignItems: 'center' },
  rescheduleBtnText: { fontSize: 13, fontWeight: '700', color: nebulaGold.colors.gold.primary },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFE8E8', alignItems: 'center' },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#E74C3C' },

  // Notifications Styles
  notificationsContainer: { paddingHorizontal: 20, gap: 10 },
  notificationItem: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, borderLeftColor: '#F2F2F7' },
  notificationItemUnread: { borderLeftColor: nebulaGold.colors.gold.primary, backgroundColor: '#FFFBF0' },
  notificationIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 13, fontWeight: '700', color: '#000', marginBottom: 4 },
  notificationMessage: { fontSize: 12, color: '#8E8E93', fontWeight: '500', marginBottom: 6 },
  notificationTime: { fontSize: 10, color: '#C7C7CC', fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: nebulaGold.colors.gold.primary },

  // Empty State Styles
  emptyStateCard: { paddingVertical: 40, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  emptyStateContent: { alignItems: 'center', gap: 12 },
  emptyStateTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  emptyStateSubtitle: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
});

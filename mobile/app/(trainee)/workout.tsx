import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { StatBadge } from '../../src/components/nebula/StatBadge';
import { Dumbbell } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useApiCall } from '../../src/hooks/useApiCall';
import { workoutService } from '../../src/services/workoutService';
import { sessionService } from '../../src/services/sessionService';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { format, isSameDay, parseISO } from 'date-fns';
import { Lock } from 'lucide-react-native';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
// Map backend day strings to short UI days if needed
const mapDay = (backendDay: string) => backendDay.substring(0, 3).toUpperCase();

export default function TraineeWorkout() {
  const { user } = useAuthStore();
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

  const { data: plansData, loading: plansLoading, refreshing: plansRefreshing, refetch: refetchPlans } = useApiCall(
    () => workoutService.getForTrainee(user?.id?.toString() || ''),
    [user?.id]
  );

  const { data: sessionsData, loading: sessionsLoading, refetch: refetchSessions } = useApiCall(
    () => sessionService.getForTrainee(user?.id?.toString() || ''),
    [user?.id]
  );

  const refreshAction = async () => {
    await Promise.all([refetchPlans(), refetchSessions()]);
  };

  // Find if there is an accepted session today
  const todaySession = Array.isArray(sessionsData) 
    ? sessionsData.find((s: any) => 
        s.status === 'ACCEPTED' && 
        isSameDay(parseISO(s.sessionDate), new Date())
      )
    : null;

  // Derive which plan to show
  // If there's a todaySession with a workoutPlan, use it.
  const activeSessionPlan = todaySession?.workoutPlan;
  
  const plan = activeSessionPlan || (Array.isArray(plansData) ? plansData[0] : plansData);
  const days = plan?.days || plan?.workoutDays || []; // Handle both entity field names
  
  // Find the selected day's workout data
  const currentDayData = days.find((d: any) => mapDay(d.dayOfWeek) === activeDay);
  const exercises = currentDayData?.exercises || [];

  const loading = plansLoading || sessionsLoading;

  return (
    <View style={styles.container}>
      <ScreenHeader title={plan?.name || plan?.title || "My Workout Plan"} />
      
      {todaySession && (
        <View style={styles.sessionBanner}>
          <View style={styles.bannerRow}>
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerTitle}>Active Session Today</Text>
              <Text style={styles.bannerSubtitle}>Prescribed by {todaySession.coach.name}</Text>
            </View>
            {todaySession.machine && (
              <View style={styles.lockBadge}>
                <Lock size={12} color={nebulaGold.colors.gold.primary} />
                <Text style={styles.lockText}>Locked: {todaySession.machine.name}</Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Day Selector */}
      <View style={styles.daySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DAYS.map((day) => (
            <TouchableOpacity 
              key={day} 
              onPress={() => setActiveDay(day)}
              style={[
                styles.dayPill,
                activeDay === day && styles.activeDayPill
              ]}
            >
              <Text style={[
                styles.dayText,
                activeDay === day && styles.activeDayText
              ]}>{day}</Text>
            </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={nebulaGold.colors.gold.primary} />
          </View>
        ) : !plan ? (
          <View style={styles.emptyState}>
            <GlassCard style={{ padding: 20, marginHorizontal: 20, alignItems: 'center' }}>
              <Text style={[styles.emptySubtitle, { textAlign: 'center' }]}>
                No workout plan assigned yet. Your coach will set one up for you.
              </Text>
            </GlassCard>
          </View>
        ) : exercises.length > 0 ? (
          <FlatList
            data={exercises}
            keyExtractor={(item: any) => item.id?.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={plansRefreshing} onRefresh={refreshAction} tintColor={nebulaGold.colors.gold.primary} />}
            renderItem={({ item }) => (
              <GlassCard style={styles.exerciseCard}>
                <View style={styles.exerciseRow}>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <Text style={styles.exerciseDetails}>{item.sets} sets x {item.reps} reps</Text>
                  </View>
                  <StatBadge value={item.targetMuscle || 'General'} label="" />
              </View>
            </GlassCard>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Dumbbell color={nebulaGold.colors.gold.primary} size={48} opacity={0.5} />
          </View>
          <Text style={styles.emptyTitle}>Rest Day</Text>
          <Text style={styles.emptySubtitle}>Recovery is progress</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  daySelector: {
    paddingVertical: nebulaGold.spacing.lg,
    paddingLeft: nebulaGold.spacing.lg,
  },
  sessionBanner: {
    marginHorizontal: nebulaGold.spacing.lg,
    marginTop: nebulaGold.spacing.sm,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    ...nebulaGold.colors.shadow.light,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    ...nebulaGold.typography.label,
    color: '#000000',
    fontWeight: '800',
    fontSize: 14,
  },
  bannerSubtitle: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    marginTop: 2,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  lockText: {
    ...nebulaGold.typography.caption,
    color: '#000000',
    fontWeight: '700',
  },
  dayPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
  },
  activeDayPill: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  dayText: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    fontWeight: '700',
  },
  activeDayText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: nebulaGold.spacing.lg,
    paddingBottom: 20,
  },
  exerciseCard: {
    marginBottom: nebulaGold.spacing.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...nebulaGold.typography.heading3,
    color: nebulaGold.colors.text.primary,
  },
  exerciseDetails: {
    ...nebulaGold.typography.body,
    fontSize: 14,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    ...nebulaGold.typography.heading2,
    color: nebulaGold.colors.gold.primary,
  },
  emptySubtitle: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.text.secondary,
    marginTop: 8,
  },
});

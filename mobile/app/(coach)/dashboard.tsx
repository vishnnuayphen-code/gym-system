import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { SectionLabel } from '../../src/components/nebula/SectionLabel';
import { StatBadge } from '../../src/components/nebula/StatBadge';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import { GoldButton } from '../../src/components/nebula/GoldButton';
import { NebulaTransition } from '../../src/components/nebula/NebulaTransition';
import { useCoachAuth } from '../../src/hooks/useCoachAuth';
import { useApiCall } from '../../src/hooks/useApiCall';
import { coachService } from '../../src/services/coachService';
import { showToast } from '../../src/utils/toast';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { LogOut } from 'lucide-react-native';

export default function CoachDashboard() {
  const { coachId, name } = useCoachAuth();
  const { logout } = useAuthStore();
  const router = useRouter();
  const { data: dashboard, loading, error, refreshing, refetch } = useApiCall(
    () => coachService.getCoachDashboard(coachId),
    [coachId]
  );
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({});
  const [completing, setCompleting] = useState<string | null>(null);

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

  const handleMarkComplete = async (sessionId: string) => {
    setCompleting(sessionId);
    try {
      await coachService.updateSessionStatus(sessionId, 'COMPLETED', sessionNotes[sessionId]);
      showToast('Session marked as complete', 'success');
      refetch();
    } catch (e: any) {
      showToast(e?.message || 'Failed to update session', 'error');
    } finally {
      setCompleting(null);
    }
  };

  const todayLabel = format(new Date(), 'EEEE, MMMM d');

  return (
    <NebulaTransition>
      <View style={styles.container}>
        <ScreenHeader title="Coach Dashboard" subtitle={todayLabel} rightSlot={LogoutButton} />

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={nebulaGold.colors.gold.primary} size="large" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <GlassCard style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <GoldButton title="Retry" onPress={refetch} variant="ghost" style={styles.retryBtn} />
            </GlassCard>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refetch}
                tintColor={nebulaGold.colors.gold.primary}
              />
            }
          >
            {/* Stats Row */}
            <View style={styles.statRow}>
              <StatBadge value={dashboard?.todaySessions ?? 0} label="Today's Sessions" />
              <StatBadge value={dashboard?.activeTrainees ?? 0} label="Active Trainees" />
              <StatBadge value={dashboard?.pendingCheckins ?? 0} label="Pending Check-ins" />
            </View>

            {/* Upcoming Sessions */}
            <SectionLabel label="TODAY'S MISSIONS" />
            <View style={styles.section}>
              {(dashboard?.upcomingSessions?.length ?? 0) === 0 ? (
                <View style={styles.sessionCard}>
                  <Text style={styles.emptyText}>No active missions for today.</Text>
                </View>
              ) : (
                dashboard?.upcomingSessions?.map((session: any) => (
                  <View key={session.id} style={styles.sessionCard}>
                    <View style={styles.sessionTop}>
                      <AvatarRing size="sm" name={session.traineeName || session.trainee || 'T'} />
                      <View style={styles.sessionMain}>
                        <Text style={styles.traineeName}>{session.traineeName || session.trainee || 'Trainee'}</Text>
                        <Text style={styles.sessionTime}>
                          {session.startTime ? session.startTime.substring(0, 5) : session.sessionDate}
                        </Text>
                      </View>
                      <View style={getStatusBadgeStyle(session.status)}>
                        <Text style={styles.statusText}>{session.status || 'SCHEDULED'}</Text>
                      </View>
                    </View>

                    <TextInput
                      placeholder="Session notes..."
                      placeholderTextColor={nebulaGold.colors.text.secondary}
                      style={styles.notesInput}
                      multiline
                      value={sessionNotes[session.id] ?? (session.notes || '')}
                      onChangeText={(t) => setSessionNotes(prev => ({ ...prev, [session.id]: t }))}
                    />

                    <GoldButton
                      title={
                        completing === String(session.id)
                          ? 'Saving...'
                          : session.status === 'COMPLETED'
                          ? '✓ Completed'
                          : 'Mark Complete'
                      }
                      onPress={() => handleMarkComplete(String(session.id))}
                      variant={session.status === 'COMPLETED' ? 'ghost' : 'outline'}
                      style={styles.completeButton}
                    />
                  </View>
                ))
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </NebulaTransition>
  );
}

function getStatusBadgeStyle(status: string) {
  const colorMap: Record<string, string> = {
    SCHEDULED: nebulaGold.colors.accent.blue,
    IN_PROGRESS: nebulaGold.colors.gold.primary,
    COMPLETED: nebulaGold.colors.status.active,
    CANCELLED: nebulaGold.colors.status.danger,
  };
  return {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: `${colorMap[status] || nebulaGold.colors.accent.blue}22`,
    borderWidth: 1,
    borderColor: colorMap[status] || nebulaGold.colors.accent.blue,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    padding: nebulaGold.spacing.lg,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: nebulaGold.colors.status.danger,
    borderRadius: 16,
    padding: 16,
    ...nebulaGold.colors.shadow.light,
  },
  errorText: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.status.danger,
  },
  retryBtn: { marginTop: 12, height: 40 },
  scrollContent: { paddingBottom: 20 },
  statRow: {
    flexDirection: 'row',
    paddingHorizontal: nebulaGold.spacing.lg,
    paddingTop: nebulaGold.spacing.lg,
    gap: 8,
  },
  section: {
    paddingHorizontal: nebulaGold.spacing.lg,
  },
  sessionCard: { 
    marginBottom: nebulaGold.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    ...nebulaGold.colors.shadow.light,
  },
  sessionTop: { flexDirection: 'row', alignItems: 'center' },
  sessionMain: { flex: 1, marginLeft: 12 },
  traineeName: {
    ...nebulaGold.typography.heading3,
    fontSize: 16,
    color: nebulaGold.colors.text.primary,
  },
  sessionTime: { 
    ...nebulaGold.typography.caption, 
    color: nebulaGold.colors.text.secondary,
    marginTop: 2 
  },
  statusText: { ...nebulaGold.typography.caption, fontWeight: '700' },
  notesInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: nebulaGold.borderRadius.md,
    padding: 12,
    marginTop: 16,
    color: nebulaGold.colors.text.primary,
    ...nebulaGold.typography.body,
    fontSize: 13,
    height: 60,
    textAlignVertical: 'top',
  },
  completeButton: { marginTop: 12, height: 40 },
  emptyText: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.text.secondary,
    textAlign: 'center',
  },
});

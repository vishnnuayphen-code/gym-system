import React, { useState } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import { StatBadge } from '../../src/components/nebula/StatBadge';
import { GoldButton } from '../../src/components/nebula/GoldButton';
import { useAuthStore } from '../../store/authStore';
import { useApiCall } from '../../src/hooks/useApiCall';
import { sessionService } from '../../src/services/sessionService';
import { dashboardService } from '../../src/services/dashboardService';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { Dumbbell, Calendar, Clock, ChevronRight, XCircle } from 'lucide-react-native';
import { useBookingStore } from '../../src/stores/bookingStore';

export default function TraineeSessions() {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming');
  const router = useRouter();
  const { user } = useAuthStore();
  const { setCoach, reset } = useBookingStore();
  
  const { data: dashboard } = useApiCall(
    () => dashboardService.getTraineeDashboard(user?.id?.toString() || ''),
    [user?.id]
  );
  
  const { data: sessions, loading, refreshing, refetch } = useApiCall(
    () => sessionService.getForTrainee(user?.id?.toString() || ''),
    [user?.id]
  );

  const upcomingSessions = (sessions || []).filter((s: any) => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS' || s.status === 'PENDING' || s.status === 'ACCEPTED');
  const pastSessions = (sessions || []).filter((s: any) => s.status === 'COMPLETED' || s.status === 'CANCELLED' || s.status === 'REJECTED' || s.status === 'MISSED');
  const displaySessions = activeTab === 'Upcoming' ? upcomingSessions : pastSessions;

  const handleCancel = (sessionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Cancel Session",
      "Are you sure you want to cancel this session? You can only cancel up to 2 hours before the start time.",
      [
        { text: "No, Keep it", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              await sessionService.delete(sessionId);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Cancelled", "Your session has been cancelled.");
              refetch();
            } catch (error) {
              Alert.alert("Error", "Could not cancel session. Please try again.");
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)' };
      case 'REJECTED': return { color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.15)' };
      case 'CANCELLED': return { color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.15)' };
      case 'COMPLETED': return { color: '#34C759', bg: 'rgba(52, 199, 89, 0.15)' };
      default: return { color: nebulaGold.colors.gold.primary, bg: 'rgba(201, 168, 76, 0.15)' };
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Sessions" />
      
      {/* Tab Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          onPress={() => setActiveTab('Upcoming')}
          style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('Past')}
          style={[styles.tab, activeTab === 'Past' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'Past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : displaySessions.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
          <Text style={{ color: nebulaGold.colors.text.secondary, ...nebulaGold.typography.body }}>
            No {activeTab.toLowerCase()} sessions found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displaySessions}
          keyExtractor={(item: any) => item.id?.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={nebulaGold.colors.gold.primary} />}
          renderItem={({ item }) => (
            <GlassCard 
              style={styles.sessionCard} 
              onPress={() => activeTab === 'Upcoming' && handleCancel(item.id)}
            >
              <View style={styles.sessionInfo}>
                <AvatarRing size="md" name={item.coachName || item.coach?.name || 'Gym'} imageUri={item.coach?.profilePhotoUrl} />
                <View style={styles.details}>
                  <Text style={styles.coachName}>{item.coachName || item.coach?.name || 'Gym Access'}</Text>
                  <Text style={styles.dateTime}>{new Date(item.sessionDate || item.date).toLocaleDateString()} | {item.startTime?.substring(0, 5)}</Text>
                  <Text style={styles.typeText}>{item.sessionType || item.type || 'Personal'} Training</Text>
                </View>
                <StatBadge 
                  value={item.status} 
                  label="" 
                  color={getStatusColor(item.status).color}
                  backgroundColor={getStatusColor(item.status).bg}
                />
              </View>

              {/* Machine Booking Action */}
              {activeTab === 'Upcoming' && (
                <View style={styles.actionContainer}>
                  {item.machineName ? (
                    <View style={styles.machineInfo}>
                      <Dumbbell size={14} color={nebulaGold.colors.gold.primary} />
                      <Text style={styles.machineText}>{item.machineName}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => router.push({
                        pathname: '/(drawer)/machines',
                        params: { bookingSessionId: item.id }
                      })}
                      style={styles.bookBtn}
                    >
                      <Dumbbell size={14} color={nebulaGold.colors.gold.primary} />
                      <Text style={styles.bookBtnText}>Book Machine</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.cancelHint}>Tap card to cancel</Text>
                </View>
              )}
            </GlassCard>
          )}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.bookActionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            reset();
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
            router.push('/(trainee)/booking');
          }}
        >
          <Text style={styles.bookActionBtnText}>Book New Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, marginRight: 8 },
  activeTab: { backgroundColor: '#000' },
  tabText: { fontSize: 13, fontWeight: '800', color: '#8E8E93' },
  activeTabText: { color: '#FFF' },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  sessionCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  sessionInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  details: { flex: 1 },
  coachName: { fontSize: 18, fontWeight: '900', color: '#000' },
  dateTime: { fontSize: 12, fontWeight: '700', color: '#8E8E93', marginTop: 4 },
  typeText: { fontSize: 11, fontWeight: '800', color: '#000', marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  actionContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F2F2F7', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  machineInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  machineText: { fontSize: 11, fontWeight: '800', color: '#34C759' },
  bookBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  bookBtnText: { fontSize: 11, fontWeight: '800', color: '#000' },
  cancelHint: { fontSize: 10, fontWeight: '800', color: '#FF3B30', textTransform: 'uppercase' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20, backgroundColor: 'rgba(255,255,255,0.95)' },
  bookActionBtn: { height: 56, backgroundColor: '#000', borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  bookActionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 }
});

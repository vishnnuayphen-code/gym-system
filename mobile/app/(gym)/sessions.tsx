import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Plus } from 'lucide-react-native';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import { StatBadge } from '../../src/components/nebula/StatBadge';
import { useApiCall } from '../../src/hooks/useApiCall';
import { sessionService } from '../../src/services/sessionService';
import { CreateSessionModal } from '../../src/components/admin/CreateSessionModal';
import * as Haptics from 'expo-haptics';

export default function GymAdminSessions() {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const { data: sessions, loading, refreshing, refetch } = useApiCall(
    () => sessionService.getAll(), []
  );

  const displaySessions = (sessions || []).filter((s: any) => {
    if (activeTab === 'Upcoming') {
      return s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS';
    } else {
      return s.status === 'COMPLETED' || s.status === 'CANCELLED';
    }
  });

  const handleCancel = (sessionId: string) => {
    Alert.alert(
      "Cancel Session",
      "Are you sure you want to cancel this session?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              await sessionService.delete(sessionId);
              Alert.alert("Cancelled", "Session has been cancelled.");
              refetch();
            } catch (error) {
              Alert.alert("Error", "Could not cancel session.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="All Sessions" 
        rightSlot={
          <TouchableOpacity 
            onPress={() => {
              setCreateModalVisible(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Plus size={24} color={nebulaGold.colors.gold.primary} />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('Upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Past' && styles.activeTab]}
          onPress={() => setActiveTab('Past')}
        >
          <Text style={[styles.tabText, activeTab === 'Past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={nebulaGold.colors.gold.primary} />
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
                <AvatarRing size="md" name={item.trainee?.name || 'Trainee'} imageUri={item.trainee?.profilePhotoUrl} />
                <View style={styles.details}>
                  <Text style={styles.coachName}>{item.trainee?.name || 'Unknown Trainee'}</Text>
                  <Text style={styles.dateTime}>Coach: {item.coach?.name || 'Unassigned'}</Text>
                  <Text style={styles.typeText}>{new Date(item.sessionDate || item.date).toLocaleDateString()} | {item.startTime?.substring(0, 5)}</Text>
                </View>
                <StatBadge value={item.status} label="" />
              </View>
              {activeTab === 'Upcoming' && (
                <Text style={styles.cancelHint}>Tap to switch status / cancel</Text>
              )}
            </GlassCard>
          )}
        />
      )}

      <CreateSessionModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          refetch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: nebulaGold.colors.background.primary },
  tabContainer: { flexDirection: 'row', paddingHorizontal: nebulaGold.spacing.lg, marginBottom: nebulaGold.spacing.md },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: nebulaGold.colors.gold.primary },
  tabText: { ...nebulaGold.typography.label, color: nebulaGold.colors.text.secondary },
  activeTabText: { color: nebulaGold.colors.gold.primary },
  listContent: { paddingHorizontal: nebulaGold.spacing.lg, paddingBottom: 100 },
  sessionCard: { padding: 16, marginBottom: 12 },
  sessionInfo: { flexDirection: 'row', alignItems: 'center' },
  details: { flex: 1, marginLeft: 16 },
  coachName: { ...nebulaGold.typography.heading3, color: nebulaGold.colors.text.primary },
  dateTime: { ...nebulaGold.typography.caption, color: nebulaGold.colors.text.secondary, marginTop: 4 },
  typeText: { ...nebulaGold.typography.label, color: nebulaGold.colors.gold.primary, marginTop: 4 },
  cancelHint: { ...nebulaGold.typography.caption, color: nebulaGold.colors.status.danger, textAlign: 'center', marginTop: 12, opacity: 0.8 },
});

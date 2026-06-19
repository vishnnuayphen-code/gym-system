import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Briefcase, ChevronRight, ChevronDown, UserPlus, Info, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { SectionLabel } from '../../src/components/nebula/SectionLabel';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import { coachService, CoachWorkload, AssignedTraineeSummary } from '../../src/services/coachService';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { useApiCall } from '../../src/hooks/useApiCall';
import { AssignCoachModal } from '../../src/components/admin/AssignCoachModal';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

/**
 * Peak White Color Palette for Workload Status
 */
const WORKLOAD_COLORS: any = {
  UNASSIGNED: '#8E8E93',
  LOW: '#34C759',
  MEDIUM: '#FF9500',
  HIGH: '#FF3B30',
  OVERLOADED: '#AF52DE'
};

const WORKLOAD_LABELS: any = {
  UNASSIGNED: 'Unassigned',
  LOW: 'Optimal',
  MEDIUM: 'Moderate',
  HIGH: 'High Load',
  OVERLOADED: 'Overloaded'
};

/**
 * TripGlide Coach Workload - Fully refactored to light theme.
 */
export default function CoachWorkloadScreen() {
  const router = useRouter();
  const [expandedCoachId, setExpandedCoachId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<{ visible: boolean, coachId: string | null }>({
    visible: false,
    coachId: null
  });

  const { data: workloads, loading, error, refreshing, refetch } = useApiCall(
    () => coachService.getWorkload(), []
  );

  const filteredWorkloads = workloads?.filter(w => !filter || w.workloadLevel === filter) || [];

  const stats = {
    totalCoaches: workloads?.length || 0,
    totalAssigned: workloads?.reduce((sum, w) => sum + (w.traineeCount || 0), 0) || 0,
    overloadedCount: workloads?.filter(w => w.workloadLevel === 'OVERLOADED').length || 0,
    avgWorkload: workloads?.length ? (workloads.reduce((sum, w) => sum + (w.traineeCount || 0), 0) / workloads.length).toFixed(1) : '0'
  };

  const handleExpand = (id: string) => {
    if (expandedCoachId === id) {
      setExpandedCoachId(null);
    } else {
      setExpandedCoachId(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const openAssignModal = (coachId: string) => {
    setAssignModal({ visible: true, coachId });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Coach Workload" 
        subtitle="Capacity & Assignment Overview" 
        showBack={true}
        onBackPress={() => router.push('/(gym)/dashboard')}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor="#000000" />}
      >
        {error && (
          <View style={styles.errorContainer}>
            <AlertTriangle size={24} color="#FF3B30" />
            <View style={{ flex: 1 }}>
              <Text style={styles.errorTitle}>Failed to load workload data</Text>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Summary Stats Grid */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <StatCard label="Total Coaches" value={stats.totalCoaches.toString()} icon={<Briefcase size={20} color="#000000" />} />
            <StatCard label="Assigned Trainees" value={stats.totalAssigned.toString()} icon={<Users size={20} color="#000000" />} />
          </View>
          <View style={styles.summaryRow}>
            <StatCard label="Avg. Workload" value={stats.avgWorkload} icon={<Info size={20} color="#000000" />} />
            <StatCard 
              label="Overloaded" 
              value={stats.overloadedCount.toString()} 
              icon={<AlertTriangle size={20} color={stats.overloadedCount > 0 ? '#FF3B30' : '#000000'} />} 
            />
          </View>
        </View>

        {/* Workload Distribution Strip */}
        <SectionLabel label="DISTRIBUTION" style={{ marginTop: 24, marginBottom: 12 }} />
        <View style={styles.distributionBar}>
          {['LOW', 'MEDIUM', 'HIGH', 'OVERLOADED'].map(level => {
            const count = workloads?.filter(w => w.workloadLevel === level).length || 0;
            const flex = count > 0 ? count : 0.05;
            return (
              <View 
                key={level} 
                style={[styles.distributionSegment, { flex, backgroundColor: WORKLOAD_COLORS[level], opacity: count > 0 ? 1 : 0.1 }]} 
              />
            );
          })}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <FilterPill label="All" active={filter === null} onPress={() => setFilter(null)} />
          {Object.keys(WORKLOAD_LABELS).map(level => (
            <FilterPill 
              key={level} 
              label={WORKLOAD_LABELS[level]} 
              active={filter === level} 
              onPress={() => setFilter(level)} 
              dotColor={WORKLOAD_COLORS[level]}
            />
          ))}
        </ScrollView>

        {/* Coach List */}
        <SectionLabel label={`Coaches (${filteredWorkloads.length})`} style={{ marginBottom: 16 }} />
        {filteredWorkloads.map(coach => (
          <CoachWorkloadCard 
            key={coach.coachId}
            coach={coach}
            isExpanded={expandedCoachId === coach.coachId}
            onToggle={() => handleExpand(coach.coachId)}
            onAssign={() => openAssignModal(coach.coachId)}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AssignCoachModal
        visible={assignModal.visible}
        preselectedCoachId={assignModal.coachId || undefined}
        onClose={() => setAssignModal({ visible: false, coachId: null })}
        onSuccess={() => {
          setAssignModal({ visible: false, coachId: null });
          refetch();
        }}
      />
    </View>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <View style={[styles.statCard, nebulaGold.colors.shadow.light]}>
      <View style={styles.statIconContainer}>{icon}</View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function FilterPill({ label, active, onPress, dotColor }: { label: string, active: boolean, onPress: () => void, dotColor?: string }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.filterPill, active && styles.filterPillActive]}
    >
      {dotColor && <View style={[styles.filterDot, { backgroundColor: dotColor }]} />}
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function CoachWorkloadCard({ coach, isExpanded, onToggle, onAssign }: { coach: CoachWorkload, isExpanded: boolean, onToggle: () => void, onAssign: () => void }) {
  return (
    <GlassCard style={styles.coachCard} onPress={onToggle}>
      <View style={styles.coachHeader}>
        <AvatarRing size="md" name={coach.coachName} imageUri={coach.coachPhotoUrl || undefined} />
        <View style={styles.coachInfo}>
          <Text style={styles.coachName}>{coach.coachName}</Text>
          <Text style={styles.coachSpecialty}>{coach.specialization || 'General Trainer'}</Text>
        </View>
        <View style={[styles.workloadStatus, { backgroundColor: WORKLOAD_COLORS[coach.workloadLevel] + '15' }]}>
          <View style={[styles.workloadDot, { backgroundColor: WORKLOAD_COLORS[coach.workloadLevel] }]} />
          <Text style={[styles.workloadText, { color: WORKLOAD_COLORS[coach.workloadLevel] }]}>
            {WORKLOAD_LABELS[coach.workloadLevel]}
          </Text>
        </View>
      </View>

      <View style={styles.coachStats}>
        <CoachMiniStat label="Members" value={coach.traineeCount.toString()} />
        <CoachMiniStat label="PT Only" value={coach.personalTraineeCount.toString()} />
        <CoachMiniStat label="Upcoming" value={coach.upcomingSessionCount.toString()} />
        <TouchableOpacity style={styles.expandButton} onPress={onToggle}>
          <ChevronDown size={20} color={isExpanded ? "#000000" : "#8E8E93"} style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <View style={styles.expandedHeader}>
            <Text style={styles.assignedLabel}>Assigned Members</Text>
            <TouchableOpacity style={styles.assignShortButton} onPress={onAssign}>
              <UserPlus size={14} color="#000000" />
              <Text style={styles.assignShortText}>Assign</Text>
            </TouchableOpacity>
          </View>
          
          {coach.assignedTrainees.length === 0 ? (
            <Text style={styles.noTraineesText}>No members assigned yet</Text>
          ) : (
            coach.assignedTrainees.map(trainee => (
              <TraineeRow key={trainee.traineeId} trainee={trainee} />
            ))
          )}
        </View>
      )}
    </GlassCard>
  );
}

function CoachMiniStat({ label, value }: { label: string, value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function TraineeRow({ trainee }: { trainee: AssignedTraineeSummary }) {
  const statusColor = trainee.membershipStatus === 'ACTIVE' ? '#34C759' : (trainee.membershipStatus === 'EXPIRING' ? '#FF9500' : '#FF3B30');
  
  return (
    <View style={styles.traineeRow}>
      <AvatarRing size="xs" name={trainee.traineeName} imageUri={trainee.traineePhotoUrl || undefined} />
      <View style={styles.traineeInfo}>
        <Text style={styles.traineeNameText}>{trainee.traineeName}</Text>
        <Text style={styles.traineeTime}>{trainee.preferredTime || 'Flexible'}</Text>
      </View>
      <View style={styles.traineeSessions}>
        <Text style={styles.traineeSessionNum}>{trainee.upcomingSessions}</Text>
        <Text style={styles.traineeSessionLabel}>sessions</Text>
      </View>
      <View style={[styles.traineeStatusBadge, { borderColor: statusColor + '40', backgroundColor: statusColor + '10' }]}>
        <Text style={[styles.traineeStatusText, { color: statusColor }]}>{trainee.membershipStatus}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFEBEA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD7D5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF3B30',
  },
  errorMessage: {
    fontSize: 12,
    color: '#FF3B30',
    opacity: 0.8,
    marginTop: 2,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryContainer: {
    paddingTop: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 2,
  },
  distributionBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EBEBF0',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  distributionSegment: {
    height: '100%',
  },
  filterScroll: {
    gap: 10,
    marginVertical: 20,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: nebulaGold.colors.background.secondary,
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  filterPillActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  coachCard: {
    marginBottom: 16,
    width: '100%',
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachInfo: {
    flex: 1,
    marginLeft: 12,
  },
  coachName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
  },
  coachSpecialty: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  workloadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  workloadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  workloadText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  coachStats: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    alignItems: 'center',
  },
  miniStat: {
    flex: 1,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
  miniStatLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 2,
  },
  expandButton: {
    padding: 6,
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginBottom: 16,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  assignedLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    opacity: 0.9,
  },
  assignShortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  assignShortText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  noTraineesText: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
    backgroundColor: '#F9F9FB',
    borderRadius: 16,
  },
  traineeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F9F9FB',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  traineeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  traineeNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  traineeTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 1,
  },
  traineeSessions: {
    alignItems: 'center',
    marginRight: 12,
  },
  traineeSessionNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
  traineeSessionLabel: {
    fontSize: 8,
    color: '#8E8E93',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  traineeStatusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    width: 80,
    alignItems: 'center',
  },
  traineeStatusText: {
    fontSize: 9,
    fontWeight: '800',
  }
});

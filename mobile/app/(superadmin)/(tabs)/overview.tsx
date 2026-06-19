import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, ActivityIndicator, RefreshControl, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { nebulaGold } from '../../../src/theme/nebulaGold';
import { ScreenHeader } from '../../../src/components/nebula/ScreenHeader';
import { AvatarRing } from '../../../src/components/nebula/AvatarRing';
import {
  Shield, Users, Briefcase, TrendingUp, LogOut, Mail, Calendar, ArrowUpRight, PlusCircle, Building2
} from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { useApiCall } from '../../../src/hooks/useApiCall';
import { superAdminService } from '../../../src/services/superAdminService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=2070&auto=format&fit=crop';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 24;
const GRID_GAP = 16;
const STAT_CARD_WIDTH = (SCREEN_WIDTH - (GRID_PADDING * 2) - GRID_GAP) / 2;

export default function SuperAdminOverview() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  const { data: dashboard, loading: dashboardLoading, refreshing, refetch } = useApiCall(
    () => superAdminService.getDashboardStats(), []
  );

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    router.replace('/(auth)/login');
  };

  const UserAvatar = (
    <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.avatarButton}>
      <AvatarRing
        size="sm"
        name={user?.name || 'Super Admin'}
        imageUri={user?.profilePhotoUrl}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`Hello, ${user?.name?.split(' ')[0] || 'Admin'}`}
        subtitle="Global Platform Command"
        rightSlot={UserAvatar}
        transparent={false}
      />

      {/* Profile Dropdown Modal */}
      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.dropdownMenu, { top: insets.top + 60 }, nebulaGold.colors.shadow.light]}>
                <View style={styles.menuHeader}>
                  <View style={styles.menuAvatarLarge}>
                    <Text style={styles.menuAvatarText}>{user?.name?.charAt(0).toUpperCase() || 'S'}</Text>
                  </View>
                  <View style={styles.menuTitleColumn}>
                    <Text style={styles.menuName}>{user?.name || 'Super Admin'}</Text>
                    <View style={styles.menuEmailRow}>
                      <Mail size={12} color="#8E8E93" />
                      <Text style={styles.menuEmail}>{user?.email || 'admin@platform.com'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.menuDivider} />
                <View style={styles.menuItem}>
                  <Shield size={18} color="#000000" />
                  <View style={styles.menuItemTextCol}>
                    <Text style={styles.menuItemLabel}>Role</Text>
                    <Text style={styles.menuItemValue}>Platform Super Admin</Text>
                  </View>
                </View>

                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <LogOut size={18} color="#FF3B30" />
                  <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor="#000000" />}
      >
        {dashboardLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#000000" />
          </View>
        ) : (
          <View style={styles.mainContent}>
            
            {/* Hero Dynamic Banner */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.heroCardContainer}
              onPress={() => router.push('/(superadmin)/gyms' as any)}
            >
              <View style={[styles.heroCard, nebulaGold.colors.shadow.light]}>
                <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.heroOverlay}>
                  <View style={styles.heroHeader}>
                    <Text style={styles.heroLabel}>PLATFORM HEALTH</Text>
                    <View style={styles.heartCircle}>
                      <Building2 color="#000000" size={16} />
                    </View>
                  </View>
                  <View style={styles.heroFooter}>
                    <View>
                      <Text style={styles.heroTitle}>{(dashboard as any)?.totalGyms || 0} Active Gyms</Text>
                      <View style={styles.heroSubRow}>
                        <TrendingUp color="#34C759" size={14} />
                        <Text style={styles.heroSubtext}>Platform growing steadily</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Financial Performance */}
            <View style={[styles.revenueCard, nebulaGold.colors.shadow.light]}>
              <View style={styles.revenueHeader}>
                <Text style={styles.revenueLabel}>GLOBAL REVENUE (EST)</Text>
                <ArrowUpRight color="#34C759" size={18} />
              </View>
              <Text style={styles.revenueValue}>{(dashboard as any)?.monthlyRevenue || '$0'}</Text>
              <View style={styles.systemStatusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>All Systems Operational</Text>
              </View>
            </View>

            {/* Symmetric Statistics Grid */}
            <View style={styles.statsGrid}>
              {[
                { label: 'Total Tenants', value: (dashboard as any)?.totalGyms || 0, icon: <Building2 color="#000000" size={18} /> },
                { label: 'Total Members', value: (dashboard as any)?.totalMembers || 0, icon: <Users color="#007AFF" size={18} /> },
                { label: 'Total Coaches', value: (dashboard as any)?.totalCoaches || 0, icon: <Briefcase color="#1A1AFF" size={18} /> },
                { label: 'System Uptime', value: '99.9%', icon: <Shield color="#34C759" size={18} /> },
              ].map((stat, i) => (
                <View key={stat.label} style={[styles.statCard, nebulaGold.colors.shadow.light]}>
                  <View style={styles.statIconHeader}>
                    {stat.icon}
                    <Text style={styles.statValueText}>{stat.value}</Text>
                  </View>
                  <Text style={styles.statLabelText}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Clean Management Row */}
            <View style={styles.actionSectionV3}>
              <Text style={styles.sectionTitleV3}>Platform Actions</Text>
              <View style={styles.actionRowV3}>
                {[
                  { label: 'Add Gym', icon: <PlusCircle color="#000" size={22} />, route: '/(superadmin)/gyms?add=true' },
                  { label: 'Tenants', icon: <Building2 color="#000" size={22} />, route: '/(superadmin)/gyms' },
                  { label: 'Members', icon: <Users color="#000" size={22} />, route: '/(superadmin)/members' },
                  { label: 'Coaches', icon: <Briefcase color="#000" size={22} />, route: '/(superadmin)/coaches' },
                ].map((action, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.actionBtnV3} 
                    onPress={() => router.push(action.route as any)}
                  >
                    <View style={styles.actionIconSurfaceV3}>
                      {action.icon}
                    </View>
                    <Text style={styles.actionLabelV3} numberOfLines={1}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Gyms Activity Feed */}
            <View style={styles.activitySection}>
              <Text style={styles.sectionTitleV3}>Recently Onboarded Gyms</Text>
              <View style={[styles.activityList, nebulaGold.colors.shadow.light]}>
                {((dashboard as any)?.recentGyms || []).length > 0 ? (
                  (dashboard as any).recentGyms.map((gym: any, i: number) => (
                    <View key={i} style={[styles.activityItem, i === (dashboard as any).recentGyms.length - 1 && { borderBottomWidth: 0 }]}>
                      <View style={styles.activityDot} />
                      <View style={styles.activityContent}>
                        <Text style={styles.activityText}>{gym.name}</Text>
                        <Text style={styles.activityTime}>{gym.address} • {new Date(gym.createdAt).toLocaleDateString()}</Text>
                      </View>
                      <View style={gym.isActive ? styles.badgeActive : styles.badgeInactive}>
                        <Text style={gym.isActive ? styles.badgeTextActive : styles.badgeTextInactive}>
                          {gym.isActive ? 'Active' : 'Suspended'}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No gyms registered yet.</Text>
                )}
              </View>
            </View>

          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: nebulaGold.colors.background.primary },
  scrollContent: { paddingTop: 8 },
  avatarButton: { padding: 2 },
  loader: { paddingTop: 100, alignItems: 'center' },
  mainContent: { paddingHorizontal: GRID_PADDING, marginTop: 0 },
  
  heroCardContainer: { width: '100%', height: 160, marginBottom: 8 },
  heroCard: { flex: 1, borderRadius: 20, backgroundColor: nebulaGold.colors.background.secondary, overflow: 'hidden' },
  heroImage: { ...StyleSheet.absoluteFillObject, opacity: 0.95 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)', padding: 12, justifyContent: 'space-between' },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  heartCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  heroFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  heroSubtext: { color: '#FFFFFF', fontSize: 10, fontWeight: '600', opacity: 0.9 },

  revenueCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#F2F2F7' },
  revenueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  revenueLabel: { fontSize: 9, fontWeight: '800', color: '#8E8E93', letterSpacing: 1 },
  revenueValue: { fontSize: 26, fontWeight: '800', color: '#000000', marginBottom: 4 },
  systemStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' },
  statusText: { fontSize: 10, color: '#8E8E93', fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: STAT_CARD_WIDTH, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 10, height: 75, justifyContent: 'center', borderWidth: 1, borderColor: '#F2F2F7' },
  statIconHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  statValueText: { fontSize: 18, fontWeight: '800', color: '#000000' },
  statLabelText: { fontSize: 10, color: '#8E8E93', fontWeight: '700' },

  actionSectionV3: { marginBottom: 20 },
  sectionTitleV3: { fontSize: 16, fontWeight: '800', color: '#000000', marginBottom: 10 },
  actionRowV3: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionBtnV3: { alignItems: 'center', width: 75 },
  actionIconSurfaceV3: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 1, borderColor: '#F2F2F7' },
  actionLabelV3: { fontSize: 10, fontWeight: '800', color: '#000000', textAlign: 'center' },

  activitySection: { marginBottom: 20 },
  activityList: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 4, borderWidth: 1, borderColor: '#F2F2F7' },
  activityItem: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', alignItems: 'center', gap: 12 },
  activityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#007AFF' },
  activityContent: { flex: 1 },
  activityText: { fontSize: 12, fontWeight: '800', color: '#000000', marginBottom: 2 },
  activityTime: { fontSize: 10, color: '#8E8E93', fontWeight: '600' },
  emptyText: { padding: 14, textAlign: 'center', color: '#8E8E93', fontWeight: '600', fontSize: 12 },

  badgeActive: { backgroundColor: '#34C75915', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeTextActive: { color: '#34C759', fontSize: 10, fontWeight: '800' },
  badgeInactive: { backgroundColor: '#FF3B3015', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeTextInactive: { color: '#FF3B30', fontSize: 10, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'transparent' },
  dropdownMenu: { position: 'absolute', right: 20, width: 260, backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 12, borderWidth: 1, borderColor: '#F2F2F7' },
  menuHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  menuAvatarLarge: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EBEBF0' },
  menuAvatarText: { fontSize: 18, fontWeight: '800', color: '#000000' },
  menuTitleColumn: { flex: 1 },
  menuName: { fontSize: 16, fontWeight: '800', color: '#000000' },
  menuEmailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  menuEmail: { fontSize: 11, color: '#8E8E93', fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  menuItemTextCol: { flex: 1 },
  menuItemLabel: { fontSize: 10, color: '#8E8E93', fontWeight: '700', textTransform: 'uppercase' },
  menuItemValue: { fontSize: 13, color: '#000000', fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  logoutText: { fontSize: 14, fontWeight: '800', color: '#FF3B30' }
});

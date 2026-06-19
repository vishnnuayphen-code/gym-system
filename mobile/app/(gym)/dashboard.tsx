import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Alert, Image, Dimensions, Modal, TouchableWithoutFeedback, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../lib/api';
import {
  UserPlus, UserCheck, Calendar, Search, SlidersHorizontal,
  ChevronRight, ArrowUpRight, TrendingUp, Users, Briefcase, PlusCircle, ClipboardList,
  LogOut, Mail, Shield
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useApiCall } from '../../src/hooks/useApiCall';
import { dashboardService } from '../../src/services/dashboardService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 24;
const GRID_GAP = 16;
const STAT_CARD_WIDTH = (SCREEN_WIDTH - (GRID_PADDING * 2) - GRID_GAP) / 2;

/**
 * TripGlide Dashboard V2 - Informational Stats & Task-Oriented Actions.
 */
export default function GymAdminDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [gymName, setGymName] = useState('');
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [showOpeningTimePicker, setShowOpeningTimePicker] = useState(false);
  const [showClosingTimePicker, setShowClosingTimePicker] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  useEffect(() => {
    if (settingsVisible) {
      fetchSettings();
    }
  }, [settingsVisible]);

  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const response = await api.get('/gym/settings');
      if (response.data) {
        setGymName(response.data.name || '');
        setOpeningTime(response.data.openingTime ? response.data.openingTime.substring(0, 5) : '06:00');
        setClosingTime(response.data.closingTime ? response.data.closingTime.substring(0, 5) : '22:00');
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
      Alert.alert("Error", "Could not load gym settings.");
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const response = await api.put('/gym/settings', {
        name: gymName,
        openingTime: openingTime.length === 5 ? `${openingTime}:00` : openingTime,
        closingTime: closingTime.length === 5 ? `${closingTime}:00` : closingTime,
      });
      if (response.data) {
        Alert.alert("Success", "Gym settings updated successfully!");
        setSettingsVisible(false);
        refetch();
      }
    } catch (error) {
      console.error("Failed to update settings", error);
      Alert.alert("Error", "Could not save gym settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };
  
  const { data: dashboard, loading: dashboardLoading, refreshing, refetch } = useApiCall(
    () => dashboardService.getOwnerDashboard(), []
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
        name={user?.name || 'User'}
        imageUri={user?.profilePhotoUrl}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`Hello, ${user?.name?.split(' ')[0] || 'VISHNNU'}`}
        subtitle="Welcome to your Gym Cloud"
        rightSlot={UserAvatar}
        transparent={false}
      />

      {/* Profile Dropdown Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.dropdownMenu, { top: insets.top + 60 }, nebulaGold.colors.shadow.light]}>
                {/* User Info Header */}
                <View style={styles.menuHeader}>
                  <View style={styles.menuAvatarLarge}>
                    <Text style={styles.menuAvatarText}>{user?.name?.charAt(0).toUpperCase() || 'V'}</Text>
                  </View>
                  <View style={styles.menuTitleColumn}>
                    <Text style={styles.menuName}>{user?.name || 'VISHNNU'}</Text>
                    <View style={styles.menuEmailRow}>
                      <Mail size={12} color="#8E8E93" />
                      <Text style={styles.menuEmail}>{user?.email || 'admin@gymcloud.com'}</Text>
                    </View>
                  </View>
                </View>

                {/* Role Status */}
                <View style={styles.menuDivider} />
                <View style={styles.menuItem}>
                  <Shield size={18} color="#000000" />
                  <View style={styles.menuItemTextCol}>
                    <Text style={styles.menuItemLabel}>Role</Text>
                    <Text style={styles.menuItemValue}>
                      {user?.role === 'OWNER' ? 'Gym Owner' : user?.role === 'ADMIN' ? 'Admin' : (user?.role || 'Administrator')}
                    </Text>
                  </View>
                </View>

                {/* Gym Settings */}
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    setSettingsVisible(true);
                  }}
                >
                  <SlidersHorizontal size={18} color="#000000" />
                  <View style={styles.menuItemTextCol}>
                    <Text style={styles.menuItemLabel}>Gym Settings</Text>
                    <Text style={styles.menuItemValue}>Manage hours & details</Text>
                  </View>
                </TouchableOpacity>

                {/* Logout Action */}
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

      {/* Gym Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSettingsVisible(false)}>
          <View style={styles.modalOverlayDark}>
            <TouchableWithoutFeedback>
              <View style={styles.settingsSheet}>
                <Text style={styles.settingsTitle}>Gym Settings</Text>
                
                {isLoadingSettings ? (
                  <ActivityIndicator size="large" color="#000" style={{ marginVertical: 40 }} />
                ) : (
                  <View style={styles.settingsForm}>
                    <Text style={styles.inputLabel}>Gym Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={gymName}
                      onChangeText={setGymName}
                      placeholder="Gym Name"
                    />

                    {/* Opening & Closing Times */}
                    <View style={styles.timeRow}>
                      <View style={styles.timeColumn}>
                        <Text style={styles.inputLabel}>Opening Time</Text>
                        <TouchableOpacity
                          style={styles.timeBtn}
                          onPress={() => setShowOpeningTimePicker(true)}
                        >
                          <Text style={styles.timeBtnText}>{openingTime}</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.timeColumn}>
                        <Text style={styles.inputLabel}>Closing Time</Text>
                        <TouchableOpacity
                          style={styles.timeBtn}
                          onPress={() => setShowClosingTimePicker(true)}
                        >
                          <Text style={styles.timeBtnText}>{closingTime}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {showOpeningTimePicker && (
                      <DateTimePicker
                        value={new Date(`2000-01-01T${openingTime || '06:00'}`)}
                        mode="time"
                        display="spinner"
                        onChange={(e, date) => {
                          if (date) {
                            const h = String(date.getHours()).padStart(2, '0');
                            const m = String(date.getMinutes()).padStart(2, '0');
                            setOpeningTime(`${h}:${m}`);
                          }
                          setShowOpeningTimePicker(false);
                        }}
                      />
                    )}

                    {showClosingTimePicker && (
                      <DateTimePicker
                        value={new Date(`2000-01-01T${closingTime || '22:00'}`)}
                        mode="time"
                        display="spinner"
                        onChange={(e, date) => {
                          if (date) {
                            const h = String(date.getHours()).padStart(2, '0');
                            const m = String(date.getMinutes()).padStart(2, '0');
                            setClosingTime(`${h}:${m}`);
                          }
                          setShowClosingTimePicker(false);
                        }}
                      />
                    )}

                    {/* Actions */}
                    <View style={styles.settingsActions}>
                      <TouchableOpacity
                        style={styles.cancelActionBtn}
                        onPress={() => setSettingsVisible(false)}
                      >
                        <Text style={styles.cancelActionText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.saveActionBtn}
                        onPress={handleSaveSettings}
                        disabled={isSavingSettings}
                      >
                        {isSavingSettings ? (
                          <ActivityIndicator color="#FFF" />
                        ) : (
                          <Text style={styles.saveActionText}>Save Settings</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
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
              onPress={() => router.push('/(gym)/members')}
            >
              <View style={[styles.heroCard, nebulaGold.colors.shadow.light]}>
                <Image
                  source={{ uri: HERO_IMAGE }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
                <View style={styles.heroOverlay}>
                  <View style={styles.heroHeader}>
                    <Text style={styles.heroLabel}>MEMBERSHIP STATUS</Text>
                    <View style={styles.heartCircle}>
                      <TrendingUp color="#000000" size={16} />
                    </View>
                  </View>
                  <View style={styles.heroFooter}>
                    <View>
                      <Text style={styles.heroTitle}>{(dashboard as any)?.activeMemberships || 1} Active Members</Text>
                      <View style={styles.heroSubRow}>
                        <TrendingUp color="#34C759" size={14} />
                        <Text style={styles.heroSubtext}>+12.5% vs last month</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Financial Performance */}
            <View style={[styles.revenueCard, nebulaGold.colors.shadow.light]}>
              <View style={styles.revenueHeader}>
                <Text style={styles.revenueLabel}>REVENUE THIS MONTH</Text>
                <ArrowUpRight color="#34C759" size={18} />
              </View>
              <Text style={styles.revenueValue}>${((dashboard as any)?.revenueThisMonth || 0).toLocaleString()}</Text>
              <View style={styles.systemStatusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Cloud Status: {(dashboard as any)?.systemStatus || 'Online'}</Text>
              </View>
            </View>

            {/* Symmetric Statistics Grid */}
            <View style={styles.statsGrid}>
              {[
                { label: 'Total Members', value: (dashboard as any)?.totalMembers || 0, icon: <Users color="#000000" size={18} /> },
                { label: 'Today Sessions', value: (dashboard as any)?.todaySessions || 0, icon: <Calendar color="#007AFF" size={18} /> },
                { label: 'Total Coaches', value: (dashboard as any)?.totalCoaches || 0, icon: <Briefcase color="#1A1AFF" size={18} /> },
                { label: 'Today Attendance', value: (dashboard as any)?.todayAttendanceCount || 0, icon: <UserCheck color="#34C759" size={18} /> },
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
              <Text style={styles.sectionTitleV3}>Manage Gym</Text>
              <View style={styles.actionRowV3}>
                {[
                  { label: 'Add Member', icon: <UserPlus color="#000" size={22} />, route: '/(gym)/members?add=true' },
                  { label: 'Add Coach', icon: <PlusCircle color="#000" size={22} />, route: '/(gym)/coaches?add=true' },
                  { label: 'Coaches', icon: <Briefcase color="#000" size={22} />, route: '/(admin)/coach-workload' },
                  { label: 'Plans', icon: <ClipboardList color="#000" size={22} />, route: '/(gym)/reports?tab=PLANS' },
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

            {/* Expiring Soon Segment */}
            {((dashboard as any)?.expiringMemberships?.length > 0) && (
              <View style={styles.alertSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitleV3}>Retention Alerts</Text>
                  <Text style={styles.alertCount}>{(dashboard as any).expiringMemberships.length} expiring</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.alertScroll}>
                  {(dashboard as any).expiringMemberships.map((item: any, idx: number) => (
                    <View key={idx} style={[styles.alertCard, nebulaGold.colors.shadow.light]}>
                      <View style={styles.alertHeader}>
                        <Text style={styles.memberName}>{(item as any).name}</Text>
                        <View style={styles.expiryBadge}>
                          <Text style={styles.expiryBadgeText}>7 Days</Text>
                        </View>
                      </View>
                      <Text style={styles.planName}>{(item as any).plan}</Text>
                      <Text style={styles.expiryDate}>Expires: {(item as any).expiry}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Recent Activity Feed */}
            <View style={styles.activitySection}>
              <Text style={styles.sectionTitleV3}>Live Activity</Text>
              <View style={[styles.activityList, nebulaGold.colors.shadow.light]}>
                {((dashboard as any)?.recentActivity || []).length > 0 ? (
                  (dashboard as any).recentActivity.map((activity: any, i: number) => (
                    <View key={i} style={[styles.activityItem, i === (dashboard as any).recentActivity.length - 1 && { borderBottomWidth: 0 }]}>
                      <View style={styles.activityDot} />
                      <View style={styles.activityContent}>
                        <Text style={styles.activityText}>{activity.description}</Text>
                        <Text style={styles.activityTime}>{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No recent activities recorded.</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  scrollContent: {
    paddingTop: 8,
  },
  avatarButton: {
    padding: 2,
  },
  loader: {
    paddingTop: 100,
    alignItems: 'center',
  },
  mainContent: {
    paddingHorizontal: GRID_PADDING,
    marginTop: 0,
  },
  heroCardContainer: {
    width: '100%',
    height: 160,
    marginBottom: 8,
  },
  heroCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: nebulaGold.colors.background.secondary,
    overflow: 'hidden',
    ...nebulaGold.colors.shadow.light,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
    padding: 12,
    justifyContent: 'space-between',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  heartCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  heroSubtext: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.9,
  },
  // REVENUE CARD
  revenueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  revenueLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 1,
  },
  revenueValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  systemStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  // SYMMETRIC STATS GRID
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: STAT_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    height: 75,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  statIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  statValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
  statLabelText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '700',
  },
  // ACTION ROW STYLES
  actionSectionV3: {
    marginBottom: 20,
  },
  sectionTitleV3: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 10,
  },
  actionRowV3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtnV3: {
    alignItems: 'center',
    width: 75,
  },
  actionIconSurfaceV3: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    ...nebulaGold.colors.shadow.light,
  },
  actionLabelV3: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
  },
  // RETENTION STYLES
  alertSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3B30',
    backgroundColor: '#FF3B3015',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  alertScroll: {
    marginLeft: -24,
    paddingLeft: 24,
  },
  alertCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FFEBEA',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  expiryBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expiryBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  planName: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 2,
  },
  expiryDate: {
    fontSize: 10,
    color: '#FF3B30',
    fontWeight: '700',
  },
  // ACTIVITY FEED STYLES
  activitySection: {
    marginBottom: 20,
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  activityItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    alignItems: 'center',
    gap: 12,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  emptyText: {
    padding: 14,
    textAlign: 'center',
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 12,
  },
  // PROFILE DROPDOWN STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    position: 'absolute',
    right: 20,
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    ...nebulaGold.colors.shadow.light,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  menuAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
  menuTitleColumn: {
    flex: 1,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  menuEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  menuEmail: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  menuItemValue: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF3B30',
  },
  modalOverlayDark: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  settingsSheet: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingsForm: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  timeColumn: {
    flex: 1,
  },
  timeBtn: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  timeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  settingsActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    alignItems: 'center',
  },
  cancelActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8E8E93',
  },
  saveActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  saveActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  }
});

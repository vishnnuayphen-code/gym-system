import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { analyticsService } from '../../src/services/analyticsService';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const DATE_RANGES = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'This Month', value: 'month' },
];

export default function SuperAdminAnalytics() {
  const [selectedRange, setSelectedRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  // Data states
  const [dashboard, setDashboard] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [members, setMembers] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [sessions, setSessions] = useState<any>(null);
  const [gyms, setGyms] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    
    let start = new Date();
    let end = new Date();
    if (selectedRange === '7d') {
      start.setDate(end.getDate() - 7);
    } else if (selectedRange === '30d') {
      start.setDate(end.getDate() - 30);
    } else if (selectedRange === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    try {
      const [dashRes, revRes, memRes, attRes, sesRes, gymRes] = await Promise.all([
        analyticsService.getDashboardSummary(startStr, endStr),
        analyticsService.getRevenueAnalytics(startStr, endStr),
        analyticsService.getMemberAnalytics(startStr, endStr),
        analyticsService.getAttendanceAnalytics(startStr, endStr),
        analyticsService.getSessionAnalytics(startStr, endStr),
        analyticsService.getGymComparison(startStr, endStr),
      ]);

      setDashboard(dashRes);
      setRevenue(revRes);
      setMembers(memRes);
      setAttendance(attRes);
      setSessions(sesRes);
      setGyms(gymRes);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRange]);

  const renderKPICard = (title: string, value: string | number, trend?: number, icon?: string, trendPositive?: boolean) => (
    <View style={styles.kpiCard}>
      <View style={styles.kpiHeader}>
        <Text style={styles.kpiTitle}>{title}</Text>
        {icon && (
          <View style={[styles.kpiIcon, { backgroundColor: trendPositive ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.iconText, { color: trendPositive ? '#2ECC71' : '#E74C3C' }]}>
              {icon}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.kpiContent}>
        <Text style={styles.kpiValue}>{value}</Text>
        {trend !== undefined && (
          <View style={[styles.trendBadge, { backgroundColor: trendPositive ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.trendText, { color: trendPositive ? '#2ECC71' : '#E74C3C' }]}>
              {trendPositive ? '↑' : '↓'} {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const chartConfig = {
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    color: (opacity = 1) => `rgba(201, 168, 76, ${opacity})`, // nebula gold
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  if (loading || !dashboard) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={nebulaGold.colors.gold.primary} />
      </View>
    );
  }

  // Safe data for charts
  const revenueTrendData = {
    labels: revenue?.monthlyRevenueTrend?.map((t: any) => t.label) || ['N/A'],
    datasets: [{ data: revenue?.monthlyRevenueTrend?.map((t: any) => t.value) || [0] }],
  };

  const attendanceData = {
    labels: attendance?.attendanceByGym?.map((g: any) => g.label) || ['N/A'],
    datasets: [{ data: attendance?.attendanceByGym?.map((g: any) => g.value) || [0] }],
  };

  const sessionStatusData = [
    { name: 'Completed', population: sessions?.completedSessions || 0, color: '#34C759', legendFontColor: '#000', legendFontSize: 12 },
    { name: 'Pending', population: sessions?.pendingSessions || 0, color: '#FF9500', legendFontColor: '#000', legendFontSize: 12 },
    { name: 'Cancelled', population: sessions?.cancelledSessions || 0, color: '#FF3B30', legendFontColor: '#000', legendFontSize: 12 },
  ];

  const hasRevenueData = revenue?.monthlyRevenueTrend?.some((t: any) => t.value > 0);
  const hasAttendanceData = attendance?.attendanceByGym?.some((g: any) => g.value > 0);
  const hasSessionData = sessions?.completedSessions > 0 || sessions?.pendingSessions > 0 || sessions?.cancelledSessions > 0;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Analytics" />
      
      <View style={styles.filterRow}>
        {DATE_RANGES.map((range) => (
          <TouchableOpacity
            key={range.value}
            style={[styles.filterBtn, selectedRange === range.value && styles.activeFilterBtn]}
            onPress={() => setSelectedRange(range.value)}
          >
            <Text style={[styles.filterText, selectedRange === range.value && styles.activeFilterText]}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* KPI Section */}
        <View style={styles.kpiGrid}>
          {renderKPICard('Total Gyms', dashboard.totalGyms, 8, '🏢', true)}
          {renderKPICard('Active Members', dashboard.totalActiveMembers, 12, '👥', true)}
          {renderKPICard('Total Coaches', dashboard.totalCoaches, 5, '🎯', true)}
          {renderKPICard('Total Revenue', `$${dashboard.totalRevenue.toLocaleString()}`, 18, '💰', true)}
          {renderKPICard('Sessions (Month)', dashboard.totalSessionsThisMonth, 3, '📅', true)}
          {renderKPICard('Attendance Rate', `${dashboard.attendanceRate}%`, 2, '✓', true)}
        </View>

        {/* Revenue Analytics Section */}
        <GlassCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Revenue Trend</Text>
          {hasRevenueData ? (
            <LineChart
              data={revenueTrendData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chartStyle}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No revenue recorded in this period</Text>
            </View>
          )}
        </GlassCard>

        {/* Attendance Analytics Section */}
        <GlassCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Attendance By Gym</Text>
          {hasAttendanceData ? (
            <BarChart
              data={attendanceData}
              width={screenWidth - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              style={styles.chartStyle}
              fromZero
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No attendance records in this period</Text>
            </View>
          )}
        </GlassCard>

        {/* Session Analytics Section */}
        <GlassCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Session Distribution</Text>
          {hasSessionData ? (
            <PieChart
              data={sessionStatusData}
              width={screenWidth - 40}
              height={200}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No sessions booked in this period</Text>
            </View>
          )}
        </GlassCard>

        {/* Gym Comparison Table */}
        <GlassCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Gym Comparison</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeaderCell, { width: 120 }]}>Gym</Text>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>Members</Text>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>Coaches</Text>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>Revenue</Text>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>Attend. %</Text>
              </View>
              {gyms.map((gym, idx) => (
                <View key={gym.gymId} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.tableCell, { width: 120 }]} numberOfLines={1}>{gym.gymName}</Text>
                  <Text style={styles.tableCell}>{gym.members}</Text>
                  <Text style={styles.tableCell}>{gym.coaches}</Text>
                  <Text style={styles.tableCell}>${gym.revenue}</Text>
                  <Text style={styles.tableCell}>{gym.attendancePercentage}%</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </GlassCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: nebulaGold.colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBF0',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  activeFilterBtn: {
    backgroundColor: nebulaGold.colors.gold.primary,
    borderColor: nebulaGold.colors.gold.primary,
  },
  filterText: {
    ...nebulaGold.typography.caption,
    fontWeight: '700',
    color: nebulaGold.colors.text.secondary,
    fontSize: 13,
  },
  activeFilterText: {
    color: '#FFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  kpiTitle: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    flex: 1,
  },
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  kpiContent: {
    justifyContent: 'flex-start',
  },
  kpiValue: {
    ...nebulaGold.typography.heading2,
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  trendText: {
    ...nebulaGold.typography.caption,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    marginBottom: 20,
    padding: 16,
    borderTopWidth: 3,
    borderTopColor: nebulaGold.colors.gold.primary,
  },
  sectionTitle: {
    ...nebulaGold.typography.heading3,
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  chartStyle: {
    marginVertical: 12,
    borderRadius: 12,
    marginLeft: -20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9F9FB',
    borderBottomWidth: 2,
    borderBottomColor: nebulaGold.colors.gold.primary,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 0,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  tableCell: {
    width: 80,
    ...nebulaGold.typography.caption,
    color: '#000',
    fontWeight: '500',
  },
  tableHeaderCell: {
    fontWeight: '800',
    color: nebulaGold.colors.gold.primary,
    fontSize: 12,
  },
  noDataContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#EBEBF0',
    borderStyle: 'dashed',
  },
  noDataText: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
});

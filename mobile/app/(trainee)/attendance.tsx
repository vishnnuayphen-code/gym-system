import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { format, parseISO, isSameMonth, startOfMonth, getDaysInMonth, getDay, addDays, differenceInCalendarDays } from 'date-fns';
import { LogIn, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { SectionLabel } from '../../src/components/nebula/SectionLabel';
import { useAuthStore } from '../../store/authStore';
import { useApiCall } from '../../src/hooks/useApiCall';
import { attendanceService } from '../../src/services/attendanceService';
import { showToast } from '../../src/utils/toast';
import { AttendanceRow, AttendanceRecord } from '../../src/components/attendance/AttendanceRow';
import { AttendanceRowSkeleton } from '../../src/components/attendance/AttendanceRowSkeleton';

export default function TraineeAttendanceScreen() {
  const { user } = useAuthStore();
  const traineeId = user?.id;

  const { data: records, loading, error, refreshing, refetch } = useApiCall(
    () => attendanceService.getForTrainee(traineeId?.toString() || ''),
    [traineeId]
  );

  // Compute stats
  const stats = useMemo(() => {
    const r = (records as AttendanceRecord[]) || [];
    if (r.length === 0) return { thisMonth: 0, total: 0, streak: 0 };

    const now = new Date();
    const thisMonth = r.filter(record => 
      record.status === 'PRESENT' && isSameMonth(parseISO(record.attendanceDate), now)
    ).length;

    const total = r.filter(record => record.status === 'PRESENT').length;

    // Longest streak calculation
    const sortedDates = r
      .filter(record => record.status === 'PRESENT')
      .map(record => record.attendanceDate)
      .sort();
    
    let streak = 0, maxStreak = 0, prev: string | null = null;
    for (const d of sortedDates) {
      if (prev) {
        const diff = differenceInCalendarDays(parseISO(d), parseISO(prev));
        streak = diff === 1 ? streak + 1 : 1;
      } else {
        streak = 1;
      }
      maxStreak = Math.max(maxStreak, streak);
      prev = d;
    }

    return { thisMonth, total, streak: maxStreak };
  }, [records]);

  // Build attended date set for calendar
  const attendedDates = useMemo(() => 
    new Set((records as AttendanceRecord[])?.filter(r => r.status === 'PRESENT').map(r => r.attendanceDate) ?? []),
    [records]
  );

  // Calendar grid for current month
  const today = new Date();
  const firstDay = startOfMonth(today);
  const daysInMonth = getDaysInMonth(today);
  const startDayOfWeek = getDay(firstDay); // 0=Sun
  const calendarCells = [
    ...Array(startDayOfWeek).fill(null),  // empty leading cells
    ...Array.from({ length: daysInMonth }, (_, i) => 
      format(addDays(firstDay, i), 'yyyy-MM-dd')
    )
  ];

  const [checkingIn, setCheckingIn] = useState(false);

  // Check if already checked in today
  const checkedInToday = attendedDates.has(format(today, 'yyyy-MM-dd'));

  const handleSelfCheckIn = async () => {
    if (!traineeId) return;
    setCheckingIn(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await attendanceService.checkIn({
        traineeId: traineeId,
        attendanceDate: format(today, 'yyyy-MM-dd'),
        status: 'PRESENT',
        checkInTime: format(today, 'HH:mm'),
        checkInMethod: 'MANUAL',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Checked in successfully!', 'success');
      refetch();
    } catch (e: any) {
      showToast(e.message ?? 'Check-in failed', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScreenHeader title="My Attendance" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor="#000000" />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        {/* Check-in Button */}
        <TouchableOpacity
          onPress={handleSelfCheckIn}
          disabled={checkingIn || checkedInToday}
          style={{
            backgroundColor: checkedInToday ? '#FFFFFF' : '#000000',
            borderWidth: 1,
            borderColor: checkedInToday ? '#34C759' : '#000000',
            borderRadius: 16, padding: 20,
            alignItems: 'center', marginBottom: 16,
            flexDirection: 'row', justifyContent: 'center', gap: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          {checkingIn ? (
            <ActivityIndicator color={checkedInToday ? "#34C759" : "#FFFFFF"} />
          ) : checkedInToday ? (
            <>
              <CheckCircle size={22} color="#34C759" />
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#34C759' }}>
                Checked in today
              </Text>
            </>
          ) : (
            <>
              <LogIn size={22} color="#FFFFFF" />
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>
                Check In Now
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'THIS MONTH', value: stats.thisMonth, color: '#000000' },
            { label: 'TOTAL',      value: stats.total,     color: '#000000' },
            { label: 'BEST STREAK',value: `${stats.streak}d`, color: '#34C759' },
          ].map(s => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: '#FFFFFF',
              borderRadius: 16, borderWidth: 1,
              borderColor: '#F2F2F7',
              padding: 14, alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2,
            }}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: s.color }}>
                {s.value}
              </Text>
              <Text style={{ fontSize: 10, color: '#8E8E93', marginTop: 4, fontWeight: '800' }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar Heatmap */}
        <SectionLabel label={format(today, 'MMMM yyyy').toUpperCase()} />
        <View style={{
          backgroundColor: '#FFFFFF', borderRadius: 16,
          borderWidth: 1, borderColor: '#F2F2F7',
          padding: 14, marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        }}>
          {/* Day headers */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <Text key={i} style={{
                flex: 1, textAlign: 'center',
                fontSize: 10, color: '#8E8E93', fontWeight: '800',
              }}>
                {d}
              </Text>
            ))}
          </View>
          {/* Calendar cells — 7 per row */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {calendarCells.map((dateStr, i) => {
              if (!dateStr) {
                return <View key={`empty-${i}`} style={{ width: `${100/7}%`, aspectRatio: 1 }} />
              }
              const isToday = dateStr === format(today, 'yyyy-MM-dd');
              const attended = attendedDates.has(dateStr);
              const dayNum = parseInt(dateStr.split('-')[2]);
              return (
                <View key={dateStr} style={{
                  width: `${100/7}%`, aspectRatio: 1,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: attended ? '#000000' : 'transparent',
                    borderWidth: isToday ? 2 : 0,
                    borderColor: isToday ? '#000000' : 'transparent',
                  }}>
                    <Text style={{
                      fontSize: 13,
                      fontWeight: attended || isToday ? '800' : '500',
                      color: attended ? '#FFFFFF'
                           : isToday  ? '#000000'
                           : '#AEAEB2',
                    }}>
                      {dayNum}
                    </Text>
                  </View>
                  {/* Status dot below attended days */}
                  {attended && (
                    <View style={{
                      width: 4, height: 4, borderRadius: 2,
                      backgroundColor: '#34C759', marginTop: 2,
                    }} />
                  )}
                </View>
              )
            })}
          </View>
        </View>

        {/* Recent History */}
        <SectionLabel label="RECENT CHECK-INS" />
        {loading && !refreshing && (
          Array.from({ length: 4 }).map((_, i) => (
            <AttendanceRowSkeleton key={i} />
          ))
        )}
        {!loading && (!records || (records as any[]).length === 0) && (
          <View style={{
            backgroundColor: '#FFFFFF', borderRadius: 16,
            borderWidth: 1, borderColor: '#F2F2F7',
            padding: 24, alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 13, color: '#8E8E93', fontWeight: '600' }}>
              No attendance records yet
            </Text>
          </View>
        )}
        {!loading && (records as AttendanceRecord[])
          ?.slice()
          .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate))
          .slice(0, 20)
          .map(r => <AttendanceRow key={r.id} record={r} />)
        }
      </ScrollView>
    </View>
  );
}

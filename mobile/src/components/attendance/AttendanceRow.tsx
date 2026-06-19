import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { nebulaGold } from '../../theme/nebulaGold';

export interface AttendanceRecord {
  id: string;
  traineeId: string;
  traineeName: string;
  traineePhoto: string | null;
  markedBy: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInMethod: 'MANUAL' | 'QR' | 'AUTO';
}

interface AttendanceRowProps {
  record: AttendanceRecord;
}

/**
 * TripGlide Attendance Row - Light theme, soft shadow, clean typography.
 */
export function AttendanceRow({ record }: AttendanceRowProps) {
  const statusColors = {
    PRESENT: { bg: '#E3FBE9', border: '#D0F5D9', text: '#34C759' },
    ABSENT:  { bg: '#FFEBEA', border: '#FFD7D5', text: '#FF3B30' },
    EXCUSED: { bg: '#FFF1E0', border: '#FFE5C5', text: '#FF9500' },
  };
  
  const methodColors = {
    MANUAL: '#8E8E93',
    QR:     '#007AFF',
    AUTO:   '#000000',
  };
  
  const c = statusColors[record.status] || statusColors.PRESENT;

  const duration = (() => {
    if (!record.checkInTime || !record.checkOutTime) return null;
    try {
      const getTimeMins = (timeStr: string) => {
        if (timeStr.includes('T')) {
          const d = new Date(timeStr);
          return d.getHours() * 60 + d.getMinutes();
        }
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };
      
      const inMins = getTimeMins(record.checkInTime);
      const outMins = getTimeMins(record.checkOutTime);
      const mins = outMins - inMins;
      
      if (mins <= 0) return null;
      return mins >= 60
        ? `${Math.floor(mins/60)}h ${mins%60}m`
        : `${mins}m`;
    } catch (e) {
      return null;
    }
  })();

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    if (timeStr.includes('T')) {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return timeStr.substring(0, 5);
  };

  return (
    <View style={styles.card}>
      {/* Avatar */}
      <View style={styles.avatarCircle}>
        {record.traineePhoto ? (
          <Image
            source={{ uri: record.traineePhoto }}
            style={styles.avatarImage}
          />
        ) : (
          <Text style={styles.avatarInitial}>
            {record.traineeName?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{record.traineeName}</Text>
        <View style={styles.detailsRow}>
          {record.checkInTime && (
            <Text style={styles.detailText}>In: {formatTime(record.checkInTime)}</Text>
          )}
          {record.checkOutTime && (
            <Text style={styles.detailText}>Out: {formatTime(record.checkOutTime)}</Text>
          )}
          {duration && (
            <Text style={styles.durationText}>{duration}</Text>
          )}
          <Text style={[styles.methodText, { color: methodColors[record.checkInMethod] || '#8E8E93' }]}>
            {record.checkInMethod}
          </Text>
        </View>
        {record.markedBy && (
          <Text style={styles.markedBy}>Marked by {record.markedBy}</Text>
        )}
      </View>

      {/* Status badge */}
      <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
        <Text style={[styles.badgeText, { color: c.text }]}>
          {record.status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F2F2F7',
    borderWidth: 1, borderColor: '#EBEBF0',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: { 
    width: 42, height: 42, borderRadius: 21 
  },
  avatarInitial: { 
    fontSize: 16, fontWeight: '700', color: '#000000' 
  },
  name: { 
    fontSize: 15, fontWeight: '700', color: '#000000' 
  },
  detailsRow: {
    flexDirection: 'row', alignItems: 'center',
    flexWrap: 'wrap', marginTop: 4, gap: 8,
  },
  detailText: { 
    fontSize: 12, color: '#8E8E93' 
  },
  durationText: { 
    fontSize: 12, color: '#000000', fontWeight: '600' 
  },
  methodText: {
    fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  markedBy: { 
    fontSize: 11, color: '#C7C7CC', marginTop: 4 
  },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  badgeText: { 
    fontSize: 10, fontWeight: '700' 
  },
});

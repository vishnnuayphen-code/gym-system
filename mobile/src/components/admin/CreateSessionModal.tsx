import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, StyleSheet, Platform
} from 'react-native';
import { 
  Calendar, Clock, User, CheckCircle, 
  AlertCircle, Search, ChevronRight 
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { sessionService } from '../../services/sessionService';
import { coachService } from '../../services/coachService';
import { traineeService } from '../../services/traineeService';
import { showToast } from '../../utils/toast';
import { SectionLabel } from '../nebula/SectionLabel';
import { format, parseISO } from 'date-fns';

interface CreateSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSessionModal({ visible, onClose, onSuccess }: CreateSessionModalProps) {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [selectedTrainee, setSelectedTrainee] = useState<any>(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [sessionType, setSessionType] = useState('PERSONAL_TRAINING');
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load coaches/trainees
  useEffect(() => {
    if (!visible) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [c, t] = await Promise.all([
          coachService.getAll(),
          traineeService.getAll()
        ]);
        setCoaches(c);
        setTrainees(t);
      } catch (e) {
        setError('Failed to load coaches or members');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [visible]);

  const handleCreate = async () => {
    if (!selectedCoach || !selectedTrainee || !date || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }

    // Ensure HH:mm format (pad single digit hours with leading zero)
    // Ensure HH:mm format (pad single digit hours with leading zero)
    const padTime = (t: string) => {
      const clean = t.trim();
      if (/^\d:\d{2}$/.test(clean)) {
        return '0' + clean;
      }
      return clean;
    };

    const formattedStartTime = padTime(startTime);
    const formattedEndTime = padTime(endTime);

    if (formattedStartTime >= formattedEndTime) {
      setError('Start time must be before end time (24h format)');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await sessionService.create({
        coachId: selectedCoach.id,
        traineeId: selectedTrainee.id,
        sessionDate: date,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        sessionType: sessionType,
        status: 'SCHEDULED'
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Session scheduled successfully', 'success');
      onSuccess();
      onClose();
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to create session';
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#09090F' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between',
          alignItems: 'center', paddingHorizontal: 16,
          paddingTop: 20, paddingBottom: 16,
          borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.2)',
          backgroundColor: '#12121A',
        }}>
          <TouchableOpacity onPress={onClose} disabled={submitting}>
            <Text style={{ fontSize: 15, color: '#9E9A8E' }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: '600', color: '#F0EBE0' }}>
            New Session
          </Text>
          <TouchableOpacity onPress={handleCreate} disabled={submitting || loading}>
            {submitting ? (
              <ActivityIndicator size="small" color="#C9A84C" />
            ) : (
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#C9A84C' }}>
                Create
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {error && (
            <View style={{
              backgroundColor: 'rgba(231,76,60,0.1)', padding: 12,
              borderRadius: 10, marginBottom: 16, flexDirection: 'row',
              alignItems: 'center', gap: 8, borderLeftWidth: 3, borderLeftColor: '#E74C3C'
            }}>
              <AlertCircle size={16} color="#E74C3C" />
              <Text style={{ color: '#E74C3C', fontSize: 13, flex: 1 }}>{error}</Text>
            </View>
          )}

          <SectionLabel label="SESSION DETAILS" />
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <View style={styles.inputWrapper}>
              <Calendar size={18} color="#5A5750" />
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholderTextColor="#5A5750"
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
             <View style={{ flex: 1 }}>
                <Text style={styles.label}>Start Time (HH:mm)</Text>
                <View style={styles.inputWrapper}>
                    <Clock size={16} color="#5A5750" />
                    <TextInput
                        style={styles.input}
                        value={startTime}
                        onChangeText={setStartTime}
                    />
                </View>
             </View>
             <View style={{ flex: 1 }}>
                <Text style={styles.label}>End Time (HH:mm)</Text>
                <View style={styles.inputWrapper}>
                    <Clock size={16} color="#5A5750" />
                    <TextInput
                        style={styles.input}
                        value={endTime}
                        onChangeText={setEndTime}
                    />
                </View>
             </View>
          </View>
          
          <SectionLabel label="SESSION TYPE" />
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Personal', value: 'PERSONAL_TRAINING' },
              { label: 'Group', value: 'GROUP_SESSION' },
              { label: 'Online', value: 'ONLINE_SESSION' }
            ].map(type => (
              <TouchableOpacity
                key={type.value}
                onPress={() => {
                  setSessionType(type.value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.typeButton,
                  sessionType === type.value && styles.typeButtonActive
                ]}
              >
                <Text style={[
                  styles.typeButtonText,
                  sessionType === type.value && styles.typeButtonTextActive
                ]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionLabel label="SELECT COACH" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {coaches.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCoach(c)}
                style={[
                  styles.pickerItem,
                  selectedCoach?.id === c.id && styles.pickerItemActive
                ]}
              >
                <View style={[styles.avatar, selectedCoach?.id === c.id && styles.avatarActive]}>
                  {c.profilePhotoUrl ? (
                    <Text style={{ color: '#C9A84C' }}>{c.name.charAt(0)}</Text>
                  ) : (
                    <Text style={{ color: selectedCoach?.id === c.id ? '#09090F' : '#C9A84C' }}>
                      {c.name.charAt(0)}
                    </Text>
                  )}
                </View>
                <Text style={[styles.pickerLabel, selectedCoach?.id === c.id && styles.pickerLabelActive]} numberOfLines={1}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <SectionLabel label="SELECT MEMBER" />
          <View style={{ gap: 8 }}>
            {trainees.slice(0, 10).map(t => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setSelectedTrainee(t)}
                style={[
                  styles.memberRow,
                  selectedTrainee?.id === t.id && styles.memberRowActive
                ]}
              >
                <View style={styles.memberAvatar}>
                  <Text style={{ color: '#C9A84C', fontSize: 12 }}>{t.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                   <Text style={{ color: '#F0EBE0', fontSize: 14 }}>{t.name}</Text>
                   <Text style={{ color: '#9E9A8E', fontSize: 11 }}>{t.membershipStatus}</Text>
                </View>
                {selectedTrainee?.id === t.id && <CheckCircle size={18} color="#C9A84C" />}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, color: '#9E9A8E', marginBottom: 6, fontWeight: '500' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#12121A',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12, height: 48, gap: 10
  },
  input: { flex: 1, color: '#F0EBE0', fontSize: 15 },
  pickerItem: {
    width: 80, alignItems: 'center', marginRight: 12, padding: 8,
    borderRadius: 12, backgroundColor: '#12121A', borderWidth: 1, borderColor: 'transparent'
  },
  pickerItemActive: { borderColor: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.1)' },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A26',
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
    borderWidth: 1, borderColor: '#C9A84C'
  },
  avatarActive: { backgroundColor: '#C9A84C' },
  pickerLabel: { fontSize: 11, color: '#9E9A8E', textAlign: 'center' },
  pickerLabelActive: { color: '#C9A84C', fontWeight: '600' },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#12121A',
    borderRadius: 12, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  memberRowActive: { borderColor: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.05)' },
  memberAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A1A26',
    borderWidth: 1, borderColor: '#C9A84C', alignItems: 'center', justifyContent: 'center'
  },
  typeButton: {
    flex: 1, height: 40, borderRadius: 8, backgroundColor: '#12121A',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  typeButtonActive: {
    borderColor: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.1)'
  },
  typeButtonText: {
    fontSize: 12, color: '#9E9A8E', fontWeight: '500'
  },
  typeButtonTextActive: {
    color: '#C9A84C', fontWeight: '700'
  }
});

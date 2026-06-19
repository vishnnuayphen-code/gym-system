import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, StyleSheet
} from 'react-native';
import { 
  Link, ArrowRight, UserPlus, CheckCircle, 
  Info, AlertCircle, Plus, Search 
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { coachService } from '../../services/coachService';
import { traineeService } from '../../services/traineeService';
import { showToast } from '../../utils/toast';
import { SectionLabel } from '../nebula/SectionLabel';
import { nebulaGold } from '../../theme/nebulaGold';

interface AssignCoachModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedCoachId?: string;    // pass from Coach Detail
  preselectedTraineeId?: string;  // pass from Member Detail
}

export function AssignCoachModal({
  visible, onClose, onSuccess,
  preselectedCoachId, preselectedTraineeId,
}: AssignCoachModalProps) {

  const [coaches, setCoaches]   = useState<any[]>([]);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [selectedCoach, setSelectedCoach]     = useState<any>(null);
  const [selectedTrainee, setSelectedTrainee] = useState<any>(null);
  const [coachSearch, setCoachSearch]   = useState('');
  const [traineeSearch, setTraineeSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [step, setStep] = useState<'SELECT_COACH' | 'SELECT_TRAINEE' | 'CONFIRM'>(
    preselectedCoachId ? 'SELECT_TRAINEE'
    : preselectedTraineeId ? 'SELECT_COACH'
    : 'SELECT_COACH'
  );

  // Load data when modal opens
  useEffect(() => {
    if (!visible) return;
    setError(null);

    const fetchData = async () => {
        try {
            if (preselectedCoachId) {
                const coach = await coachService.getById(preselectedCoachId);
                setSelectedCoach(coach);
                const allTrainees = await traineeService.getAll();
                // Only show PERSONAL_TRAINING members — they are the ones who can be assigned
                const eligible = allTrainees.filter(
                    (t: any) => t.trainingType === 'PERSONAL_TRAINING' || !t.trainingType
                );
                setTrainees(eligible);
                setStep('SELECT_TRAINEE');
                return;
            }

            if (preselectedTraineeId) {
                const trainee = await traineeService.getById(preselectedTraineeId);
                setSelectedTrainee(trainee);
                const allCoaches = await coachService.getAll();
                setCoaches(allCoaches);
                setStep('SELECT_COACH');
                return;
            }

            // No preselection — load both
            const [c, t] = await Promise.all([
                coachService.getAll(),
                traineeService.getAll()
            ]);
            setCoaches(c);
            setTrainees(t.filter(
                (tr: any) => tr.trainingType === 'PERSONAL_TRAINING' || !tr.trainingType
            ));
        } catch (e: any) {
            setError('Failed to load data. Please check your connection.');
        }
    };

    fetchData();
  }, [visible, preselectedCoachId, preselectedTraineeId]);

  // Reset on close
  const handleClose = () => {
    if (!preselectedCoachId) setSelectedCoach(null);
    if (!preselectedTraineeId) setSelectedTrainee(null);
    setCoachSearch(''); setTraineeSearch('');
    setError(null);
    setStep(preselectedCoachId ? 'SELECT_TRAINEE'
          : preselectedTraineeId ? 'SELECT_COACH'
          : 'SELECT_COACH');
    onClose();
  };

  // Submit
  const handleAssign = async () => {
    if (!selectedCoach || !selectedTrainee) return;
    setError(null);
    setSubmitting(true);
    try {
      await coachService.assignTrainee(selectedCoach.id.toString(), selectedTrainee.id.toString());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast(
        `${selectedTrainee.name} assigned to ${selectedCoach.name}`,
        'success'
      );
      onSuccess();
      handleClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? '';
      if (msg.toLowerCase().includes('personal training')) {
        setError('This member is not enrolled in Personal Training and cannot be assigned a coach.');
      } else if (msg.toLowerCase().includes('already')) {
        setError(`${selectedTrainee?.name} is already assigned to a coach.`);
      } else {
        setError(msg || 'Failed to assign coach. Please try again.');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCoaches  = coaches.filter(c =>
    c.name?.toLowerCase().includes(coachSearch.toLowerCase())
  );
  const filteredTrainees = trainees.filter(t =>
    t.name?.toLowerCase().includes(traineeSearch.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>

        {/* ── Header ── */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between',
          alignItems: 'center', paddingHorizontal: 20,
          paddingTop: 20, paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#EBEBF0',
          backgroundColor: '#FFFFFF',
        }}>
          <TouchableOpacity onPress={handleClose} disabled={submitting}>
            <Text style={{ fontSize: 16, color: '#FF3B30', fontWeight: '700' }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#000000' }}>
            Assign Coach
          </Text>
          {/* Show Confirm button only when both are selected */}
          {selectedCoach && selectedTrainee ? (
            <TouchableOpacity onPress={handleAssign} disabled={submitting}>
              {submitting
                ? <ActivityIndicator size="small" color="#000" />
                : <Text style={{ fontSize: 16, fontWeight: '800', color: '#007AFF' }}>
                    Assign
                  </Text>
              }
            </TouchableOpacity>
          ) : (
            <View style={{ width: 50 }} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >

          {/* Error banner */}
          {error && (
            <View style={{
              backgroundColor: '#FF3B3015',
              borderRadius: 12, borderWidth: 1,
              borderColor: '#FF3B3030',
              padding: 12, marginBottom: 16,
              flexDirection: 'row', alignItems: 'center', gap: 8,
            }}>
              <AlertCircle size={16} color="#FF3B30" />
              <Text style={{ fontSize: 13, color: '#FF3B30', flex: 1, fontWeight: '600' }}>
                {error}
              </Text>
            </View>
          )}

          {/* ── Selected summary cards ── */}
          {(selectedCoach || selectedTrainee) && (
            <View style={{
              flexDirection: 'row', gap: 12, marginBottom: 20,
            }}>
              {/* Coach summary */}
              <View style={{
                flex: 1, backgroundColor: '#FFFFFF',
                borderRadius: 16, borderWidth: 1,
                borderColor: selectedCoach ? '#000000' : '#EBEBF0',
                padding: 16, alignItems: 'center', gap: 8,
                ...nebulaGold.colors.shadow.light,
              }}>
                <Text style={{ fontSize: 10, color: '#8E8E93', fontWeight: '800',
                  textTransform: 'uppercase', letterSpacing: 1 }}>
                  Coach
                </Text>
                {selectedCoach ? (
                  <>
                    <View style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: '#F2F2F7',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: '#8E8E93' }}>
                        {selectedCoach.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#000000',
                      textAlign: 'center' }}>
                      {selectedCoach.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#8E8E93', fontWeight: '600' }}>
                      {selectedCoach.specialization ?? ''}
                    </Text>
                  </>
                ) : (
                  <View style={{ height: 80, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 13, color: '#C7C7CC', fontWeight: '600' }}>Empty</Text>
                  </View>
                )}
              </View>

              {/* Arrow */}
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <ArrowRight size={22} color={selectedCoach && selectedTrainee ? '#000000' : '#C7C7CC'} />
              </View>

              {/* Trainee summary */}
              <View style={{
                flex: 1, backgroundColor: '#FFFFFF',
                borderRadius: 16, borderWidth: 1,
                borderColor: selectedTrainee ? '#000000' : '#EBEBF0',
                padding: 16, alignItems: 'center', gap: 8,
                ...nebulaGold.colors.shadow.light,
              }}>
                <Text style={{ fontSize: 10, color: '#8E8E93', fontWeight: '800',
                  textTransform: 'uppercase', letterSpacing: 1 }}>
                  Member
                </Text>
                {selectedTrainee ? (
                  <>
                    <View style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: '#F2F2F7',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: '#8E8E93' }}>
                        {selectedTrainee.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#000000',
                      textAlign: 'center' }}>
                      {selectedTrainee.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#8E8E93', fontWeight: '600' }}>
                      {selectedTrainee.preferredTime?.replace(/_/g, ' ') || 'Flexible'}
                    </Text>
                  </>
                ) : (
                  <View style={{ height: 80, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 13, color: '#C7C7CC', fontWeight: '600' }}>Empty</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── Coach picker ── */}
          {!preselectedCoachId && (
            <>
              <SectionLabel label="SELECT COACH" />
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#FFFFFF', borderRadius: 12,
                borderWidth: 1, borderColor: '#EBEBF0',
                paddingHorizontal: 12, height: 48, marginBottom: 12,
              }}>
                <Search size={18} color="#8E8E93" />
                <TextInput
                  style={{ flex: 1, fontSize: 15, color: '#000000', marginLeft: 10, fontWeight: '500' }}
                  placeholder="Search coaches..."
                  placeholderTextColor="#C7C7CC"
                  value={coachSearch}
                  onChangeText={setCoachSearch}
                />
              </View>
              {filteredCoaches.map(c => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    setSelectedCoach(c);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    gap: 12, padding: 14, borderRadius: 14, marginBottom: 8,
                    backgroundColor: selectedCoach?.id === c.id ? '#000000' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: selectedCoach?.id === c.id ? '#000000' : '#EBEBF0',
                  }}
                >
                  <View style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: selectedCoach?.id === c.id ? '#1C1C1E' : '#F2F2F7',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: selectedCoach?.id === c.id ? '#FFFFFF' : '#8E8E93' }}>
                      {c.name?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, color: selectedCoach?.id === c.id ? '#FFFFFF' : '#000000', fontWeight: '700' }}>
                      {c.name}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                      {c.specialization && (
                        <Text style={{ fontSize: 12, color: selectedCoach?.id === c.id ? '#8E8E93' : '#8E8E93', fontWeight: '500' }}>
                          {c.specialization}
                        </Text>
                      )}
                    </View>
                  </View>
                  {selectedCoach?.id === c.id && (
                    <CheckCircle size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* ── Trainee picker ── */}
          {!preselectedTraineeId && (
            <>
              <SectionLabel label="SELECT MEMBER" style={{ marginTop: 8 }} />

              <View style={{
                backgroundColor: '#007AFF10',
                borderRadius: 12, borderWidth: 1,
                borderColor: '#007AFF20',
                padding: 12, marginBottom: 16,
                flexDirection: 'row', gap: 10, alignItems: 'center',
              }}>
                <Info size={16} color="#007AFF" />
                <Text style={{ fontSize: 13, color: '#007AFF', flex: 1, fontWeight: '600' }}>
                  Only members enrolled in Personal Training can be assigned.
                </Text>
              </View>

              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#FFFFFF', borderRadius: 12,
                borderWidth: 1, borderColor: '#EBEBF0',
                paddingHorizontal: 12, height: 48, marginBottom: 12,
              }}>
                <Search size={18} color="#8E8E93" />
                <TextInput
                  style={{ flex: 1, fontSize: 15, color: '#000000', marginLeft: 10, fontWeight: '500' }}
                  placeholder="Search members..."
                  placeholderTextColor="#C7C7CC"
                  value={traineeSearch}
                  onChangeText={setTraineeSearch}
                />
              </View>

              {filteredTrainees.length === 0 && (
                <View style={{
                  backgroundColor: '#FFFFFF', borderRadius: 16,
                  padding: 30, alignItems: 'center', gap: 10,
                  borderWidth: 1, borderColor: '#EBEBF0',
                }}>
                  <Text style={{ fontSize: 14, color: '#8E8E93', textAlign: 'center', fontWeight: '600' }}>
                    No members eligible for assignment.
                  </Text>
                </View>
              )}

              {filteredTrainees.map(t => {
                const isCompatible = (() => {
                  if (!selectedCoach) return true;
                  if (selectedCoach.employmentType === 'FULL_TIME') return true;
                  if (!t.preferredTime || t.preferredTime === 'FLEXIBLE') return true;
                  const timeToSession: Record<string, string[]> = {
                    EARLY_MORNING: ['MORNING', 'BOTH'],
                    MORNING:       ['MORNING', 'BOTH'],
                    AFTERNOON:     ['MORNING', 'BOTH', 'EVENING'],
                    EVENING:       ['EVENING', 'BOTH'],
                    NIGHT:         ['EVENING', 'BOTH'],
                    FLEXIBLE:      ['MORNING', 'EVENING', 'BOTH'],
                  };
                  return (timeToSession[t.preferredTime] ?? []).includes(selectedCoach.sessionType);
                })();

                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => {
                      setSelectedTrainee(t);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      gap: 12, padding: 14, borderRadius: 14, marginBottom: 8,
                      backgroundColor: selectedTrainee?.id === t.id ? '#000000' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: selectedTrainee?.id === t.id ? '#000000' : '#EBEBF0',
                      opacity: isCompatible ? 1 : 0.5,
                    }}
                  >
                    <View style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: selectedTrainee?.id === t.id ? '#1C1C1E' : '#F2F2F7',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: selectedTrainee?.id === t.id ? '#FFFFFF' : '#8E8E93' }}>
                        {t.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, color: selectedTrainee?.id === t.id ? '#FFFFFF' : '#000000', fontWeight: '700' }}>
                        {t.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: selectedTrainee?.id === t.id ? '#8E8E93' : '#8E8E93', fontWeight: '500', marginTop: 3 }}>
                        {t.preferredTime?.replace(/_/g, ' ') || 'Flexible'}
                      </Text>
                    </View>
                    {/* Compatibility badge */}
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: isCompatible ? '#34C75920' : '#FF3B3020',
                    }}>
                      <Text style={{
                        fontSize: 10, fontWeight: '800',
                        color: isCompatible ? '#34C759' : '#FF3B30',
                      }}>
                        {isCompatible ? 'Match ✓' : 'Mismatch'}
                      </Text>
                    </View>
                    {selectedTrainee?.id === t.id && (
                      <CheckCircle size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* ── Confirm area AREA ── */}
          {selectedCoach && selectedTrainee && (
            <View style={{
              marginTop: 24,
              backgroundColor: '#FFFFFF',
              borderRadius: 20, borderWidth: 1,
              borderColor: '#000000',
              padding: 24, alignItems: 'center', gap: 12,
              ...nebulaGold.colors.shadow.light,
            }}>
              <CheckCircle size={32} color="#34C759" />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#000000' }}>
                  Confirm Assignment
                </Text>
                <Text style={{ fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 4, fontWeight: '500' }}>
                  Assigning <Text style={{ color: '#000000', fontWeight: '700' }}>{selectedTrainee.name}</Text> to{'\n'}
                  <Text style={{ color: '#000000', fontWeight: '700' }}>{selectedCoach.name}</Text>
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={handleAssign}
                disabled={submitting}
                style={{
                  marginTop: 12,
                  backgroundColor: '#000000',
                  borderRadius: 16, paddingVertical: 16, width: '100%',
                  alignItems: 'center',
                }}
              >
                {submitting
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>
                      Assign Now
                    </Text>
                }
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({});

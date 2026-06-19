import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { User, Users, Target, MessageSquare } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { nebulaGold } from '../../../theme/nebulaGold';
import { useBookingStore } from '../../../stores/bookingStore';
import { OnboardingLayout } from '../../../components/onboarding/OnboardingLayout';
import { OptionCard } from '../../../components/onboarding/OptionCard';
import { SectionLabel } from '../../../components/nebula/SectionLabel';
import { GlassCard } from '../../../components/nebula/GlassCard';

const FOCUS_AREAS = [
  'Upper Body', 'Lower Body', 'Core', 
  'Cardio', 'Flexibility', 'Full Body', 'Strength'
];

export const SessionDetailsStep = ({ onNext }: { onNext: () => void }) => {
  const { 
    selectedSlot, 
    selectedSessionType, 
    setSessionType,
    focusAreas,
    setFocusAreas,
    notes,
    setNotes
  } = useBookingStore();

  const handleFocusToggle = (area: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter(a => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={4}
      title="Session Details"
      subtitle="A few more details."
      onNext={onNext}
      isNextDisabled={!selectedSessionType}
    >
      <View style={styles.section}>
        <SectionLabel label="SESSION TYPE" />
        <View style={styles.typeCards}>
            <OptionCard
              title="1-on-1 Training"
              subtitle="Private session, full coach attention"
              icon={User}
              selected={selectedSessionType === 'PERSONAL_TRAINING'}
              onPress={() => {
                setSessionType('PERSONAL_TRAINING');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            />
            <OptionCard
              title="Group Training"
              subtitle="Train with others, more energy"
              icon={Users}
              selected={selectedSessionType === 'GROUP_SESSION'}
              onPress={() => {
                setSessionType('GROUP_SESSION');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            />
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel label="What do you want to focus on?" />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {FOCUS_AREAS.map(area => (
            <TouchableOpacity 
              key={area}
              onPress={() => handleFocusToggle(area)}
              style={[
                styles.pill,
                focusAreas.includes(area) && styles.activePill
              ]}
            >
              <Text style={[
                styles.pillText,
                focusAreas.includes(area) && styles.activePillText
              ]}>
                {area}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionLabel label="NOTES FOR YOUR COACH" />
        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <MessageSquare size={16} color="#8E8E93" />
            <Text style={styles.noteLabel}>Instructions or preferences</Text>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="Any injuries, preferences, or goals for this session..."
            placeholderTextColor="#8E8E93"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={(t) => t.length <= 300 && setNotes(t)}
            textAlignVertical="top"
          />
          <Text style={[
            styles.charCount,
            notes.length >= 250 && { color: '#FF3B30' }
          ]}>
            {notes.length}/300
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 32 },
  typeCards: { flexDirection: 'row', gap: 12 },
  pillsRow: { paddingRight: 20, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  activePill: { backgroundColor: '#000', borderColor: '#000' },
  pillText: { fontSize: 13, fontWeight: '800', color: '#8E8E93' },
  activePillText: { color: '#FFF' },
  noteCard: { padding: 20, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  noteLabel: { fontSize: 12, fontWeight: '800', color: '#8E8E93' },
  textArea: { fontSize: 15, color: '#000', minHeight: 100, fontWeight: '600' },
  charCount: { fontSize: 10, textAlign: 'right', marginTop: 8, opacity: 0.5, fontWeight: '800' }
});

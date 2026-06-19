import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Image
} from 'react-native';
import { Search, Star, ChevronRight, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { useBookingStore, Coach } from '../../../stores/bookingStore';
import { OnboardingLayout } from '../../../components/onboarding/OnboardingLayout';

// Mock data for demo/initial implementation
const MOCK_COACHES: Coach[] = [
  { id: '1', name: 'Alex Rivera', specialty: 'Strength & Conditioning', rating: 4.9, reviewCount: 124, availableDays: ['MON', 'WED', 'FRI'] },
  { id: '2', name: 'Sarah Chen', specialty: 'Yoga & Flexibility', rating: 4.8, reviewCount: 89, availableDays: ['TUE', 'THU', 'SAT'] },
  { id: '3', name: 'Marcus Johnson', specialty: 'Boxing & HIIT', rating: 5.0, reviewCount: 210, availableDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'] },
];

const CATEGORIES = ['All Coaches', 'Strength', 'Yoga', 'HIIT', 'Boxing', 'Cardio'];

export const ChooseCoachStep = ({ onNext }: { onNext: () => void }) => {
  const { selectedCoach, setCoach, setDate } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Coaches');
  const [isLoading, setIsLoading] = useState(false);

  const filteredCoaches = useMemo(() => {
    return MOCK_COACHES.filter(coach => {
      const matchesSearch = coach.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedCategory === 'All Coaches' || coach.specialty.includes(selectedCategory);
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedCategory]);

  const handleQuickDateSelect = (coach: Coach, dateOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + dateOffset);
    setCoach(coach);
    setDate(date.toISOString().split('T')[0]);
    onNext();
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={4}
      title="Book a Session"
      subtitle="Choose your coach."
      onNext={onNext}
      isNextDisabled={!selectedCoach}
    >
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#8E8E93" />
          <TextInput 
            placeholder="Search coaches..." 
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryStrip}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity 
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.categoryBtn, isSelected && styles.activeCategoryBtn]}
            >
              <Text style={[styles.categoryText, isSelected && styles.activeCategoryText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator color="#000" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.coachList} contentContainerStyle={styles.listContent}>
          {filteredCoaches.map((coach: any) => {
            const isSelected = selectedCoach?.id === coach.id;
            return (
              <TouchableOpacity
                key={coach.id}
                onPress={() => {
                  setCoach(coach);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={[
                  styles.coachCard,
                  isSelected && styles.activeCoachCard
                ]}>
                  <View style={styles.coachMain}>
                    <View style={styles.avatar}>
                       {coach.photoUrl ? (
                         <Image source={{ uri: coach.photoUrl }} style={styles.avatarImg} />
                       ) : (
                         <View style={styles.avatarPlaceholder}>
                           <Text style={styles.avatarTxt}>{coach.name.charAt(0)}</Text>
                         </View>
                       )}
                    </View>
                    <View style={styles.coachInfo}>
                      <Text style={[styles.coachName, isSelected && styles.activeText]}>{coach.name}</Text>
                      <Text style={[styles.coachSpecialty, isSelected && styles.activeTextSecondary]}>{coach.specialty}</Text>
                      <View style={styles.ratingRow}>
                        <Star size={12} color={isSelected ? "#FFF" : "#FF9500"} fill={isSelected ? "#FFF" : "#FF9500"} />
                        <Text style={[styles.ratingText, isSelected && styles.activeText]}>{coach.rating} ({coach.reviewCount} reviews)</Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={isSelected ? "#FFF" : "#8E8E93"} />
                  </View>
                  
                  <View style={styles.coachFooter}>
                    <Text style={[styles.availableLabel, isSelected && styles.activeText]}>Available:</Text>
                    <View style={styles.daysRow}>
                      {['Sat 11', 'Sun 12', 'Mon 13'].map(day => (
                        <View key={day} style={[styles.dayBadge, isSelected && styles.activeDayBadge]}>
                          <Text style={[styles.dayText, isSelected && styles.activeDayText]}>{day}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#000', fontWeight: '600' },
  categoryStrip: { maxHeight: 44, marginBottom: 20 },
  categoryContent: { paddingHorizontal: 20, gap: 8 },
  categoryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F2F2F7' },
  activeCategoryBtn: { backgroundColor: '#000', borderColor: '#000' },
  categoryText: { fontSize: 13, fontWeight: '800', color: '#8E8E93' },
  activeCategoryText: { color: '#FFF' },
  coachList: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  coachCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  activeCoachCard: { backgroundColor: '#000', borderColor: '#000' },
  coachMain: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 24, fontWeight: '800', color: '#000' },
  coachInfo: { flex: 1 },
  coachName: { fontSize: 18, fontWeight: '900', color: '#000' },
  coachSpecialty: { fontSize: 14, fontWeight: '700', color: '#8E8E93', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#8E8E93' },
  coachFooter: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
  availableLabel: { fontSize: 12, fontWeight: '800', color: '#8E8E93', marginBottom: 10 },
  daysRow: { flexDirection: 'row', gap: 8 },
  dayBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F2F2F7' },
  activeDayBadge: { backgroundColor: 'rgba(255,255,255,0.15)' },
  dayText: { fontSize: 12, fontWeight: '800', color: '#000' },
  activeDayText: { color: '#FFF' },
  activeText: { color: '#FFF' },
  activeTextSecondary: { color: 'rgba(255,255,255,0.7)' }
});

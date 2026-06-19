import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import { Search, MapPin, Mail, ChevronRight, Building2 } from 'lucide-react-native';
import { useApiCall } from '../../src/hooks/useApiCall';
import { superAdminService } from '../../src/services/superAdminService';

export default function SuperAdminMembers() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: members, loading } = useApiCall(() => superAdminService.getAllMembers(), []);

  const filteredMembers = (members || []).filter((m: any) => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Global Member Directory" 
        subtitle="All platform trainees"
        showBack={true}
      />

      <View style={styles.searchContainer}>
        <Search color={nebulaGold.colors.text.secondary} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={nebulaGold.colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#000000" style={{ marginTop: 40 }} />
        ) : filteredMembers.length > 0 ? (
          filteredMembers.map((member: any) => (
            <TouchableOpacity key={member.id} style={styles.userCard}>
              <View style={styles.userLeft}>
                <AvatarRing size="md" name={member.name} imageUri={member.profilePhotoUrl} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{member.name}</Text>
                  
                  <View style={styles.detailRow}>
                    <Mail size={12} color="#8E8E93" />
                    <Text style={styles.detailText}>{member.email}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Building2 size={12} color="#8E8E93" />
                    <Text style={styles.detailText}>{member.gym?.name || 'No Gym Assigned'}</Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No members found.</Text>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: nebulaGold.colors.background.primary },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 24, paddingHorizontal: 16, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#EBEBF0', marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#000000', height: '100%' },
  scrollContent: { paddingHorizontal: 24 },
  
  userCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F2F2F7', ...nebulaGold.colors.shadow.light },
  userLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userInfo: { marginLeft: 16, flex: 1 },
  userName: { fontSize: 16, fontWeight: '800', color: '#000000', marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  detailText: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
  
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontWeight: '600' }
});

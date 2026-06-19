import React, { useState, useMemo } from 'react';
import { 
  View, StyleSheet, FlatList, TextInput, Text, 
  TouchableOpacity, ActivityIndicator, RefreshControl, 
  Image, Dimensions 
} from 'react-native';
import { nebulaGold } from '../../../src/theme/nebulaGold';
import { ScreenHeader } from '../../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../../src/components/nebula/GlassCard';
import { StatusBadge } from '../../../src/components/nebula/StatusBadge';
import { Search, Plus, SlidersHorizontal, Info, Star, MapPin } from 'lucide-react-native';
import { useApiCall } from '../../../src/hooks/useApiCall';
import { machineService, Machine } from '../../../src/services/machineService';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { resolvePhotoUrl } from '../../../lib/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2; // Two columns with padding

const FILTERS = ['All', 'Active', 'Maintenance', 'Retired'] as const;
type FilterType = typeof FILTERS[number];

/**
 * TripGlide Machines List - Redesigned to match the "Upcoming Tours" card style.
 */
export default function MachineListScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { data: machines, loading, refreshing, refetch } = useApiCall(
    () => machineService.getAll(), []
  );

  const displayMachines = useMemo(() => {
    if (!machines) return [];
    let filtered = [...machines];

    if (activeFilter !== 'All') {
      filtered = filtered.filter(m => m.status === activeFilter.toUpperCase());
    }

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [machines, activeFilter, searchQuery]);

  const renderMachineItem = ({ item }: { item: Machine }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/(gym)/machines/${item.id}`);
      }}
      style={styles.cardWrapper}
    >
      <View style={[styles.machineCard, nebulaGold.colors.shadow.light]}>
        {/* Image Container with Absolute Overlays */}
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: resolvePhotoUrl(item.imageUrl) || undefined }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Info color="#8E8E93" size={32} />
            </View>
          )}
          

          {/* Top-left badge for Type */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type || 'Gym'}</Text>
          </View>
        </View>

        {/* Card Content Footer */}
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.machineName} numberOfLines={1}>
              {item.name || 'Equipment'}
            </Text>
            <View style={styles.ratingRow}>
              <Star size={12} fill="#000000" color="#000000" />
              <Text style={styles.ratingText}>5.0</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={12} color="#8E8E93" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.serialNumber || 'SN-' + item.id}
            </Text>
          </View>

          <View style={styles.footerRow}>
             <StatusBadge status={item.status} small />
             <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Equipment"
        subtitle="Manage your gym floor"
        rightSlot={
          <TouchableOpacity
            style={styles.addCircle}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(gym)/machines/create');
            }}
          >
            <Plus color="#000000" size={24} />
          </TouchableOpacity>
        }
      />

      {/* Global Search & Filters Cleanup */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search color="#8E8E93" size={20} />
          <TextInput
            placeholder="Search equipment..."
            placeholderTextColor="#C7C7CC"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <SlidersHorizontal color="#000000" size={20} />
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item}
          style={styles.filterList}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setActiveFilter(item);
                Haptics.selectionAsync();
              }}
              style={[
                styles.filterPill,
                activeFilter === item && styles.activeFilterPill
              ]}
            >
              <Text style={[
                styles.filterText,
                activeFilter === item && styles.activeFilterText
              ]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator color="#000000" size="large" />
        </View>
      ) : displayMachines.length === 0 ? (
        <View style={styles.center}>
          <Info color="#8E8E93" size={48} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>No equipment found</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/(gym)/machines/create')}
          >
            <Text style={styles.addBtnText}>Add New Machine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayMachines}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          renderItem={renderMachineItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refetch}
              tintColor="#000000"
            />
          }
        />
      )}
      
      {/* Bottom padding for floating tab bar */}
      <View style={{ height: 100 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  addCircle: {
     width: 44,
     height: 44,
     borderRadius: 22,
     backgroundColor: '#FFFFFF',
     alignItems: 'center',
     justifyContent: 'center',
     ...nebulaGold.colors.shadow.light,
  },
  searchSection: {
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    ...nebulaGold.colors.shadow.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#000000',
  },
  filterList: {
    marginTop: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEBF0',
    ...nebulaGold.colors.shadow.light,
  },
  activeFilterPill: {
    backgroundColor: '#000000',
  },
  filterText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    margin: 10,
  },
  machineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    backgroundColor: '#F2F2F7',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    padding: 12,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginRight: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  qtyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
  },
  addBtn: {
    marginTop: 20,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  }
});

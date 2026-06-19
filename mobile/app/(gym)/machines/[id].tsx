import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Edit2, Plus, Trash2, Calendar, Clock, MapPin, Hash, Info, ChevronRight, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { nebulaGold } from '../../../src/theme/nebulaGold';
import { ScreenHeader } from '../../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../../src/components/nebula/GlassCard';
import { StatusBadge } from '../../../src/components/nebula/StatusBadge';
import { SectionLabel } from '../../../src/components/nebula/SectionLabel';
import { GoldButton } from '../../../src/components/nebula/GoldButton';
import { FormField } from '../../../src/components/nebula/FormField';
import { useApiCall } from '../../../src/hooks/useApiCall';
import { machineService, Machine, AvailabilitySlot } from '../../../src/services/machineService';
import { showToast } from '../../../src/utils/toast';
import { resolvePhotoUrl } from '../../../lib/api';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function MachineDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [submittingSlot, setSubmittingSlot] = useState(false);
  
  // New Slot Form State
  const [newDay, setNewDay] = useState('MONDAY');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [newMax, setNewMax] = useState('1');

  const { data: machine, loading, error, refetch, refreshing } = useApiCall(
    () => machineService.getById(id as string), [id]
  );

  const handleDeleteSlot = (slotId: number) => {
    Alert.alert(
      "Remove Slot",
      "Are you sure you want to remove this availability slot?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              await machineService.deleteSlot(id as string, slotId);
              showToast('Slot removed', 'info');
              refetch();
            } catch (e: any) {
              showToast(e.message || 'Failed to remove slot', 'error');
            }
          }
        }
      ]
    );
  };

  const handleAddSlot = async () => {
    setSubmittingSlot(true);
    try {
      await machineService.addSlot(id as string, {
        dayOfWeek: newDay,
        startTime: newStart,
        endTime: newEnd,
        maxBookings: parseInt(newMax)
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Slot added successfully', 'success');
      setSlotModalVisible(false);
      refetch();
    } catch (e: any) {
      showToast(e.response?.data?.message || e.message || 'Failed to add slot', 'error');
    } finally {
      setSubmittingSlot(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Machine Details" showBack={true} />
        <View style={styles.center}>
          <ActivityIndicator color={nebulaGold.colors.gold.primary} size="large" />
        </View>
      </View>
    );
  }

  if (error || !machine) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Error" showBack={true} />
        <View style={styles.center}>
          <Info color="#E74C3C" size={48} />
          <Text style={styles.errorText}>{error || "Machine not found"}</Text>
          <GoldButton title="Go Back" onPress={() => router.back()} style={{ marginTop: 20 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={machine.name} 
        showBack={true}
        rightSlot={
          <TouchableOpacity onPress={() => router.push(`/(gym)/machines/edit/${id}`)}>
            <Edit2 color={nebulaGold.colors.gold.primary} size={20} />
          </TouchableOpacity>
        }
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={nebulaGold.colors.gold.primary} />}
      >
        {/* Machine Header Card */}
        <GlassCard style={styles.headerCard}>
          <View style={styles.imageSection}>
            {machine.imageUrl ? (
              <Image 
                source={{ uri: resolvePhotoUrl(machine.imageUrl) || undefined }} 
                style={styles.headerImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Info color={nebulaGold.colors.text.muted} size={48} />
              </View>
            )}
            <View style={styles.badgeContainer}>
              <StatusBadge status={machine.status} />
            </View>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{machine.name}</Text>
            <Text style={styles.type}>{machine.type}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{machine.quantity}</Text>
              <Text style={styles.statLabel}>Total Qty</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{machine.totalBookingsToday || 0}</Text>
              <Text style={styles.statLabel}>Bookings Today</Text>
            </View>
          </View>
        </GlassCard>

        <SectionLabel label="SPECIFICATIONS" />
        <GlassCard style={styles.detailCard}>
          {machine.description && (
            <View style={styles.descriptionBox}>
              <Text style={styles.description}>{machine.description}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MapPin size={18} color={nebulaGold.colors.gold.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{(machine as any).locationInGym || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Hash size={18} color={nebulaGold.colors.gold.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Serial Number</Text>
              <Text style={styles.infoValue}>{(machine as any).serialNumber || 'N/A'}</Text>
            </View>
          </View>
        </GlassCard>

        <View style={styles.sectionHeader}>
          <SectionLabel label="AVAILABILITY SLOTS" />
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => setSlotModalVisible(true)}
          >
            <Plus size={16} color={nebulaGold.colors.gold.primary} />
            <Text style={styles.addBtnText}>Add Slot</Text>
          </TouchableOpacity>
        </View>

        {(!machine.availabilitySlots || machine.availabilitySlots.length === 0) ? (
          <GlassCard style={styles.emptySlots}>
            <Calendar size={32} color={nebulaGold.colors.text.muted} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No availability slots configured</Text>
            <Text style={styles.emptySubtext}>Configure slots to allow members to book this machine.</Text>
          </GlassCard>
        ) : (
          machine.availabilitySlots.map((slot: AvailabilitySlot) => (
            <GlassCard key={slot.id} style={styles.slotCard}>
              <View style={styles.slotMain}>
                <View style={styles.slotTime}>
                  <Text style={styles.slotDay}>{slot.dayOfWeek}</Text>
                  <View style={styles.timeRow}>
                    <Clock size={14} color={nebulaGold.colors.text.secondary} />
                    <Text style={styles.timeText}>{slot.startTime} - {slot.endTime}</Text>
                  </View>
                </View>
                
                <View style={styles.slotBookings}>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${(slot.currentBookings / slot.maxBookings) * 100}%` },
                          slot.currentBookings >= slot.maxBookings && { backgroundColor: '#E74C3C' }
                        ]} 
                      />
                    </View>
                    <Text style={styles.bookingCount}>
                      {slot.currentBookings} / {slot.maxBookings}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => handleDeleteSlot(slot.id)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={18} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>

      {/* Add Slot Modal */}
      <Modal
        visible={slotModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Availability Slot</Text>
            
            <SectionLabel label="DAY OF WEEK" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPicker}>
              {DAYS.map(day => (
                <TouchableOpacity 
                  key={day}
                  onPress={() => setNewDay(day)}
                  style={[styles.dayPill, newDay === day && styles.activeDayPill]}
                >
                  <Text style={[styles.dayText, newDay === day && styles.activeDayText]}>
                    {day.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <View style={{ flex: 1 }}>
                <FormField label="Start Time" value={newStart} onChangeText={setNewStart} placeholder="09:00" />
              </View>
              <View style={{ flex: 1 }}>
                <FormField label="End Time" value={newEnd} onChangeText={setNewEnd} placeholder="10:00" />
              </View>
            </View>

            <FormField 
              label="Max Bookings" 
              value={newMax} 
              onChangeText={setNewMax} 
              keyboardType="number-pad"
              placeholder="1"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSlotModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <GoldButton title="Add Slot" onPress={handleAddSlot} loading={submittingSlot} />
              </View>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 20,
  },
  imageSection: {
    height: 200,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  headerInfo: {
    padding: 20,
    alignItems: 'center',
  },
  name: {
    ...nebulaGold.typography.heading2,
    color: nebulaGold.colors.text.primary,
    textAlign: 'center',
  },
  type: {
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.text.secondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: nebulaGold.colors.gold.primary,
  },
  statLabel: {
    fontSize: 12,
    color: nebulaGold.colors.text.secondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  detailCard: {
    padding: 20,
    marginBottom: 20,
  },
  descriptionBox: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  description: {
    fontSize: 14,
    color: nebulaGold.colors.text.secondary,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(201,168,76,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: nebulaGold.colors.text.muted,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    color: nebulaGold.colors.text.primary,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(201,168,76,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: nebulaGold.colors.gold.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  emptySlots: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: nebulaGold.colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    color: nebulaGold.colors.text.secondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  slotCard: {
    padding: 14,
    marginBottom: 10,
  },
  slotMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotTime: {
    flex: 2,
  },
  slotDay: {
    fontSize: 14,
    fontWeight: '700',
    color: nebulaGold.colors.text.primary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: nebulaGold.colors.text.secondary,
  },
  slotBookings: {
    flex: 3,
    paddingHorizontal: 12,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: nebulaGold.colors.gold.primary,
  },
  bookingCount: {
    fontSize: 10,
    color: nebulaGold.colors.text.muted,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  errorText: {
    color: nebulaGold.colors.text.primary,
    fontSize: 16,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: nebulaGold.colors.gold.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  dayPicker: {
    marginVertical: 10,
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeDayPill: {
    backgroundColor: 'rgba(201,168,76,0.2)',
    borderColor: nebulaGold.colors.gold.primary,
  },
  dayText: {
    color: nebulaGold.colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  activeDayText: {
    color: nebulaGold.colors.gold.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelBtnText: {
    color: nebulaGold.colors.text.secondary,
    fontWeight: '600',
  }
});

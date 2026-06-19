import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { nebulaGold } from '../../theme/nebulaGold';
import { ScreenHeader } from '../../components/nebula/ScreenHeader';
import { GoldButton } from '../../components/nebula/GoldButton';
import { Calendar, Clock, Dumbbell, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useApiCall } from '../../hooks/useApiCall';
import { machineService, Machine } from '../../services/machineService';
import { machineBookingService } from '../../services/machineBookingService';
import { useAuthStore } from '../../../store/authStore';
import DateTimePicker from '@react-native-community/datetimepicker';

interface GymSettings {
  openingTime: string;
  closingTime: string;
}

export function BookMachineScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date(new Date().setHours(10, 0, 0, 0)));
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(11, 0, 0, 0)));
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const [gymSettings, setGymSettings] = useState<GymSettings | null>(null);

  const { data: machinesData, loading: machinesLoading } = useApiCall(
    () => machineService.getAll(),
    [user?.gymId]
  );

  // Fetch gym settings
  React.useEffect(() => {
    const fetchGymSettings = async () => {
      if (!token) return;
      try {
        const response = await fetch(`http://localhost:8080/api/gym/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (response.ok) {
          const data = await response.json();
          setGymSettings(data);
        }
      } catch (error) {
        console.log('Could not fetch gym settings');
      }
    };

    if (user?.gymId && token) {
      fetchGymSettings();
    }
  }, [user?.gymId, token]);

  const machines: Machine[] = Array.isArray(machinesData)
    ? machinesData
    : Array.isArray(machinesData?.data)
    ? machinesData.data
    : [];

  const handleDateChange = (_event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  const handleStartTimeChange = (_event: any, time?: Date) => {
    if (time) {
      setStartTime(time);
    }
    setShowStartTimePicker(false);
  };

  const handleEndTimeChange = (_event: any, time?: Date) => {
    if (time) {
      setEndTime(time);
    }
    setShowEndTimePicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeForApi = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const parseTimeString = (timeStr: string): Date => {
    if (!timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const gymOpeningTime = gymSettings ? parseTimeString(gymSettings.openingTime) : null;
  const gymClosingTime = gymSettings ? parseTimeString(gymSettings.closingTime) : null;

  const isTimeWithinGymHours = (time: Date): boolean => {
    if (!gymOpeningTime || !gymClosingTime) return true;
    return time >= gymOpeningTime && time <= gymClosingTime;
  };

  const handleBookMachine = async () => {
    if (!selectedMachineId) {
      Alert.alert('Error', 'Please select a machine');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    if (!isTimeWithinGymHours(startTime) || !isTimeWithinGymHours(endTime)) {
      const openTime = gymOpeningTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) || '6:00 AM';
      const closeTime = gymClosingTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) || '10:00 PM';
      Alert.alert('Invalid Time', `Bookings must be within gym hours: ${openTime} - ${closeTime}`);
      return;
    }

    setIsBooking(true);
    try {
      await machineBookingService.bookMachine({
        machineId: selectedMachineId,
        bookingDate: formatDateForApi(selectedDate),
        startTime: formatTimeForApi(startTime),
        endTime: formatTimeForApi(endTime),
      });

      Alert.alert('Success', 'Machine booked successfully!', [
        {
          text: 'OK',
          onPress: () => router.push('/(trainee)/home'),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Booking Failed',
        error?.response?.data?.message || error.message || 'Could not book machine'
      );
    } finally {
      setIsBooking(false);
    }
  };

  const isTimeSlotConflict = (machine: Machine) => {
    if (!machine.availabilitySlots || machine.availabilitySlots.length === 0) {
      return false;
    }

    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const slot = machine.availabilitySlots.find(
      (s) => s.dayOfWeek === dayOfWeek && s.isActive
    );

    if (!slot) return true;

    const slotStart = new Date(`2000-01-01 ${slot.startTime}`);
    const slotEnd = new Date(`2000-01-01 ${slot.endTime}`);
    const userStart = new Date(`2000-01-01 ${formatTimeForApi(startTime)}`);
    const userEnd = new Date(`2000-01-01 ${formatTimeForApi(endTime)}`);

    return userStart < slotStart || userEnd > slotEnd || slot.isFull;
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Book Machine"
        subtitle="Select date, time, and machine"
        showBack={true}
        onBackPress={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {gymSettings && (
          <View style={styles.gymHoursBox}>
            <Text style={styles.gymHoursLabel}>Gym Hours</Text>
            <Text style={styles.gymHoursValue}>
              {gymSettings.openingTime} - {gymSettings.closingTime}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color={nebulaGold.colors.gold.primary} />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
            <ChevronRight size={20} color={nebulaGold.colors.gold.primary} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color={nebulaGold.colors.gold.primary} />
            <Text style={styles.sectionTitle}>Select Time</Text>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>{formatTime(startTime)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeSeparator}>
              <Text style={styles.timeSeparatorText}>to</Text>
            </View>

            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>End Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>{formatTime(endTime)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="spinner"
              onChange={handleStartTimeChange}
            />
          )}

          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display="spinner"
              onChange={handleEndTimeChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Dumbbell size={18} color={nebulaGold.colors.gold.primary} />
            <Text style={styles.sectionTitle}>Select Machine</Text>
          </View>

          {!user?.gymId ? (
            <Text style={styles.errorText}>
              ⚠️ You need to be assigned to a gym to book machines. Please contact your admin.
            </Text>
          ) : machinesLoading ? (
            <ActivityIndicator size="large" color="#000000" style={{ marginTop: 20 }} />
          ) : machines.length === 0 ? (
            <Text style={styles.emptyText}>No machines available in your gym</Text>
          ) : (
            machines.map((machine) => {
              const hasConflict = isTimeSlotConflict(machine);
              const isSelected = selectedMachineId === machine.id;

              return (
                <TouchableOpacity
                  key={machine.id}
                  style={[
                    styles.machineCard,
                    isSelected && styles.machineCardSelected,
                    hasConflict && styles.machineCardDisabled,
                  ]}
                  onPress={() => !hasConflict && setSelectedMachineId(machine.id)}
                  disabled={hasConflict}
                >
                  <View style={styles.machineHeader}>
                    <View style={styles.machineInfo}>
                      <Text style={[styles.machineName, hasConflict && styles.machineNameDisabled]}>
                        {machine.name}
                      </Text>
                      <Text style={[styles.machineType, hasConflict && styles.machineTypeDisabled]}>
                        {machine.type} • {machine.locationInGym || 'Gym'}
                      </Text>
                    </View>

                    {hasConflict ? (
                      <View style={styles.conflictBadge}>
                        <AlertCircle size={16} color="#FF3B30" />
                        <Text style={styles.conflictText}>Booked</Text>
                      </View>
                    ) : (
                      <View style={styles.availableBadge}>
                        <CheckCircle2 size={16} color="#34C759" />
                        <Text style={styles.availableText}>Available</Text>
                      </View>
                    )}
                  </View>

                  {hasConflict && (
                    <Text style={styles.conflictMessage}>
                      ❌ Machine is booked for this date and time
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <GoldButton
          title={isBooking ? 'Booking...' : 'Book Machine'}
          onPress={handleBookMachine}
          disabled={isBooking || !selectedMachineId || !user?.gymId}
          style={{ height: 56 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  scrollContent: {
    padding: 24,
  },
  gymHoursBox: {
    backgroundColor: nebulaGold.colors.gold.primary + '15',
    borderLeftWidth: 4,
    borderLeftColor: nebulaGold.colors.gold.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  gymHoursLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  gymHoursValue: {
    fontSize: 16,
    fontWeight: '700',
    color: nebulaGold.colors.gold.primary,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: nebulaGold.colors.gold.primary,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  timeColumn: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
  },
  timeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: nebulaGold.colors.gold.primary,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  timeSeparator: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timeSeparatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  machineCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F2F2F7',
    marginBottom: 12,
  },
  machineCardSelected: {
    borderColor: nebulaGold.colors.gold.primary,
    backgroundColor: nebulaGold.colors.gold.primary + '08',
  },
  machineCardDisabled: {
    opacity: 0.6,
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  machineNameDisabled: {
    color: '#8E8E93',
  },
  machineType: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  machineTypeDisabled: {
    color: '#C7C7CC',
  },
  conflictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FF3B3015',
  },
  conflictText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3B30',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#34C75915',
  },
  availableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },
  conflictMessage: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
  },
});

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { ArrowLeft, Cpu, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, X, Dumbbell, CalendarCheck, Clock } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { sessionService } from '../../src/services/sessionService';

enum MachineStatus {
    ACTIVE = 'ACTIVE',
    AVAILABLE = 'AVAILABLE', // Fallback support
    OCCUPIED = 'OCCUPIED',
    MAINTENANCE = 'MAINTENANCE',
    OUT_OF_ORDER = 'OUT_OF_ORDER',
    RETIRED = 'RETIRED'
}

interface Machine {
    id: number;
    name: string;
    type: string;
    status: MachineStatus;
}

export default function MachinesScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuthStore();
    const { bookingSessionId, traineeName } = useLocalSearchParams();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

    const [machines, setMachines] = useState<Machine[]>([]);
    const [sessionInfo, setSessionInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
    const [machineForm, setMachineForm] = useState({ name: '', type: '', status: MachineStatus.AVAILABLE });

    const fetchMachines = useCallback(async () => {
        try {
            const res = await api.get('/machines');
            setMachines(res.data);
        } catch (error) {
            console.error('Failed to fetch machines', error);
            Alert.alert('Protocol Error', 'Failed to synchronize with hardware layer.');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    const fetchSessionInfo = useCallback(async () => {
        if (!bookingSessionId) return;
        try {
            // We need a way to get a single session, or use the list and filter
            const sessions = await sessionService.getAll();
            const session = sessions.find((s: any) => s.id === Number(bookingSessionId));
            if (session) {
                setSessionInfo(session);
            }
        } catch (error) {
            console.error('Failed to fetch session info', error);
        }
    }, [bookingSessionId]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        await Promise.all([fetchMachines(), fetchSessionInfo()]);
        setIsLoading(false);
    }, [fetchMachines, fetchSessionInfo]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMachines();
    };

    const handleSaveMachine = async () => {
        if (!machineForm.name || !machineForm.type) {
            Alert.alert('Incomplete Data', 'Please specify machine name and type.');
            return;
        }

        try {
            if (editingMachine) {
                await api.put(`/machines/${editingMachine.id}`, machineForm);
            } else {
                await api.post('/machines', { ...machineForm, gym: { id: user?.gymId } });
            }
            setIsModalOpen(false);
            setEditingMachine(null);
            setMachineForm({ name: '', type: '', status: MachineStatus.AVAILABLE });
            fetchMachines();
        } catch (error) {
            console.error('Failed to save machine', error);
            Alert.alert('Save Error', 'Failed to push configuration to hardware layer.');
        }
    };

    const handleBookForSession = async (machineId: number) => {
        try {
            await sessionService.bookMachine(Number(bookingSessionId), machineId);
            Alert.alert('Success', 'Hardware asset locked for your session.');
            router.back();
        } catch (error: any) {
            console.error('Failed to book machine', error);
            if (error.response?.status === 409) {
                Alert.alert('Temporal Conflict', 'This machine is already anchored to another mission during this temporal window. Please select another asset or adjust the session time.');
            } else {
                Alert.alert('Booking Error', 'Hardware is currently unavailable or access was denied.');
            }
        }
    };
    const handleDeleteMachine = (id: number) => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to decommission this asset?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Decommission', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/machines/${id}`);
                            fetchMachines();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to decommission asset.');
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (machine: Machine) => {
        setEditingMachine(machine);
        setMachineForm({ name: machine.name, type: machine.type, status: machine.status });
        setIsModalOpen(true);
    };

    const StatusBadge = ({ status }: { status: MachineStatus }) => {
        const config: Record<string, { color: string, text: string }> = {
            [MachineStatus.ACTIVE]: { color: '#f59e0b', text: 'Available' },
            [MachineStatus.AVAILABLE]: { color: '#f59e0b', text: 'Available' },
            [MachineStatus.OCCUPIED]: { color: '#8b5cf6', text: 'In Use' },
            [MachineStatus.MAINTENANCE]: { color: '#f59e0b', text: 'Maintenance' },
            [MachineStatus.OUT_OF_ORDER]: { color: '#ef4444', text: 'Offline' },
            [MachineStatus.RETIRED]: { color: '#ef4444', text: 'Retired' }
        };
        
        const currentConfig = config[status] || config[MachineStatus.AVAILABLE];
        const { color, text } = currentConfig;
        
        return (
            <View className="flex-row items-center bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                <View style={{ backgroundColor: color }} className="h-1.5 w-1.5 rounded-full mr-2" />
                <Text style={{ color }} className="text-[9px] font-black uppercase tracking-widest">{text}</Text>
            </View>
        );
    };

    if (isLoading && !refreshing) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator color={nebulaGold.colors.gold.primary} size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: nebulaGold.colors.background.primary }}>
            <ScreenHeader 
                title={bookingSessionId ? "Select Equipment" : "Manage Machines"} 
                subtitle={bookingSessionId ? `Setting Up ${String(traineeName).toUpperCase()}'S Session` : "Gym Hardware Registry"}
                transparent={false}
            />

            {bookingSessionId && sessionInfo && (
                <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
                    <View className="flex-row items-center bg-white p-4 rounded-2xl" style={nebulaGold.colors.shadow.light}>
                        <Clock size={16} color="#007AFF" />
                        <Text className="text-black font-bold text-xs ml-3">
                            {new Date(sessionInfo.sessionDate).toLocaleDateString()} | {sessionInfo.startTime.substring(0, 5)} - {sessionInfo.endTime.substring(0, 5)}
                        </Text>
                    </View>
                </View>
            )}
            {isAdmin && !bookingSessionId && (
                <TouchableOpacity 
                    onPress={() => { setEditingMachine(null); setMachineForm({ name: '', type: '', status: MachineStatus.AVAILABLE }); setIsModalOpen(true); }}
                    style={{ position: 'absolute', right: 24, top: insets.top + 8, zIndex: 100 }}
                    className="h-12 w-12 bg-black rounded-2xl items-center justify-center shadow-md"
                >
                    <Plus size={24} color="#FFFFFF" />
                </TouchableOpacity>
            )}

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#f59e0b" />
                </View>
            ) : (
                <FlatList
                    data={machines}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
                    renderItem={({ item }) => (
                        <View className="p-5 mb-5 bg-white rounded-3xl border border-gray-100" style={nebulaGold.colors.shadow.light}>
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <View className="h-10 w-10 bg-gray-50 rounded-xl items-center justify-center mr-4 border border-gray-100">
                                        <Cpu size={20} color="#000000" />
                                    </View>
                                    <View>
                                        <Text className="text-black font-bold text-sm tracking-tight">{item.name}</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">{item.type}</Text>
                                    </View>
                                </View>
                                <StatusBadge status={item.status} />
                            </View>
                            
                            {isAdmin && !bookingSessionId && (
                                <View className="flex-row justify-end space-x-3 mt-4 pt-4 border-t border-gray-50">
                                    <TouchableOpacity onPress={() => openEditModal(item)} className="h-10 w-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100">
                                        <Edit2 size={16} color="#000000" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteMachine(item.id)} className="h-10 w-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100">
                                        <Trash2 size={16} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {bookingSessionId && (item.status === MachineStatus.AVAILABLE || item.status === MachineStatus.ACTIVE) && (
                                <TouchableOpacity 
                                    onPress={() => handleBookForSession(item.id)}
                                    className="flex-row items-center justify-center bg-black h-12 rounded-2xl mt-4"
                                >
                                    <CalendarCheck size={18} color="#FFFFFF" className="mr-3" />
                                    <Text className="text-white font-black uppercase tracking-widest text-[10px]">LOCK MACHINE</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="py-20 items-center">
                            <Dumbbell size={48} color="#64748b" className="opacity-20 mb-4" />
                            <Text className="text-text-muted font-bold text-xs uppercase tracking-[2px]">No Assets Detected</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={isModalOpen} transparent animationType="fade">
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white p-8 rounded-t-[40px]" style={nebulaGold.colors.shadow.light}>
                        <View className="flex-row justify-between items-center mb-10">
                            <Text className="text-black text-xl font-bold">{editingMachine ? 'Edit Machine' : 'Add Machine'}</Text>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                                <X size={24} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-6">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3 ml-1">Machine Name</Text>
                            <TextInput
                                className="bg-gray-50 h-14 rounded-2xl px-5 text-black font-bold border border-gray-100"
                                placeholder="e.g. Matrix Treadmill X1"
                                placeholderTextColor="#C7C7CC"
                                value={machineForm.name}
                                onChangeText={text => setMachineForm(prev => ({ ...prev, name: text }))}
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3 ml-1">Type</Text>
                            <TextInput
                                className="bg-gray-50 h-14 rounded-2xl px-5 text-black font-bold border border-gray-100"
                                placeholder="e.g. Cardio / Strength"
                                placeholderTextColor="#C7C7CC"
                                value={machineForm.type}
                                onChangeText={text => setMachineForm(prev => ({ ...prev, type: text }))}
                            />
                        </View>

                        <View className="mb-10">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4 ml-1">Status</Text>
                            <View className="flex-row flex-wrap">
                                {Object.values(MachineStatus).map(s => (
                                    <TouchableOpacity 
                                        key={s}
                                        onPress={() => setMachineForm(prev => ({ ...prev, status: s }))}
                                        className={`px-4 py-2.5 rounded-xl mr-3 mb-3 border ${machineForm.status === s ? 'bg-black border-black' : 'bg-gray-50 border-gray-100'}`}
                                    >
                                        <Text className={`text-[10px] font-bold uppercase tracking-widest ${machineForm.status === s ? 'text-white' : 'text-gray-400'}`}>{s.replace('_', ' ')}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity 
                            onPress={handleSaveMachine}
                            className="bg-black h-16 rounded-2xl items-center justify-center shadow-lg active:opacity-90"
                        >
                            <Text className="text-white font-bold uppercase tracking-widest">Save Machine</Text>
                        </TouchableOpacity>
                        <View style={{ height: insets.bottom + 20 }} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

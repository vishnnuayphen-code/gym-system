import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { User as UserIcon, Calendar, Search, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Check, Menu, Shield, Activity } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api, { resolvePhotoUrl } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { GlassCard } from '@/components/GlassCard';

interface Trainee {
    id: number;
    name: string;
    email?: string;
    profilePhotoUrl?: string;
    attendanceStatus?: 'PRESENT' | 'ABSENT' | 'EXCUSED' | null;
}

export default function AttendanceScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const { user } = useAuthStore();
    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [markingId, setMarkingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isCoach = user?.role === 'COACH';

    const fetchData = useCallback(async () => {
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const [traineesRes, attendanceRes] = await Promise.all([
                api.get(isCoach ? '/coaches/me/trainees' : '/trainees'),
                api.get(`/attendance/date/${dateStr}`)
            ]);

            const attendanceMap = new Map();
            attendanceRes.data.forEach((a: any) => {
                attendanceMap.set(a.traineeId, a.status);
            });

            const traineesWithStatus = (traineesRes.data?.data || traineesRes.data || []).map((t: any) => ({
                ...t,
                attendanceStatus: attendanceMap.get(t.id) || null
            }));

            setTrainees(traineesWithStatus);
        } catch (err) {
            console.error("Failed to fetch attendance data", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [isCoach, selectedDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleMarkAttendance = async (traineeId: number, status: 'PRESENT' | 'ABSENT') => {
        try {
            setMarkingId(traineeId);
            await api.post('/attendance', {
                traineeId,
                attendanceDate: format(selectedDate, 'yyyy-MM-dd'),
                status
            });
            
            setTrainees(prev => prev.map(t => 
                t.id === traineeId ? { ...t, attendanceStatus: status } : t
            ));
        } catch (err) {
            console.error("Failed to mark attendance", err);
        } finally {
            setMarkingId(null);
        }
    };

    const filteredTrainees = trainees.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderTrainee = ({ item }: { item: Trainee }) => (
        <TouchableOpacity activeOpacity={0.8} className="mb-4 mx-6">
            <GlassCard className="p-5 border-white/5 flex-row items-center" intensity="low">
                <View className="flex-row items-center flex-1 mr-4">
                    <View className="h-14 w-14 rounded-2xl overflow-hidden bg-white/5 border border-white/10 items-center justify-center">
                        {resolvePhotoUrl(item.profilePhotoUrl) ? (
                            <Image 
                                source={{ uri: resolvePhotoUrl(item.profilePhotoUrl)! }} 
                                className="w-full h-full"
                            />
                        ) : (
                            <UserIcon size={24} color="#f59e0b" className="opacity-70" />
                        )}
                    </View>
                    <View className="flex-1 ml-5">
                        <Text className="text-sm font-black text-white tracking-tight uppercase" numberOfLines={1}>{item.name}</Text>
                        <View className="flex-row items-center mt-2">
                            <View className={`h-1.5 w-1.5 rounded-full mr-2 shadow-sm ${item.attendanceStatus === 'PRESENT' ? 'bg-emerald-400 shadow-emerald-400/50' : item.attendanceStatus === 'ABSENT' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-white/20'}`} />
                            <Text className="text-[8px] text-text-secondary font-black uppercase tracking-[2.5px] opacity-60">
                                {item.attendanceStatus ? item.attendanceStatus : 'UPLINK PENDING'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row space-x-3">
                    <TouchableOpacity 
                        onPress={() => handleMarkAttendance(item.id, 'PRESENT')}
                        disabled={markingId === item.id}
                        className={`h-11 w-11 rounded-xl items-center justify-center border ${item.attendanceStatus === 'PRESENT' ? 'bg-amber-500/20 border-amber-500/50' : 'bg-white/5 border-white/10'}`}
                    >
                        {markingId === item.id && item.attendanceStatus !== 'PRESENT' ? (
                            <ActivityIndicator size="small" color="#34d399" />
                        ) : (
                            <Check size={20} color={item.attendanceStatus === 'PRESENT' ? '#34d399' : '#475569'} strokeWidth={3} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => handleMarkAttendance(item.id, 'ABSENT')}
                        disabled={markingId === item.id}
                        className={`h-11 w-11 rounded-xl items-center justify-center border ${item.attendanceStatus === 'ABSENT' ? 'bg-rose-500/20 border-rose-500/50' : 'bg-white/5 border-white/10'}`}
                    >
                         <XCircle size={20} color={item.attendanceStatus === 'ABSENT' ? '#f43f5e' : '#475569'} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </GlassCard>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-obsidian">
            <LinearGradient
                colors={['#1a1d24', '#0f1115']}
                className="absolute inset-0"
            />
            
            <View
                style={{ 
                    paddingTop: Math.max(insets.top, 20) + 12,
                    paddingBottom: 24,
                    paddingHorizontal: 24,
                }}
            >
                <View className="flex-row items-center justify-between mb-8">
                    <View className="flex-row items-center">
                        <TouchableOpacity 
                            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                            className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10 active:bg-white/15"
                        >
                            <Menu size={22} color="#ffffff" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">OPERATIONAL LOG</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Neural Sync</Text>
                        </View>
                    </View>
                </View>

                <GlassCard className="p-2 border-white/5 flex-row items-center justify-between mb-6" intensity="low">
                    <TouchableOpacity 
                        onPress={() => setSelectedDate(subDays(selectedDate, 1))}
                        className="h-10 w-10 items-center justify-center bg-white/5 rounded-xl border border-white/10 active:bg-white/15"
                    >
                        <ChevronLeft size={20} color="#ffffff" />
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                        <Calendar size={14} color="#f59e0b" className="mr-3 opacity-70" />
                        <Text className="text-white font-black text-[11px] uppercase tracking-[2.5px]">
                            {format(selectedDate, 'MMM dd, yyyy').toUpperCase()}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => setSelectedDate(addDays(selectedDate, 1))}
                        className="h-10 w-10 items-center justify-center bg-white/5 rounded-xl border border-white/10 active:bg-white/15"
                    >
                        <ChevronRight size={20} color="#ffffff" />
                    </TouchableOpacity>
                </GlassCard>

                <GlassCard className="flex-row items-center px-5 h-14 border-white/5" intensity="medium">
                    <Search size={18} color="#64748b" className="mr-4" />
                    <TextInput 
                        placeholder="SEARCH OPERATIVES..."
                        placeholderTextColor="#475569"
                        className="flex-1 text-[11px] font-black text-white tracking-[1px]"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm !== '' && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <XCircle size={18} color="#475569" />
                        </TouchableOpacity>
                    )}
                </GlassCard>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="small" color="#f59e0b" />
                </View>
            ) : (
                <FlatList
                    data={filteredTrainees}
                    renderItem={renderTrainee}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center pt-20 px-8">
                            <GlassCard className="p-12 items-center w-full" intensity="medium">
                                <View className="h-20 w-20 bg-white/5 rounded-3xl items-center justify-center mb-8 border border-white/10 shadow-2xl">
                                    <Shield size={36} color="#64748b" />
                                </View>
                                <Text className="text-2xl font-black text-white tracking-tighter mb-4 text-center uppercase">
                                    Null Entry
                                </Text>
                                <Text className="text-text-secondary text-center text-[10px] font-black tracking-widest leading-relaxed opacity-60">
                                    {searchTerm ? `NO DATA MATCHING "${searchTerm.toUpperCase()}"` : "NO LOGS REGISTERED FOR THIS TEMPORAL VECTOR."}
                                </Text>
                            </GlassCard>
                        </View>
                    }
                />
            )}
        </View>
    );
}

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Mail, Award, Clock, Star, Phone, MapPin, User, ChevronRight, Activity, Target, Ruler, Weight, Calendar, Shield, Zap } from 'lucide-react-native';
import { format } from 'date-fns';
import api, { resolvePhotoUrl } from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

interface TraineeDetails {
    id: number;
    name: string;
    email: string;
    fitnessGoal: string;
    height: number;
    weight: number;
    profilePhotoUrl?: string;
    joinedDate?: string;
}

interface AttendanceRecord {
    id: number;
    attendanceDate: string;
    status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
}

export default function TraineeDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [trainee, setTrainee] = useState<TraineeDetails | null>(null);
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = React.useCallback(async () => {
        try {
            const [res, attRes] = await Promise.all([
                api.get(`/trainees/${id}`),
                api.get(`/attendance/trainee/${id}`)
            ]);
            setTrainee(res.data);
            setAttendanceHistory(attRes.data);
        } catch (err) {
            console.error("Failed to fetch trainee details", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const bmi = trainee && trainee.height && trainee.weight
        ? (trainee.weight / Math.pow(trainee.height / 100, 2)).toFixed(1)
        : null;

    const bmiCategory = bmi
        ? Number(bmi) < 18.5 ? "Lean"
            : Number(bmi) < 25 ? "Optimal"
                : Number(bmi) < 30 ? "Elevated"
                    : "High Alert"
        : null;

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-obsidian">
                <ActivityIndicator size="small" color="#f59e0b" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-obsidian">
            <LinearGradient
                colors={['#1a1d24', '#0f1115']}
                className="absolute inset-0"
            />
            
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
            >
                {/* Profile Header Block */}
                <View
                    className="px-7 pb-10"
                    style={{ paddingTop: Math.max(insets.top, 24) + 12 }}
                >
                    <View className="flex-row justify-between items-center mb-10">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10 active:bg-white/15"
                        >
                            <ArrowLeft size={22} color="#ffffff" />
                        </TouchableOpacity>
                        <GlassCard className="px-5 py-2 border-white/10" intensity="low">
                            <Text className="text-primary font-black text-[9px] uppercase tracking-[3px]">ASSET DATA</Text>
                        </GlassCard>
                    </View>

                    <View className="flex-row items-center mb-10 px-1">
                        <View className="relative">
                            <LinearGradient
                                colors={['#f59e0b', '#0ea5e9']}
                                className="absolute -inset-1 rounded-[38px] opacity-20 blur-sm"
                            />
                            <View className="h-28 w-28 bg-obsidian rounded-[32px] items-center justify-center border border-white/10 overflow-hidden shadow-2xl">
                                {resolvePhotoUrl(trainee?.profilePhotoUrl) ? (
                                    <Image
                                        source={{ uri: resolvePhotoUrl(trainee?.profilePhotoUrl)! }}
                                        className="w-full h-full"
                                        style={{ resizeMode: 'cover' }}
                                    />
                                ) : (
                                    <User size={48} color="#f59e0b" className="opacity-70" />
                                )}
                            </View>
                        </View>

                        <View className="ml-8 flex-1">
                            <Text className="text-white text-3xl font-black tracking-tighter leading-none mb-3 uppercase">
                                {trainee?.name}
                            </Text>
                            <View className="flex-row items-center">
                                <Target size={14} color="#f59e0b" className="mr-3 opacity-60" />
                                <Text className="text-text-secondary font-black text-[10px] uppercase tracking-[1.5px] opacity-70">
                                    {trainee?.fitnessGoal}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row justify-between">
                        <GlassCard className="px-5 py-4 border-white/5 flex-row items-center flex-1 mr-4" intensity="low">
                            <Calendar size={18} color="#f59e0b" className="opacity-60" style={{ marginRight: 15 }} />
                            <View>
                                <Text className="text-text-muted text-[8px] font-black uppercase tracking-[2.5px] mb-1">ESTABLISHED</Text>
                                <Text className="text-white text-xs font-black tracking-tight" numberOfLines={1}>
                                    {trainee?.joinedDate ? format(new Date(trainee.joinedDate), 'MMM yyyy').toUpperCase() : 'N/A'}
                                </Text>
                            </View>
                        </GlassCard>
                        <GlassCard className="px-5 py-4 border-white/5 flex-row items-center flex-1" intensity="low">
                            <Activity size={18} color="#a855f7" className="opacity-60" style={{ marginRight: 15 }} />
                            <View>
                                <Text className="text-text-muted text-[8px] font-black uppercase tracking-[2.5px] mb-1">BMI RATIO</Text>
                                <Text className="text-white text-xs font-black tracking-tight">{bmi ?? '—'}</Text>
                            </View>
                        </GlassCard>
                    </View>
                </View>

                <View className="px-7">
                    {/* Biometric Analysis Section */}
                    <View className="mb-10">
                        <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] mb-6 ml-1 opacity-60">Biometric Telemetry</Text>
                        <GlassCard className="p-8 border-white/5" intensity="high">
                            <View className="flex-row justify-between mb-10">
                                <View className="items-center flex-1">
                                    <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mb-4 border border-white/10">
                                        <Ruler size={22} color="#f59e0b" />
                                    </View>
                                    <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-2 opacity-60">Vertical</Text>
                                    <Text className="text-xl font-black text-white tracking-tighter">{trainee?.height} CM</Text>
                                </View>
                                <View className="w-[1px] bg-white/5 h-full mx-4" />
                                <View className="items-center flex-1">
                                    <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mb-4 border border-white/10">
                                        <Weight size={22} color="#a855f7" />
                                    </View>
                                    <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-2 opacity-60">Mass</Text>
                                    <Text className="text-xl font-black text-white tracking-tighter">{trainee?.weight} KG</Text>
                                </View>
                            </View>

                            <View className="bg-white/5 p-5 rounded-2xl border border-white/5 flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="h-2 w-2 rounded-full bg-emerald-400 mr-4 shadow-sm shadow-emerald-400/50" />
                                    <Text className="text-[9px] font-black text-white uppercase tracking-[3px] opacity-70">METABOLIC STATUS</Text>
                                </View>
                                <Text className="text-[10px] font-black text-primary uppercase tracking-[2px]">{bmiCategory}</Text>
                            </View>
                        </GlassCard>
                    </View>

                    {/* Uplink Connectivity */}
                    <View className="mb-10">
                        <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] mb-6 ml-1 opacity-60">Uplink Connectivity</Text>
                        <GlassCard className="p-6 border-white/5 flex-row items-center" intensity="medium">
                            <View className="h-14 w-14 bg-white/5 rounded-2xl items-center justify-center mr-6 border border-white/10">
                                <Mail size={24} color="#f59e0b" className="opacity-80" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[8px] font-black text-text-muted uppercase tracking-[3px] mb-1.5 opacity-60">PRIMARY CHANNEL</Text>
                                <Text className="text-sm font-black text-white tracking-tight uppercase" numberOfLines={1}>{trainee?.email}</Text>
                            </View>
                        </GlassCard>
                    </View>

                    {/* Operational Log Section */}
                    <View>
                        <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] mb-6 ml-1 opacity-60">Operational Log</Text>
                        <GlassCard className="p-6 border-white/5" intensity="low">
                            {attendanceHistory.length === 0 ? (
                                <View className="py-10 items-center">
                                    <View className="h-14 w-14 bg-white/5 rounded-3xl items-center justify-center mb-5 border border-white/10">
                                        <Shield size={24} color="#475569" />
                                    </View>
                                    <Text className="text-text-muted text-[10px] font-black uppercase tracking-[3px] opacity-60">LOGS PURGED</Text>
                                </View>
                            ) : (
                                attendanceHistory.slice(0, 5).map((record) => (
                                    <View key={record.id} className="flex-row items-center justify-between py-5 border-b border-white/5 last:border-0">
                                        <View className="flex-row items-center">
                                            <View className={`h-1.5 w-1.5 rounded-full mr-5 ${record.status === 'PRESENT' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-500 shadow-sm shadow-rose-500/50'}`} />
                                            <Text className="text-xs font-black text-white tracking-tight uppercase opacity-80">
                                                {format(new Date(record.attendanceDate), 'MMM dd, yyyy').toUpperCase()}
                                            </Text>
                                        </View>
                                        <View className={`px-3 py-1.5 rounded-lg border ${record.status === 'PRESENT' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                            <Text className={`text-[8px] font-black uppercase tracking-[2px] ${record.status === 'PRESENT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {record.status}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}
                            {attendanceHistory.length > 5 && (
                                <TouchableOpacity className="mt-6 py-3 items-center bg-white/5 rounded-xl border border-white/5">
                                    <Text className="text-primary text-[9px] font-black uppercase tracking-[3px]">Full Log Access</Text>
                                </TouchableOpacity>
                            )}
                        </GlassCard>
                    </View>
                </View>
            </ScrollView>
            
            {/* Quick Actions Footer - Optional but adds to premium feel */}
            <View className="absolute bottom-10 left-7 right-7">
                <TouchableOpacity activeOpacity={0.9} className="shadow-2xl shadow-amber-500/20">
                    <LinearGradient
                        colors={['#f59e0b', '#0ea5e9']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        className="py-5 rounded-2xl items-center flex-row justify-center"
                    >
                        <Zap size={18} color="#0f1115" className="mr-3" />
                        <Text className="text-obsidian font-black text-[11px] uppercase tracking-[4px]">Initiate Protocol</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

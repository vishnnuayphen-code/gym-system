import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { Clock, Calendar, ArrowLeft, MapPin, Shield, Zap, Target, Cpu, Search, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

interface Availability {
    id: number;
    coach: { id: number; name: string };
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}

export default function CoachAvailabilityScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const coachesRes = await api.get('/coaches');
            const coaches = coachesRes.data || [];
            
            const availProms = coaches.map((c: any) => 
                api.get(`/coach-availability/${c.id}`).catch(() => ({ data: { data: [] } }))
            );
            
            const results = await Promise.all(availProms);
            const merged: Availability[] = results.flatMap((res: any) => res.data?.data || res.data || []);
            
            const dayMap: Record<string, number> = {
                'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 7
            };
            
            merged.sort((a, b) => {
                if (a.coach.name !== b.coach.name) return a.coach.name.localeCompare(b.coach.name);
                return (dayMap[a.dayOfWeek] || 0) - (dayMap[b.dayOfWeek] || 0);
            });
            
            setAvailabilities(merged);
        } catch (err) {
            console.error("Failed to fetch coach availability", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderAvailability = ({ item, index }: { item: Availability, index: number }) => {
        const isFirstForCoach = index === 0 || availabilities[index - 1].coach.id !== item.coach.id;
        
        return (
            <View className="px-6 mb-2">
                {isFirstForCoach && (
                    <View className="flex-row items-center mt-10 mb-6 ml-2">
                        <View className="flex-row items-center bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <Shield size={14} color="#f59e0b" className="mr-3 opacity-70" />
                            <Text className="text-[10px] font-black text-white uppercase tracking-[3px]">{item.coach.name}</Text>
                        </View>
                        <View className="flex-1 h-[1px] bg-white/5 ml-6 opacity-30" />
                    </View>
                )}
                <GlassCard className="p-6 border-white/5 flex-row items-center justify-between" intensity="low">
                    <View className="flex-row items-center flex-1">
                        <View className="h-14 w-14 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10">
                            <Calendar size={22} color="#a855f7" className="opacity-70" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-black text-white tracking-tight">
                                {item.dayOfWeek.charAt(0) + item.dayOfWeek.slice(1).toLowerCase()}
                            </Text>
                            <View className="flex-row items-center mt-1.5 bg-white/5 self-start px-3 py-1.5 rounded-lg border border-white/5">
                                <Clock size={12} color="#f59e0b" className="mr-2 opacity-70" />
                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {item.startTime.substring(0, 5)} - {item.endTime.substring(0, 5)}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="h-10 w-10 bg-white/5 rounded-xl items-center justify-center border border-white/5">
                        <Target size={18} color="#f59e0b" className="opacity-50" />
                    </View>
                </GlassCard>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-obsidian">
            <LinearGradient colors={['#1a1d24', '#0f1115']} className="absolute inset-0" />
            
            <View style={{ paddingTop: Math.max(insets.top, 20) + 12, paddingBottom: 24, paddingHorizontal: 24 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10"
                    >
                        <ArrowLeft size={22} color="#ffffff" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">STRATEGIST NETWORK</Text>
                        <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Temporal Matrix</Text>
                    </View>
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="small" color="#6366f1" />
                </View>
            ) : (
                <FlatList
                    data={availabilities}
                    renderItem={renderAvailability}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                    }
                    ListHeaderComponent={
                        <View className="mb-4 ml-8 flex-row items-center opacity-60">
                            <Search size={14} color="#f59e0b" className="mr-3" />
                            <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px]">Synchronized Parameters</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View className="px-6 mt-12">
                            <GlassCard className="p-16 items-center w-full border-white/5" intensity="low">
                                <View className="h-20 w-20 bg-white/5 rounded-full items-center justify-center mb-8 border border-white/10">
                                    <Clock size={32} color="#272a33" />
                                </View>
                                <Text className="text-2xl font-black text-white tracking-tight mb-3">Matrix Void</Text>
                                <Text className="text-slate-500 text-center text-[10px] font-black uppercase tracking-[2px] leading-relaxed px-6 opacity-70">
                                    No temporal parameters have been established in the matrix yet.
                                </Text>
                            </GlassCard>
                        </View>
                    }
                />
            )}
            <View className="absolute bottom-10 left-0 right-0 items-center pointer-events-none">
                <Cpu size={24} color="#272a33" />
                <Text className="text-slate-800 text-[8px] font-black uppercase tracking-[5px] mt-4">Temporal Core v1.9.8</Text>
            </View>
        </View>
    );
}

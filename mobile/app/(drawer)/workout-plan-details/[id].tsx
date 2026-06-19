import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Dumbbell, Calendar, User as UserIcon, Activity, CheckCircle2, Circle, PlayCircle, Clock } from 'lucide-react-native';
import { workoutService, WorkoutPlanResponse } from '@/lib/workout';
import { GlassCard } from '@/components/GlassCard';
import { format } from 'date-fns';

export default function WorkoutPlanDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [plan, setPlan] = useState<WorkoutPlanResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPlan = React.useCallback(async () => {
        try {
            const data = await workoutService.getPlanById(Number(id));
            setPlan(data);
        } catch (err) {
            console.error("Failed to fetch plan details", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPlan();
    }, [fetchPlan]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPlan();
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-obsidian">
                <ActivityIndicator size="small" color="#f59e0b" />
            </View>
        );
    }

    if (!plan) {
        return (
            <View className="flex-1 items-center justify-center bg-obsidian p-10">
                <Text className="text-white text-xl font-black mb-4">PLAN NOT FOUND</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-white/5 px-8 py-3 rounded-xl border border-white/10">
                    <Text className="text-primary font-black uppercase text-xs tracking-widest">Return</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-obsidian">
            <LinearGradient colors={['#1a1d24', '#0f1115']} className="absolute inset-0" />
            
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
            >
                <View style={{ paddingTop: Math.max(insets.top, 20) + 12, paddingHorizontal: 24 }}>
                    <View className="flex-row items-center mb-10">
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10"
                        >
                            <ArrowLeft size={22} color="#ffffff" />
                        </TouchableOpacity>
                        <View className="ml-5">
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">TACTICAL PROTOCOL</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter uppercase mt-0.5">{plan.title}</Text>
                        </View>
                    </View>

                    <GlassCard className="p-6 border-white/5 mb-10" intensity="low">
                        <View className="flex-row items-center justify-between mb-6">
                            <View className="flex-row items-center">
                                <View className="h-10 w-10 bg-primary/10 rounded-xl items-center justify-center border border-primary/20 mr-4">
                                    <UserIcon size={18} color="#f59e0b" />
                                </View>
                                <View>
                                    <Text className="text-text-muted text-[8px] font-black uppercase tracking-[2px] mb-0.5">Assigned Operative</Text>
                                    <Text className="text-white text-xs font-black uppercase">{plan.traineeName}</Text>
                                </View>
                            </View>
                            <View className="bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                                <Text className="text-emerald-400 text-[9px] font-black uppercase tracking-[1.5px]">{plan.status}</Text>
                            </View>
                        </View>
                        
                        <View className="flex-row items-center mb-6">
                            <Calendar size={16} color="#94a3b8" className="mr-3 opacity-60" />
                            <Text className="text-text-secondary text-[10px] font-black tracking-[1.5px] uppercase">
                                {format(new Date(plan.startDate), 'MMM dd, yyyy').toUpperCase()} — {format(new Date(plan.endDate), 'MMM dd, yyyy').toUpperCase()}
                            </Text>
                        </View>

                        <View className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Text className="text-text-secondary text-xs font-medium leading-relaxed italic">
                                "{plan.description || 'No additional mission intelligence provided.'}"
                            </Text>
                        </View>
                    </GlassCard>

                    <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] mb-6 ml-1 opacity-60">Operational Cycles</Text>

                    {plan.workoutDays.map((day, dIdx) => (
                        <View key={day.id} className="mb-8">
                            <GlassCard className="p-6 border-white/10 mb-4" intensity="medium">
                                <View className="flex-row items-center justify-between mb-4">
                                    <View>
                                        <Text className="text-white text-lg font-black tracking-tight uppercase">{day.dayLabel}</Text>
                                        <Text className="text-primary text-[10px] font-black uppercase tracking-[2px]">{day.focusArea || 'General Training'}</Text>
                                    </View>
                                </View>

                                {day.exercises.map((ex, eIdx) => (
                                    <View key={ex.id} className="bg-white/5 p-5 rounded-2xl mb-3 border border-white/5 flex-row items-center">
                                        <View className="h-10 w-10 bg-white/5 rounded-full items-center justify-center mr-4 border border-white/10">
                                            <Dumbbell size={16} color="#64748b" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-white text-sm font-black uppercase mb-2">{ex.name}</Text>
                                            <View className="flex-row items-center">
                                                <View className="flex-row items-center mr-4">
                                                    <CheckCircle2 size={10} color="#f59e0b" className="mr-1.5 opacity-60" />
                                                    <Text className="text-text-secondary text-[9px] font-black uppercase tracking-[1px]">{ex.sets} SETS</Text>
                                                </View>
                                                <View className="flex-row items-center mr-4">
                                                    <Activity size={10} color="#a855f7" className="mr-1.5 opacity-60" />
                                                    <Text className="text-text-secondary text-[9px] font-black uppercase tracking-[1px]">{ex.reps} REPS</Text>
                                                </View>
                                                {ex.restSeconds > 0 && (
                                                    <View className="flex-row items-center">
                                                        <Clock size={10} color="#94a3b8" className="mr-1.5 opacity-60" />
                                                        <Text className="text-text-secondary text-[9px] font-black uppercase tracking-[1px]">{ex.restSeconds}S REST</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        {ex.videoUrl && (
                                            <TouchableOpacity className="h-10 w-10 items-center justify-center">
                                                <PlayCircle size={24} color="#f59e0b" className="opacity-80" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </GlassCard>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

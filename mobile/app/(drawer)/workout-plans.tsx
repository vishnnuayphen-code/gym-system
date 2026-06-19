import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dumbbell, Plus, ChevronRight, Calendar, ArrowLeft, Info, Search } from 'lucide-react-native';
import { workoutService, WorkoutPlanResponse } from '@/lib/workout';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/GlassCard';
import { format } from 'date-fns';

export default function WorkoutPlansScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuthStore();
    const [plans, setPlans] = useState<WorkoutPlanResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const isCoach = user?.role === 'COACH' || user?.role === 'ADMIN';

    const fetchPlans = React.useCallback(async () => {
        if (!user) return;
        try {
            // If trainee, fetch their plans. If coach, maybe we need a different approach 
            // but for now let's assume if they view this list, it's their relevant plans.
            // Backend endpoint provided was /api/workout-plans/trainee/{id}
            if (!isCoach) {
                const data = await workoutService.getTraineePlans(user.id);
                setPlans(data);
            } else {
                // For coaches, maybe list all plans they created? 
                // The backend doesn't have a specific "get all plans by coach" endpoint 
                // that returns the nested structure as easily as getTraineePlans does for trainees.
                // Wait, WorkoutService has findByCoachId. Let's assume it works or we add it.
                // Actually, I implemented findByCoachId in WorkoutPlanRepository.
                // But I didn't add a specific controller endpoint for it yet.
                // For now, let's just show an empty state or allow them to search for a trainee.
                setPlans([]); 
            }
        } catch (err) {
            console.error("Failed to fetch workout plans", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user, isCoach]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPlans();
    };

    const renderPlan = ({ item }: { item: WorkoutPlanResponse }) => (
        <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => router.push(`/(drawer)/workout-plan-details/${item.id}`)}
            className="mb-4"
        >
            <GlassCard className="p-5 border-white/5 flex-row items-center" intensity="low">
                <View className="h-14 w-14 rounded-2xl bg-primary/10 items-center justify-center mr-5 border border-primary/20">
                    <Dumbbell size={24} color="#f59e0b" />
                </View>
                <View className="flex-1">
                    <Text className="text-white text-base font-black tracking-tight uppercase" numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View className="flex-row items-center mt-2 opacity-60">
                        <Calendar size={12} color="#94a3b8" />
                        <Text className="text-[10px] text-text-secondary font-black tracking-[1px] ml-2">
                            {format(new Date(item.startDate), 'MMM dd').toUpperCase()} - {format(new Date(item.endDate), 'MMM dd').toUpperCase()}
                        </Text>
                    </View>
                </View>
                <View className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 ml-3">
                    <Text className={`text-[9px] font-black uppercase tracking-[1.5px] ${item.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.status}
                    </Text>
                </View>
                <View className="h-8 w-8 bg-white/5 rounded-xl items-center justify-center border border-white/5 ml-3">
                    <ChevronRight size={16} color="#64748b" />
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
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10 active:bg-white/15"
                        >
                            <ArrowLeft size={22} color="#ffffff" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">TRAINING PROTOCOLS</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">
                                Workout Plans
                            </Text>
                        </View>
                    </View>
                    {isCoach && (
                        <TouchableOpacity 
                            onPress={() => router.push("/(drawer)/create-workout-plan")}
                            className="bg-primary w-12 h-12 rounded-2xl items-center justify-center shadow-xl shadow-amber-500/20 active:opacity-90"
                        >
                            <Plus size={26} color="#0f1115" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="small" color="#f59e0b" />
                </View>
            ) : (
                <FlatList
                    data={plans}
                    renderItem={renderPlan}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 24, paddingTop: 12, paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center pt-20">
                            <GlassCard className="p-10 items-center w-full" intensity="medium">
                                <View className="h-20 w-20 bg-white/5 rounded-3xl items-center justify-center mb-8 border border-white/10 shadow-2xl">
                                    <Dumbbell size={36} color="#64748b" />
                                </View>
                                <Text className="text-2xl font-black text-white tracking-tighter mb-4 text-center uppercase">
                                    No Active Data
                                </Text>
                                <Text className="text-text-secondary text-center text-xs font-medium leading-relaxed opacity-60">
                                    {isCoach 
                                        ? "Start by selecting a trainee to build their tactical training protocol." 
                                        : "No training protocols assigned to your operative account yet."}
                                </Text>
                                {isCoach && (
                                    <TouchableOpacity 
                                        onPress={() => router.push("/(drawer)/trainees")}
                                        className="mt-8 bg-white/5 px-8 py-4 rounded-2xl border border-white/10 active:bg-white/10"
                                    >
                                        <Text className="text-primary font-black text-[10px] uppercase tracking-[3px]">Browse Operatives</Text>
                                    </TouchableOpacity>
                                )}
                            </GlassCard>
                        </View>
                    }
                />
            )}
        </View>
    );
}

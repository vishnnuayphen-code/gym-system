import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { User as UserIcon, Plus, Mail, ArrowLeft, Shield, Search, Activity, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api, { resolvePhotoUrl } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/GlassCard';

interface Trainee {
    id: number;
    name: string;
    email: string;
    fitnessGoal: string;
    height: number;
    weight: number;
    profilePhotoUrl?: string;
}

export default function TraineesScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuthStore();
    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const isCoach = user?.role === 'COACH';

    const fetchTrainees = React.useCallback(async () => {
        try {
            const endpoint = isCoach ? '/coaches/me/trainees' : '/trainees';
            const res = await api.get(endpoint);
            setTrainees(res.data);
        } catch (err) {
            console.error("Failed to fetch trainees", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [isCoach]);

    useEffect(() => {
        fetchTrainees();
    }, [fetchTrainees]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTrainees();
    };

    const renderTrainee = ({ item }: { item: Trainee }) => (
        <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => router.push(`/(drawer)/trainee-details/${item.id}`)}
            className="mb-4"
        >
            <GlassCard className="p-5 border-white/5 flex-row items-center" intensity="low">
                <View className="h-14 w-14 rounded-2xl overflow-hidden bg-white/5 border border-white/10 mr-5 items-center justify-center">
                    {resolvePhotoUrl(item.profilePhotoUrl) ? (
                        <Image 
                            source={{ uri: resolvePhotoUrl(item.profilePhotoUrl)! }} 
                            className="w-full h-full"
                            style={{ resizeMode: 'cover' }}
                        />
                    ) : (
                        <UserIcon size={24} color="#f59e0b" className="opacity-70" />
                    )}
                </View>
                <View className="flex-1">
                    <Text className="text-white text-base font-black tracking-tight uppercase" numberOfLines={1}>{item.name}</Text>
                    <View className="flex-row items-center mt-2 opacity-60">
                        <Mail size={12} color="#94a3b8" />
                        <Text className="text-[10px] text-text-secondary font-black tracking-[1px] ml-2" numberOfLines={1}>{item.email.toUpperCase()}</Text>
                    </View>
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
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">ASSET MANAGEMENT</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">
                                {isCoach ? "Sector Operatives" : "Operative Registry"}
                            </Text>
                        </View>
                    </View>
                    {!isCoach && (
                        <TouchableOpacity 
                            onPress={() => router.push("/(drawer)/create-trainee")}
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
                    data={trainees}
                    renderItem={renderTrainee}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 24, paddingTop: 12, paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center pt-20">
                            <GlassCard className="p-12 items-center w-full" intensity="medium">
                                <View className="h-20 w-20 bg-white/5 rounded-3xl items-center justify-center mb-8 border border-white/10 shadow-2xl">
                                    <Shield size={36} color="#64748b" />
                                </View>
                                <Text className="text-2xl font-black text-white tracking-tighter mb-4 text-center uppercase">
                                    Void Registry
                                </Text>
                                <Text className="text-text-secondary text-center text-sm font-medium leading-relaxed opacity-60">
                                    {isCoach 
                                        ? "No operatives currently assigned to your sector. Check with central command." 
                                        : "No operatives found in the system registry. Initialize new node to begin."}
                                </Text>
                            </GlassCard>
                        </View>
                    }
                />
            )}
        </View>
    );
}

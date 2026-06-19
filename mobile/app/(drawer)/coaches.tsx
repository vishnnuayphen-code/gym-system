import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { User as UserIcon, Plus, Mail, Award, Briefcase, ArrowLeft, Shield, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api, { resolvePhotoUrl } from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';

interface Coach {
    id: number;
    name: string;
    email: string;
    specialization: string;
    experienceYears: number;
    certification: string;
    profilePhotoUrl?: string;
}

export default function CoachesScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCoaches = React.useCallback(async () => {
        try {
            const res = await api.get('/coaches');
            setCoaches(res.data);
        } catch (err) {
            console.error("Failed to fetch coaches", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCoaches();
    }, [fetchCoaches]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCoaches();
    };

    const renderCoach = ({ item }: { item: Coach }) => (
        <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => router.push(`/(drawer)/coach-details/${item.id}`)}
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
                    <Text className="text-white text-base font-black tracking-tight" numberOfLines={1}>{item.name.toUpperCase()}</Text>
                    <View className="flex-row items-center mt-2 opacity-60">
                        <Award size={12} color="#f59e0b" />
                        <Text className="text-[10px] text-text-secondary font-black tracking-[1.5px] ml-2" numberOfLines={1}>
                            {item.specialization.toUpperCase()}
                        </Text>
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
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">COMMAND HIERARCHY</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Strategist Registry</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        onPress={() => router.push("/(drawer)/create-coach")}
                        className="bg-primary w-12 h-12 rounded-2xl items-center justify-center shadow-xl shadow-amber-500/20 active:opacity-90"
                    >
                        <Plus size={26} color="#0f1115" />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="small" color="#f59e0b" />
                </View>
            ) : (
                <FlatList
                    data={coaches}
                    renderItem={renderCoach}
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
                                    Null Command
                                </Text>
                                <Text className="text-text-secondary text-center text-sm font-medium leading-relaxed opacity-60">
                                    No strategists located in the system matrix. Initialize new command node to begin operations.
                                </Text>
                            </GlassCard>
                        </View>
                    }
                />
            )}
        </View>
    );
}

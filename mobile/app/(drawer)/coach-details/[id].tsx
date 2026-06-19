import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Mail, Award, Briefcase, GraduationCap, Users, User, ChevronRight, Activity, Shield, Zap, Target } from 'lucide-react-native';
import api, { resolvePhotoUrl } from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

interface CoachDetails {
    id: number;
    name: string;
    email: string;
    specialization: string;
    experienceYears: number;
    certification: string;
    profilePhotoUrl?: string;
}

interface Trainee {
    id: number;
    name: string;
}

export default function CoachDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    const [coach, setCoach] = useState<CoachDetails | null>(null);
    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = React.useCallback(async () => {
        try {
            const [coachRes, traineesRes] = await Promise.all([
                api.get(`/coaches/${id}`),
                api.get(`/coaches/${id}/trainees`)
            ]);
            setCoach(coachRes.data);
            setTrainees(traineesRes.data);
        } catch (err) {
            console.error("Failed to fetch coach details", err);
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
                            <Text className="text-primary font-black text-[9px] uppercase tracking-[3px]">COMMAND STAFF</Text>
                        </GlassCard>
                    </View>
                    
                    <View className="flex-row items-center mb-10 px-1">
                        <View className="relative">
                            <LinearGradient
                                colors={['#f59e0b', '#0ea5e9']}
                                className="absolute -inset-1 rounded-[38px] opacity-20 blur-sm"
                            />
                            <View className="h-28 w-28 bg-obsidian rounded-[32px] items-center justify-center border border-white/10 overflow-hidden shadow-2xl">
                                {resolvePhotoUrl(coach?.profilePhotoUrl) ? (
                                    <Image 
                                        source={{ uri: resolvePhotoUrl(coach?.profilePhotoUrl)! }}
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
                                {coach?.name}
                            </Text>
                            <View className="flex-row items-center">
                                <Award size={14} color="#f59e0b" className="mr-3 opacity-60" />
                                <Text className="text-text-secondary font-black text-[10px] uppercase tracking-[1.5px] opacity-70">
                                    {coach?.specialization}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row justify-between">
                        <GlassCard className="px-5 py-4 border-white/5 flex-row items-center flex-1 mr-4" intensity="low">
                            <Briefcase size={18} color="#f59e0b" className="opacity-60" style={{ marginRight: 15 }} />
                            <View>
                                <Text className="text-text-muted text-[8px] font-black uppercase tracking-[2.5px] mb-1">TENURE</Text>
                                <Text className="text-white text-xs font-black tracking-tight">{coach?.experienceYears} CYCLES</Text>
                            </View>
                        </GlassCard>
                        <GlassCard className="px-5 py-4 border-white/5 flex-row items-center flex-1" intensity="low">
                            <Users size={18} color="#a855f7" className="opacity-60" style={{ marginRight: 15 }} />
                            <View>
                                <Text className="text-text-muted text-[8px] font-black uppercase tracking-[2.5px] mb-1">NODES</Text>
                                <Text className="text-white text-xs font-black tracking-tight">{trainees.length} ACTIVE</Text>
                            </View>
                        </GlassCard>
                    </View>
                </View>

                <View className="px-7">
                    {/* Credentials Section */}
                    <View className="mb-10">
                        <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] mb-6 ml-1 opacity-60">Credential Verification</Text>
                        <GlassCard className="p-6 border-white/5" intensity="high">
                            <View className="flex-row items-center mb-6">
                                <View className="h-12 w-12 bg-white/5 rounded-xl items-center justify-center mr-6 border border-white/10">
                                    <GraduationCap size={22} color="#f59e0b" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[8px] font-black text-text-muted uppercase tracking-[2px] mb-1.5 opacity-60">CERTIFICATION</Text>
                                    <Text className="text-sm font-black text-white tracking-tight uppercase" numberOfLines={1}>{coach?.certification}</Text>
                                </View>
                            </View>
                            
                            <View className="h-[1px] bg-white/5 mb-6" />
                            
                            <View className="flex-row items-center">
                                <View className="h-12 w-12 bg-white/5 rounded-xl items-center justify-center mr-6 border border-white/10">
                                    <Mail size={22} color="#f59e0b" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[8px] font-black text-text-muted uppercase tracking-[2px] mb-1.5 opacity-60">COMMUNICATION</Text>
                                    <Text className="text-sm font-black text-white tracking-tight uppercase" numberOfLines={1}>{coach?.email}</Text>
                                </View>
                            </View>
                        </GlassCard>
                    </View>

                    {/* Trainees Section */}
                    <View>
                        <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] mb-6 ml-1 opacity-60">Command Nodes</Text>
                        {trainees.length === 0 ? (
                            <GlassCard className="p-10 items-center border-white/5" intensity="low">
                                <Shield size={32} color="#475569" className="mb-5 opacity-50" />
                                <Text className="text-text-muted text-[10px] font-black uppercase tracking-[3px] text-center opacity-60">ZERO ASSETS ASSIGNED</Text>
                            </GlassCard>
                        ) : (
                            <View className="gap-y-4">
                                {trainees.map((trainee) => (
                                    <TouchableOpacity 
                                        key={trainee.id}
                                        activeOpacity={0.8}
                                    >
                                        <GlassCard className="p-5 border-white/5 flex-row items-center justify-between" intensity="low">
                                            <View className="flex-row items-center flex-1 mr-4">
                                                <View className="h-11 w-11 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10">
                                                    <User size={18} color="#f59e0b" className="opacity-70" />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-white font-black text-[13px] tracking-tight uppercase" numberOfLines={1}>{trainee.name}</Text>
                                                    <Text className="text-[8px] font-black text-text-secondary uppercase tracking-[2px] mt-1.5 opacity-60">#{trainee.id.toString().padStart(4, '0')}</Text>
                                                </View>
                                            </View>
                                            <View className="h-9 w-9 bg-white/5 rounded-xl items-center justify-center border border-white/10">
                                                <ChevronRight size={16} color="#475569" />
                                            </View>
                                        </GlassCard>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
            
            {/* Quick Actions Footer */}
            <View className="absolute bottom-10 left-7 right-7">
                <TouchableOpacity activeOpacity={0.9} className="shadow-2xl shadow-amber-500/20">
                    <LinearGradient
                        colors={['#f59e0b', '#0ea5e9']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        className="py-5 rounded-2xl items-center flex-row justify-center"
                    >
                        <Target size={18} color="#0f1115" className="mr-3" />
                        <Text className="text-obsidian font-black text-[11px] uppercase tracking-[4px]">Assign New Asset</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

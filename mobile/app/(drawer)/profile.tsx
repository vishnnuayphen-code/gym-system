import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, User as UserIcon, Award, Activity, Clock, Mail, Shield, LogOut, Terminal, Cpu } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import api, { resolvePhotoUrl } from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = React.useCallback(async () => {
        try {
            if (user?.role === 'COACH') {
                const res = await api.get('/coaches/me');
                setProfileData(res.data);
            } else if (user?.role === 'TRAINEE') {
                const res = await api.get('/trainees/me');
                setProfileData(res.data);
            } else {
                // For ADMIN or OWNER, use the generic auth/me endpoint
                const res = await api.get('/auth/me');
                setProfileData(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

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
                {/* Ultra-Premium Profile Header Overlay */}
                <View 
                    style={{ paddingTop: Math.max(insets.top, 24) + 16 }}
                    className="px-7 pb-10"
                >
                    <View className="flex-row justify-between items-center mb-10">
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10 active:bg-white/15"
                        >
                            <ArrowLeft size={22} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => router.push('/settings')}
                            className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10 active:bg-white/15"
                        >
                            <Settings size={22} color="#f59e0b" />
                        </TouchableOpacity>
                    </View>
                    
                    <View className="flex-row items-center mb-10">
                        <View className="relative">
                            <LinearGradient
                                colors={['#f59e0b', '#0ea5e9']}
                                className="absolute -inset-1 rounded-[36px] opacity-20"
                            />
                            <View className="h-28 w-28 bg-obsidian rounded-[32px] items-center justify-center border border-white/10 overflow-hidden">
                                {resolvePhotoUrl(profileData?.profilePhotoUrl || user?.profilePhotoUrl) ? (
                                    <Image 
                                        source={{ uri: resolvePhotoUrl(profileData?.profilePhotoUrl || user?.profilePhotoUrl)! }}
                                        className="w-full h-full"
                                        contentFit="cover"
                                    />
                                ) : (
                                    <UserIcon size={48} color="#f59e0b" />
                                )}
                            </View>
                            <View className="absolute -bottom-1 -right-1 h-8 w-8 bg-primary rounded-xl items-center justify-center border-2 border-obsidian shadow-xl shadow-amber-500/50">
                                <Shield size={14} color="#0f1115" />
                            </View>
                        </View>
                        
                        <View className="ml-7 flex-1">
                            <Text className="text-text-muted text-[8px] font-black uppercase tracking-[5px] mb-2 opacity-60">Identity Core</Text>
                            <Text className="text-white text-3xl font-black tracking-tighter leading-tight mb-3">
                                {profileData?.name || user?.name || user?.email?.split('@')[0] || 'Unknown Entity'}
                            </Text>
                            <View className="bg-primary/10 self-start px-3 py-1.5 rounded-xl border border-primary/20">
                                <Text className="text-primary font-black text-[9px] uppercase tracking-[3px]">{user?.role} NODE</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row justify-between">
                        <GlassCard className="flex-1 mr-4 border-amber-500/10" intensity="low">
                            <View className="p-4 flex-row items-center">
                                <View className="h-9 w-9 bg-amber-500/10 rounded-xl items-center justify-center mr-3 border border-amber-500/20">
                                    <Activity size={18} color="#10b981" />
                                </View>
                                <View>
                                    <Text className="text-text-secondary text-[8px] font-black uppercase tracking-widest mb-0.5">Link</Text>
                                    <Text className="text-white text-[11px] font-black tracking-tight">ENCRYPTED</Text>
                                </View>
                            </View>
                        </GlassCard>
                        <GlassCard className="flex-1 border-primary/10" intensity="low">
                            <View className="p-4 flex-row items-center">
                                <View className="h-9 w-9 bg-primary/10 rounded-xl items-center justify-center mr-3 border border-primary/20">
                                    <Clock size={18} color="#f59e0b" />
                                </View>
                                <View>
                                    <Text className="text-text-secondary text-[8px] font-black uppercase tracking-widest mb-0.5">Uptime</Text>
                                    <Text className="text-white text-[11px] font-black tracking-tight">MAR 2026</Text>
                                </View>
                            </View>
                        </GlassCard>
                    </View>
                </View>

                <View className="px-7 mt-4">
                    {isLoading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="small" color="#f59e0b" />
                        </View>
                    ) : (
                        <View>
                            {/* System Registry Group */}
                            <Text className="text-[10px] font-black text-text-muted uppercase tracking-[4px] mb-5 ml-1 opacity-50">System Registry</Text>
                            <GlassCard className="p-7 mb-10 border-white/5" intensity="medium">
                                <View className="flex-row items-center mb-8">
                                    <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10">
                                        <Mail size={20} color="#f59e0b" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[9px] font-black text-text-secondary uppercase tracking-[2px] mb-1 opacity-60">Access Vector</Text>
                                        <Text className="text-sm font-black text-white tracking-tight">{user?.email}</Text>
                                    </View>
                                </View>
                                
                                {user?.role === 'COACH' && profileData && (
                                    <>
                                        <View className="h-[1px] bg-white/5 mb-8" />
                                        <View className="flex-row items-center mb-8">
                                            <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10">
                                                <Award size={20} color="#f59e0b" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-[9px] font-black text-text-secondary uppercase tracking-[2px] mb-1 opacity-60">Specialization</Text>
                                                <Text className="text-sm font-black text-white tracking-tight">{profileData.specialization || 'Strategic Engineer'}</Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                                
                                <View className="h-[1px] bg-white/5 mb-8" />
                                <View className="flex-row items-center">
                                    <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10">
                                        <Cpu size={20} color="#f59e0b" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[9px] font-black text-text-secondary uppercase tracking-[2px] mb-1 opacity-60">Node Permissions</Text>
                                        <Text className="text-sm font-black text-white tracking-tight">{user?.role === 'ADMIN' ? 'Root Access' : 'Encrypted Client'}</Text>
                                    </View>
                                </View>
                            </GlassCard>

                            {/* Termination protocol */}
                            <TouchableOpacity 
                                onPress={logout}
                                activeOpacity={0.9}
                                className="w-full flex-row justify-center items-center py-6 rounded-3xl border border-rose-500/20 active:bg-rose-500/10 shadow-2xl shadow-rose-500/10"
                            >
                                <Terminal size={18} color="#f43f5e" className="mr-4" />
                                <Text className="text-rose-500 font-black text-xs uppercase tracking-[4px]">Terminate Uplink</Text>
                                <LogOut size={16} color="#f43f5e" className="ml-4 opacity-50" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

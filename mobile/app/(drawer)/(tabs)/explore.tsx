import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Zap, Dumbbell, Trophy, Users, Heart, ArrowRight, Shield, Activity, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
    const insets = useSafeAreaInsets();

    const ExploreCategory = ({ icon: Icon, label, color, description, trend }: any) => (
        <TouchableOpacity 
            activeOpacity={0.8} 
            className="mb-4"
        >
            <GlassCard className="p-6 border-white/5 flex-row items-center" intensity="low">
                <View className={`h-14 w-14 rounded-2xl items-center justify-center mr-5 bg-white/5 border border-white/10`}>
                    <Icon size={24} color={color} />
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-base font-black text-white tracking-tight uppercase">{label}</Text>
                        {trend && (
                            <View className="bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                                <Text className="text-emerald-400 text-[8px] font-black">{trend}</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-[9px] text-text-secondary font-black uppercase tracking-[1.5px] opacity-60 leading-tight">
                        {description}
                    </Text>
                </View>
                <View className="ml-3">
                    <ArrowRight size={16} color="#475569" />
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
                    paddingTop: Math.max(insets.top, 24) + 12, 
                    paddingBottom: 24,
                    paddingHorizontal: 24,
                }}
            >
                <View className="flex-row justify-between items-center">
                    <View>
                        <View className="flex-row items-center mb-1">
                            <Shield size={10} color="#f59e0b" className="mr-2" />
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[3px]">Global Network</Text>
                        </View>
                        <Text className="text-white text-3xl font-black tracking-tighter">Discovery</Text>
                    </View>
                    <TouchableOpacity className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10 active:bg-white/15">
                        <Search size={22} color="#f59e0b" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-[10px] font-black text-text-muted uppercase tracking-[4px] ml-1 mb-6 opacity-50">Operational Modules</Text>
                
                <ExploreCategory 
                    icon={Zap} 
                    label="Thermal Surge" 
                    color="#f59e0b" 
                    description="High-intensity protocol for peak cardiac performance."
                    trend="+14% ENG"
                />
                
                <ExploreCategory 
                    icon={Dumbbell} 
                    label="Mass Vector" 
                    color="#f59e0b" 
                    description="Hyper-precision resistance & structural reinforcement."
                    trend="NEW V3.0"
                />
                
                <ExploreCategory 
                    icon={Heart} 
                    label="Vital Core" 
                    color="#f43f5e" 
                    description="Cardiovascular optimization and metabolic tuning."
                />
                
                <ExploreCategory 
                    icon={Trophy} 
                    label="Elite Circuits" 
                    color="#10b981" 
                    description="Global engagement protocols and tier rewards."
                    trend="LIVE"
                />

                <View className="mt-8 rounded-[40px] overflow-hidden">
                    <LinearGradient
                        colors={['#272a33', '#1a1d24']}
                        className="p-10 items-center border border-white/5"
                    >
                        <View className="h-16 w-16 bg-primary/20 rounded-3xl items-center justify-center mb-6 border border-primary/30 shadow-2xl shadow-amber-500/20">
                            <Activity size={32} color="#f59e0b" />
                        </View>
                        <Text className="text-white text-xl font-black text-center tracking-tighter mb-3 uppercase">Initialize Community Link</Text>
                        <Text className="text-text-secondary text-[10px] text-center font-bold leading-relaxed px-4 opacity-60 tracking-wider">
                            Sync your biometric stream with the global network to unlock collaborative data points and shared challenges.
                        </Text>
                        <TouchableOpacity className="bg-primary mt-10 w-full py-5 rounded-2xl shadow-2xl shadow-amber-500/20 active:opacity-90">
                            <Text className="text-obsidian text-center font-black text-[11px] uppercase tracking-[4px]">Establish Uplink</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </ScrollView>
        </View>
    );
}

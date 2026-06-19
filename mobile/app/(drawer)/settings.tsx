import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, ShieldCheck, Bell, ChevronRight, CreditCard, User, HelpCircle, Activity, Globe, Cpu } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/GlassCard';

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const SettingItem = ({ icon: Icon, label, value, onPress, color = "#f59e0b" }: any) => (
        <TouchableOpacity 
            onPress={onPress}
            activeOpacity={0.8}
            className="mb-4"
        >
            <GlassCard className="flex-row items-center p-5 border-white/5" intensity="low">
                <View className={`h-11 w-11 rounded-2xl items-center justify-center mr-5 bg-white/5 border border-white/10`}>
                    <Icon size={20} color={color} />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-black text-white tracking-tight">{label}</Text>
                    {value && <Text className="text-[9px] text-text-secondary font-black uppercase tracking-[2px] mt-1 opacity-60">{value}</Text>}
                </View>
                <ChevronRight size={16} color="#64748b" />
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
                <View className="flex-row items-center">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10 active:bg-white/15"
                    >
                        <ArrowLeft size={22} color="#ffffff" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">SYSTEM PREFERENCES</Text>
                        <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Core Parameters</Text>
                    </View>
                </View>
            </View>

            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingTop: 12, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-[10px] font-black text-text-muted uppercase tracking-[4px] ml-1 mb-6 opacity-50">Local Node</Text>
                
                <SettingItem icon={User} label="Identity Profile" value="Encrypted Biometrics" />
                <SettingItem icon={Bell} label="Transmission Protocol" value="Real-time Uplink" />
                <SettingItem icon={ShieldCheck} label="Security Matrix" value="Root Authentication" />
                <SettingItem icon={Globe} label="Region & Language" value="Global standard" />

                <Text className="text-[10px] font-black text-text-muted uppercase tracking-[4px] ml-1 mt-8 mb-6 opacity-50">Infrastructure</Text>
                <SettingItem icon={CreditCard} label="Billing Engine" value="Premium Link Active" />
                <SettingItem icon={HelpCircle} label="Central Support" color="#10b981" />
                <SettingItem icon={Cpu} label="System Version" value="v1.0.2 Build 24" color="#64748b" />
                
                <GlassCard className="mt-12 p-8 border-dashed border-white/10 items-center" intensity="low">
                    <Activity size={24} color="#f59e0b" className="mb-4 opacity-50" />
                    <Text className="text-[9px] font-black text-text-secondary uppercase tracking-[5px] text-center leading-relaxed">
                        Precision Engineering{'\n'}by FitCore Central
                    </Text>
                </GlassCard>
            </ScrollView>
        </View>
    );
}

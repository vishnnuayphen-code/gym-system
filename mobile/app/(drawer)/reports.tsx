import React from 'react';
import { View, Text, Platform, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, BarChart2, TrendingUp, Download, ChevronRight, DollarSign, Wallet, Zap, Activity, PieChart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const ReportCard = ({ icon: Icon, label, value, trend, color }: any) => (
        <GlassCard className="p-6 border-white/5 mb-4" intensity="low">
            <View className="flex-row justify-between items-start">
                <View className="h-10 w-10 bg-white/5 rounded-xl items-center justify-center border border-white/10">
                    <Icon size={18} color={color || "#f59e0b"} />
                </View>
                {trend && (
                    <View className="bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        <Text className="text-emerald-400 text-[8px] font-black uppercase tracking-wider">{trend}</Text>
                    </View>
                )}
            </View>
            <View className="mt-5">
                <Text className="text-text-muted text-[9px] font-black uppercase tracking-[2px] mb-1">{label}</Text>
                <Text className="text-white text-2xl font-black tracking-tight">{value}</Text>
            </View>
        </GlassCard>
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
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10 active:bg-white/15"
                        >
                            <ArrowLeft size={22} color="#ffffff" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">CORE ANALYTICS</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Financial Intelligence</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10 active:bg-white/15">
                        <Download size={22} color="#f59e0b" className="opacity-80" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingTop: 12, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row justify-between flex-wrap">
                    <View style={{ width: (width - 64) / 2 }}>
                        <ReportCard icon={DollarSign} label="Monthly Revenue" value="$24,840" trend="+12.5%" color="#f59e0b" />
                    </View>
                    <View style={{ width: (width - 64) / 2 }}>
                        <ReportCard icon={Wallet} label="Total Profit" value="$18,210" trend="+8.2%" color="#a855f7" />
                    </View>
                </View>

                <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] ml-1 mt-6 mb-6 opacity-60">Metric Analysis</Text>
                
                <TouchableOpacity activeOpacity={0.8} className="mb-4">
                    <GlassCard className="p-5 border-white/5 flex-row items-center" intensity="medium">
                        <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-6 border border-white/10">
                            <BarChart2 size={24} color="#f59e0b" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-black text-white tracking-tight uppercase">Yearly Projection</Text>
                            <Text className="text-[9px] text-text-secondary font-black tracking-[1px] mt-1 opacity-60">NEURAL FORECAST AGENT AVAILABLE</Text>
                        </View>
                        <ChevronRight size={16} color="#475569" />
                    </GlassCard>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} className="mb-4">
                    <GlassCard className="p-5 border-white/5 flex-row items-center" intensity="medium">
                        <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-6 border border-white/10">
                            <Activity size={24} color="#a855f7" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-black text-white tracking-tight uppercase">Staff Efficiency</Text>
                            <Text className="text-[9px] text-text-secondary font-black tracking-[1px] mt-1 opacity-60">OPERATIVE PERFORMANCE INDEX</Text>
                        </View>
                        <ChevronRight size={16} color="#475569" />
                    </GlassCard>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} className="mb-4">
                    <GlassCard className="p-5 border-white/5 flex-row items-center" intensity="medium">
                        <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-6 border border-white/10">
                            <PieChart size={24} color="#f59e0b" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-black text-white tracking-tight uppercase">Member Retention</Text>
                            <Text className="text-[9px] text-text-secondary font-black tracking-[1px] mt-1 opacity-60">STABILITY VECTOR ANALYSIS</Text>
                        </View>
                        <ChevronRight size={16} color="#475569" />
                    </GlassCard>
                </TouchableOpacity>

                <View className="mt-10 overflow-hidden rounded-[40px]">
                    <LinearGradient
                        colors={['#272a33', '#1a1d24']}
                        className="p-8 items-center border border-white/5"
                    >
                        <View className="h-16 w-16 bg-primary/20 rounded-3xl items-center justify-center mb-6 border border-primary/30">
                            <TrendingUp size={32} color="#f59e0b" />
                        </View>
                        <Text className="text-white text-xl font-black text-center tracking-tighter mb-3 uppercase">Escalate Operations</Text>
                        <Text className="text-text-secondary text-[10px] text-center font-bold leading-relaxed opacity-60 tracking-wider">
                            Synthesize real-time data to optimize your ecosystem and expand your operational footprint.
                        </Text>
                        
                        <TouchableOpacity className="mt-8 bg-primary py-4 px-8 rounded-2xl w-full active:opacity-90">
                            <Text className="text-obsidian text-center font-black text-[10px] uppercase tracking-[3px]">Upgrade Dashboard</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </ScrollView>
        </View>
    );
}

import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { Users, TrendingUp, Activity, Calendar, Zap, Bell, ChevronRight, User, ArrowRight, Menu, Target, Dumbbell } from 'lucide-react-native';
import api from '@/lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { GlassCard } from '@/components/GlassCard';
import Constants from 'expo-constants';

import { nebulaGold } from '../../../src/theme/nebulaGold';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const router = useRouter();
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const [stats, setStats] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchStats = React.useCallback(async () => {
        try {
            if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
                const res = await api.get("/dashboard/owner");
                setStats(res.data);
                
                // FCM token registration is handled at the RootLayout level.
            } else {
                setStats({});
            }
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    React.useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const QuickAction = ({ icon: Icon, label, color, onPress }: any) => (
        <TouchableOpacity
            className="items-center flex-1 active:opacity-70"
            onPress={onPress}
        >
            <View 
                style={nebulaGold.colors.shadow.light}
                className="h-16 w-16 bg-white rounded-3xl items-center justify-center mb-2 border border-blue-50/50"
            >
                <Icon size={24} color={color || nebulaGold.colors.gold.primary} />
            </View>
            <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</Text>
        </TouchableOpacity>
    );

    const BentoCard = ({ label, value, icon: Icon, colorClass, size = 'small', trend }: any) => (
        <View
            style={{
                width: size === 'large' ? '100%' : (width - 60) / 2,
                height: 140,
                marginBottom: 16,
                padding: 24,
                backgroundColor: '#FFFFFF',
                borderRadius: 28,
                borderWidth: 1,
                borderColor: '#F2F2F7',
                ...nebulaGold.colors.shadow.light
            }}
        >
            <View className="h-10 w-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100">
                <Icon size={20} color={nebulaGold.colors.gold.primary} />
            </View>
            
            <View className="mt-auto">
                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1">{label}</Text>
                <View className="flex-row items-baseline justify-between">
                    <Text className="text-black text-2xl font-black tracking-tight">{value}</Text>
                    {trend && (
                        <View className="bg-emerald-50 px-2 py-0.5 rounded-lg">
                            <Text className="text-emerald-500 text-[9px] font-black">{trend}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            
            <View
                style={{
                    paddingTop: Math.max(insets.top, 20),
                    paddingBottom: 20,
                    paddingHorizontal: 24,
                }}
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => navigation.openDrawer()}
                        className="h-12 w-12 rounded-2xl bg-gray-50 items-center justify-center border border-gray-100 active:bg-gray-100"
                    >
                        <Menu color="#000000" size={24} />
                    </TouchableOpacity>

                    <View className="items-center">
                        <View className="flex-row items-center mb-1">
                            <Zap size={10} color={nebulaGold.colors.gold.primary} className="mr-2" />
                            <Text className="text-gray-400 font-black text-[9px] uppercase tracking-[3px]">FitCore Ultra</Text>
                        </View>
                        <Text className="text-black text-lg font-black tracking-tight">Dashboard</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push("/(drawer)/profile")}
                        className="h-12 w-12 rounded-2xl bg-gray-50 items-center justify-center border border-gray-100 active:bg-gray-100 overflow-hidden"
                    >
                        <User color="#000000" size={24} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
                }
            >
                <View className="px-6 mt-4">
                    {isLoading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="small" color={nebulaGold.colors.gold.primary} />
                        </View>
                    ) : (user?.role === 'ADMIN' || user?.role === 'OWNER') ? (
                        <View>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] mb-6">Performance Core</Text>
                            
                            <View className="flex-row flex-wrap justify-between">
                                <BentoCard
                                    label="TOTAL MEMBERS"
                                    value={stats?.totalMembers ?? 0}
                                    icon={Users}
                                    trend="+4%"
                                />
                                <BentoCard
                                    label="MONTHLY REVENUE"
                                    value={`$${stats?.revenueThisMonth?.toFixed(0) ?? '0'}`}
                                    icon={TrendingUp}
                                    trend="+12%"
                                />
                                <BentoCard
                                    label="ACTIVE PLANS"
                                    value={stats?.activeMemberships ?? 0}
                                    icon={Activity}
                                    size="large"
                                />
                            </View>

                             {stats?.aiRecommendations && (
                                <View className="mt-8">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] mb-6">AI Intelligence Core</Text>
                                    <View 
                                        style={nebulaGold.colors.shadow.light}
                                        className="p-6 bg-white rounded-3xl border border-amber-100"
                                    >
                                        <View className="flex-row items-center mb-4">
                                            <View className="h-8 w-8 bg-amber-50 rounded-lg items-center justify-center mr-3 border border-amber-100">
                                                <Zap size={18} color={nebulaGold.colors.gold.primary} />
                                            </View>
                                            <Text className="text-black font-black text-sm tracking-tight">System Recommendations</Text>
                                        </View>
                                        <Text className="text-gray-500 text-xs leading-5 font-medium italic">
                                            "{stats.aiRecommendations}"
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <View className="mt-10">
                                <Text className="text-text-muted text-[10px] font-black uppercase tracking-[4px] mb-8">System Access</Text>
                                <View className="flex-row justify-between">
                                    <QuickAction
                                        icon={Users}
                                        label="Members"
                                        onPress={() => router.push("/(drawer)/trainees")}
                                    />
                                    <QuickAction
                                        icon={Calendar}
                                        label="Plans"
                                        onPress={() => router.push("/(drawer)/membership-plans")}
                                    />
                                    <QuickAction
                                        icon={Zap}
                                        label="Schedules"
                                        onPress={() => router.push("/(drawer)/coach-availability")}
                                    />
                                    <QuickAction
                                        icon={Bell}
                                        label="Alerts"
                                        onPress={() => Alert.alert("Coming Soon", "Alerts are coming soon!")}
                                    />
                                </View>
                            </View>

                             <View className="mt-12">
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-lg font-black text-black tracking-tight">Recent Activity</Text>
                                    <TouchableOpacity
                                        className="flex-row items-center bg-gray-50 py-1.5 px-3 rounded-full border border-gray-100"
                                        onPress={() => router.push("/(drawer)/reports")}
                                    >
                                        <Text className="text-gray-800 font-black text-[10px] uppercase tracking-widest mr-2">Audit Log</Text>
                                        <ArrowRight size={10} color="#000" />
                                    </TouchableOpacity>
                                </View>
 
                                {[1, 2, 3].map((item) => (
                                    <View 
                                        key={item} 
                                        style={nebulaGold.colors.shadow.light}
                                        className="p-5 mb-4 bg-white rounded-3xl flex-row items-center border border-gray-50"
                                    >
                                        <View className="h-12 w-12 bg-gray-50 rounded-2xl items-center justify-center mr-5 border border-gray-100">
                                            <Zap size={22} color={nebulaGold.colors.gold.primary} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-sm font-black text-black tracking-tight">Member Enrollment</Text>
                                            <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Today • 14:30</Text>
                                        </View>
                                        <TouchableOpacity
                                            className="h-10 w-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100"
                                            onPress={() => router.push("/(drawer)/trainees")}
                                        >
                                            <ChevronRight size={18} color={nebulaGold.colors.gold.primary} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                </View>
                        </View>
                    ) : (
                        <View>
                            {/* Trainee Primary Action Card */}
                            <View 
                                style={nebulaGold.colors.shadow.light}
                                className="p-8 mb-8 bg-white rounded-[40px] border border-gray-100"
                            >
                                <View className="flex-row justify-between items-start mb-6">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mb-2">UPCOMING TARGET</Text>
                                        <Text className="text-black text-3xl font-black tracking-tighter">Hypertrophy B</Text>
                                    </View>
                                    <View className="h-14 w-14 bg-amber-50 rounded-2xl items-center justify-center border border-amber-100">
                                        <Target size={28} color={nebulaGold.colors.gold.primary} />
                                    </View>
                                </View>
                                
                                <View className="flex-row items-center bg-gray-50 self-start px-4 py-2 rounded-2xl border border-gray-100 mb-8">
                                    <Calendar size={14} color={nebulaGold.colors.gold.primary} className="mr-3" />
                                    <Text className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Tomorrow • 10:00 AM</Text>
                                </View>
 
                                <TouchableOpacity
                                    className="bg-black py-5 rounded-2xl items-center active:opacity-90 shadow-lg"
                                    onPress={() => router.push("/(drawer)/(tabs)/sessions")}
                                >
                                    <Text className="text-white font-black text-sm uppercase tracking-widest">Start Session</Text>
                                </TouchableOpacity>
                            </View>

                             {/* Trainee Stats Grid */}
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] mb-6">Vitals & Metrics</Text>
                            <View className="flex-row justify-between mb-8">
                                <View style={nebulaGold.colors.shadow.light} className="flex-1 p-6 mr-3 items-center bg-white rounded-3xl border border-gray-50">
                                    <Dumbbell size={20} color="#8b5cf6" />
                                    <Text className="text-black text-xl font-black mt-3">224</Text>
                                    <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-1">Workouts</Text>
                                </View>
                                <View style={nebulaGold.colors.shadow.light} className="flex-1 p-6 mr-3 items-center bg-white rounded-3xl border border-gray-50">
                                    <Activity size={20} color="#f59e0b" />
                                    <Text className="text-black text-xl font-black mt-3">74m</Text>
                                    <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-1">Avg Time</Text>
                                </View>
                                <View style={nebulaGold.colors.shadow.light} className="flex-1 p-6 items-center bg-white rounded-3xl border border-gray-50">
                                    <TrendingUp size={20} color="#10b981" />
                                    <Text className="text-black text-xl font-black mt-3">+12%</Text>
                                    <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-1">Progression</Text>
                                </View>
                            </View>

                             {/* Quick Links for Trainee */}
                            <View style={nebulaGold.colors.shadow.light} className="p-8 bg-white rounded-[40px] border border-gray-50">
                                <Text className="text-black text-base font-black mb-6">Training Access</Text>
                                <View className="flex-row justify-between">
                                    <TouchableOpacity className="items-center" onPress={() => router.push("/(drawer)/(tabs)/sessions")}>
                                        <View className="h-12 w-12 bg-gray-50 rounded-2xl items-center justify-center mb-2 border border-gray-100">
                                            <Calendar size={20} color={nebulaGold.colors.gold.primary} />
                                        </View>
                                        <Text className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Schedules</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="items-center">
                                        <View className="h-12 w-12 bg-indigo-50 rounded-2xl items-center justify-center mb-2 border border-indigo-100">
                                            <Dumbbell size={20} color="#6366f1" />
                                        </View>
                                        <Text className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Workouts</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="items-center" onPress={() => router.push("/(drawer)/profile")}>
                                        <View className="h-12 w-12 bg-rose-50 rounded-2xl items-center justify-center mb-2 border border-rose-100">
                                            <User size={20} color="#f43f5e" />
                                        </View>
                                        <Text className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Profile</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Platform, Dimensions, Alert } from 'react-native';
import { CreditCard, Plus, Clock, Rocket, Zap, ShieldCheck, ArrowLeft, ChevronRight, Target, Users, Mail, Phone, Calendar, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { membershipService, PlanSubscriber } from '@/src/services/membershipService';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

interface MembershipPlan {
    id: number;
    name: string;
    description: string;
    durationDays: number;
    price: number;
    createdAt: string;
    subscriberCount?: number;
    activeSubscriberCount?: number;
}

export default function MembershipPlansScreen() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';
    
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
    const [subscribersMap, setSubscribersMap] = useState<Record<number, PlanSubscriber[]>>({});
    const [loadingSubscribers, setLoadingSubscribers] = useState<Record<number, boolean>>({});

    const fetchPlans = React.useCallback(async () => {
        try {
            const data = await membershipService.getPlans();
            if (Array.isArray(data)) {
                setPlans(data);
            } else {
                setPlans([]);
            }
        } catch (err) {
            console.error("Failed to fetch membership plans", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    const togglePlanExpansion = async (planId: number) => {
        if (expandedPlanId === planId) {
            setExpandedPlanId(null);
            return;
        }

        setExpandedPlanId(planId);

        // Fetch subscribers if not already cached
        if (!subscribersMap[planId] && isAdmin) {
            try {
                setLoadingSubscribers(prev => ({ ...prev, [planId]: true }));
                const subs = await membershipService.getSubscribersForPlan(String(planId));
                setSubscribersMap(prev => ({ ...prev, [planId]: subs }));
            } catch (err) {
                console.error(`Failed to fetch subscribers for plan ${planId}`, err);
            } finally {
                setLoadingSubscribers(prev => ({ ...prev, [planId]: false }));
            }
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPlans();
    };

    const renderPlan = ({ item }: { item: MembershipPlan }) => {
        const isPremium = item.price > 2000;
        const themeColor = isPremium ? '#f59e0b' : '#6366f1';
        const PlanIcon = isPremium ? Rocket : Target;
        const isExpanded = expandedPlanId === item.id;
        const planSubscribers = subscribersMap[item.id] || [];
        const isSubsLoading = loadingSubscribers[item.id];

        return (
            <GlassCard 
                className={`mb-8 border-white/5 ${isPremium ? 'border-amber-500/20' : ''}`}
                intensity="medium"
            >
                {isPremium && (
                    <LinearGradient
                        colors={['rgba(245,158,11,0.1)', 'transparent']}
                        className="absolute inset-0"
                    />
                )}
                
                <View className="p-7">
                    <View className="flex-row justify-between items-start mb-8">
                        <View className="flex-row items-center flex-1">
                            <View className={`h-14 w-14 rounded-2xl items-center justify-center mr-5 bg-obsidian border border-white/5`}>
                                <PlanIcon size={26} color={themeColor} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white text-[10px] font-black uppercase tracking-[3px] mb-1 opacity-50">Strategy</Text>
                                <Text className="text-xl font-black text-white tracking-tight uppercase">{item.name}</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text style={{ color: themeColor }} className="font-black text-3xl tracking-tighter">${item.price.toFixed(0)}</Text>
                            <Text className="text-text-secondary text-[8px] font-black uppercase tracking-[2px]">TERMINAL FEE</Text>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap gap-3 mb-8">
                        <View className="flex-row items-center bg-white/5 px-4 py-2 rounded-2xl border border-white/5 self-start">
                            <Clock size={14} color={themeColor} className="mr-3" />
                            <Text className="text-[10px] font-black text-white uppercase tracking-widest">{item.durationDays} DAYS</Text>
                        </View>
                        
                        {isAdmin && (
                            <>
                                <View className="flex-row items-center bg-white/5 px-4 py-2 rounded-2xl border border-white/5 self-start">
                                    <Users size={14} color="#10b981" className="mr-3" />
                                    <Text className="text-[10px] font-black text-white uppercase tracking-widest">{item.activeSubscriberCount || 0} ACTIVE</Text>
                                </View>
                                <View className="flex-row items-center bg-white/5 px-4 py-2 rounded-2xl border border-white/5 self-start">
                                    <Users size={14} color="#64748b" className="mr-3" />
                                    <Text className="text-[10px] font-black text-white uppercase tracking-widest">{item.subscriberCount || 0} TOTAL</Text>
                                </View>
                            </>
                        )}
                    </View>

                    <View className="bg-white/5 p-5 rounded-2xl border border-white/5 mb-8">
                        <Text className="text-xs text-text-secondary font-bold tracking-tight leading-relaxed">
                            {item.description || "Deploying optimized physical engineering protocols for maximized biological performance."}
                        </Text>
                    </View>

                    <View className="mb-6">
                        {[
                            "Strategic 24/7 Deployment Access",
                            "Biometric Performance Audit",
                            "Advanced Protocol Integration",
                            "Infrastructure Utilization"
                        ].map((feature, idx) => (
                            <View key={idx} className="flex-row items-center mb-4">
                                <View className="h-6 w-6 rounded-full bg-white/5 items-center justify-center mr-4 border border-white/10">
                                    <ShieldCheck size={14} color={themeColor} />
                                </View>
                                <Text className="text-[13px] font-bold text-white tracking-tight">{feature}</Text>
                            </View>
                        ))}
                    </View>

                    {isAdmin ? (
                        <View className="mt-4">
                            <TouchableOpacity 
                                onPress={() => togglePlanExpansion(item.id)}
                                className={`w-full py-4 rounded-2xl items-center flex-row justify-between px-6 bg-white/5 border border-white/10`}
                            >
                                <View className="flex-row items-center">
                                    <Users size={18} color={themeColor} className="mr-3" />
                                    <Text className="text-white font-black text-[11px] uppercase tracking-widest">
                                        Subscribers Overview
                                    </Text>
                                </View>
                                {isExpanded ? (
                                    <ChevronUp size={18} color="#64748b" />
                                ) : (
                                    <ChevronDown size={18} color="#64748b" />
                                )}
                            </TouchableOpacity>

                            {isExpanded && (
                                <View className="mt-4">
                                    {isSubsLoading ? (
                                        <View className="py-10 items-center">
                                            <ActivityIndicator size="small" color={themeColor} />
                                        </View>
                                    ) : planSubscribers.length > 0 ? (
                                        <View className="gap-4">
                                            {planSubscribers.map((sub) => {
                                                const statusColor = sub.membershipStatus === 'ACTIVE' ? '#10b981' : 
                                                                  sub.membershipStatus === 'EXPIRING' ? '#f59e0b' : '#ef4444';
                                                
                                                return (
                                                    <View key={sub.membershipId} className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                                        <View className="flex-row justify-between items-start mb-4">
                                                            <View className="flex-1">
                                                                <Text className="text-white font-black text-sm uppercase mb-1 tracking-tight">{sub.traineeName}</Text>
                                                                <View className="flex-row items-center mb-1">
                                                                    <Mail size={10} color="#64748b" className="mr-2" />
                                                                    <Text className="text-text-secondary text-[10px] font-bold">{sub.traineeEmail}</Text>
                                                                </View>
                                                                {sub.traineePhone && (
                                                                    <View className="flex-row items-center">
                                                                        <Phone size={10} color="#64748b" className="mr-2" />
                                                                        <Text className="text-text-secondary text-[10px] font-bold">{sub.traineePhone}</Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                            <View className="bg-obsidian px-2 py-1 rounded-lg border border-white/5">
                                                                <Text style={{ color: statusColor }} className="text-[8px] font-black uppercase tracking-widest">{sub.membershipStatus}</Text>
                                                            </View>
                                                        </View>
                                                        
                                                        <View className="h-[1px] bg-white/5 w-full mb-4" />
                                                        
                                                        <View className="flex-row justify-between items-center">
                                                            <View className="flex-row items-center">
                                                                <Calendar size={12} color="#64748b" className="mr-2" />
                                                                <Text className="text-[10px] font-bold text-text-secondary uppercase">Ends {sub.endDate}</Text>
                                                            </View>
                                                            <Text className="text-[10px] font-black text-white uppercase tracking-tighter">
                                                                {sub.daysRemaining >= 0 ? `${sub.daysRemaining}d left` : `${Math.abs(sub.daysRemaining)}d ago`}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    ) : (
                                        <View className="py-10 items-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                            <Text className="text-text-muted font-bold text-xs uppercase tracking-widest">No subscribers found</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity 
                            onPress={() => Alert.alert("Access Protocol", "Please contact central administration to activate the " + item.name + ". Direct uplink coming soon.")}
                            className={`w-full py-5 rounded-2xl items-center active:opacity-90 flex-row justify-center shadow-2xl shadow-amber-500/10`}
                            style={{ backgroundColor: themeColor }}
                        >
                            <Text className="text-obsidian font-black text-sm uppercase tracking-widest mr-3">Request Uplink</Text>
                            <ChevronRight size={16} color="#0f1115" />
                        </TouchableOpacity>
                    )}
                </View>
            </GlassCard>
        );
    };

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
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">PROTOCOL REPOSITORY</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">{isAdmin ? "Architect Panel" : "Selection Core"}</Text>
                        </View>
                    </View>
                    {isAdmin && (
                        <TouchableOpacity 
                            onPress={() => router.push('/create-membership-plan')}
                            className="bg-primary w-12 h-12 rounded-2xl items-center justify-center shadow-xl shadow-amber-500/20 active:opacity-90"
                        >
                            <Plus size={24} color="#0f1115" />
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
                        <View className="items-center justify-center px-6 pt-20">
                            <GlassCard className="p-10 items-center w-full">
                                <View className="h-20 w-20 bg-white/5 rounded-3xl items-center justify-center mb-8 border border-white/10 shadow-2xl">
                                    <CreditCard size={36} color="#64748b" />
                                </View>
                                <Text className="text-2xl font-black text-white tracking-tighter mb-4 text-center">Protocol Offline</Text>
                                <Text className="text-text-secondary text-center text-sm font-medium leading-relaxed opacity-70">
                                    Strategic pricing tiers have not been initialized. Establish core protocols to resume operations.
                                </Text>
                            </GlassCard>
                        </View>
                    }
                />
            )}
        </View>
    );
}

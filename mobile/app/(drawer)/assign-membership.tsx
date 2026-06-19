import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView, Alert, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import { Activity, Plus, Calendar, Tag, User, ChevronDown, CheckCircle2, ArrowLeft, Shield, Zap, Target, Cpu, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '@/lib/api';
import { format } from 'date-fns';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

interface TraineeMembership {
    id: number;
    trainee: { id: number; name: string };
    membershipPlan: { id: number; name: string; price: number };
    startDate: string;
    endDate: string;
    status: string;
}

interface Plan {
    id: number;
    name: string;
    price: number;
}

interface Trainee {
    id: number;
    name: string;
}

export default function AssignMembershipScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [memberships, setMemberships] = useState<TraineeMembership[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activePicker, setActivePicker] = useState<'trainee' | 'plan' | null>(null);

    const fetchData = async () => {
        try {
            const [traineesRes, plansRes] = await Promise.all([
                api.get('/trainees'),
                api.get('/memberships/plans')
            ]);
            
            const traineesData = traineesRes.data?.data || traineesRes.data || [];
            const plansData = plansRes.data?.data || plansRes.data || [];
            
            setTrainees(Array.isArray(traineesData) ? traineesData : []);
            setPlans(Array.isArray(plansData) ? plansData : []);

            const allMemProms = (Array.isArray(traineesData) ? traineesData : []).map((t: any) => 
                api.get(`/memberships/trainee/${t.id}/all`).catch(() => ({ data: [] }))
            );
            
            const results = await Promise.all(allMemProms);
            const flattened: TraineeMembership[] = results.flatMap((r: any) => {
                const data = r.data?.data || r.data;
                return Array.isArray(data) ? data : [];
            });
            
            flattened.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
            setMemberships(flattened);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleAssign = async () => {
        if (!selectedTraineeId || !selectedPlanId) {
            Alert.alert("Parameter Error", "Both Operative and Protocol must be selected for assignment.");
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/memberships/assign', {
                traineeId: selectedTraineeId,
                membershipPlanId: selectedPlanId
            });
            Alert.alert("Authorization Confirmed", "Membership protocol has been successfully assigned.", [
                { text: "Continue", onPress: () => {
                    setShowForm(false);
                    setSelectedTraineeId(null);
                    setSelectedPlanId(null);
                    fetchData();
                }}
            ]);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to establish protocol uplink.";
            Alert.alert("Assignment Error", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const getStyles = () => {
            switch (status) {
                case 'ACTIVE': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
                case 'EXPIRED': return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' };
                case 'CANCELLED': return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
                default: return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
            }
        };
        const styles = getStyles();
        return (
            <View className={`${styles.bg} ${styles.border} px-3 py-1 rounded-full border shadow-sm`}>
                <Text className={`${styles.text} text-[8px] font-black uppercase tracking-widest`}>{status}</Text>
            </View>
        );
    };

    const renderMembership = ({ item }: { item: TraineeMembership }) => (
        <GlassCard className="p-6 mb-6 border-white/5" intensity="low">
            <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1 mr-4">
                    <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-2 opacity-60">Operative</Text>
                    <Text className="text-base font-black text-white tracking-tight leading-none" numberOfLines={1}>{item.trainee?.name || "Unknown Asset"}</Text>
                </View>
                <StatusBadge status={item.status} />
            </View>

            <View className="flex-row items-center justify-between mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                <View className="flex-1">
                    <Text className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1.5 opacity-60">Active Protocol</Text>
                    <Text className="text-[13px] font-black text-amber-400 tracking-tight uppercase">{item.membershipPlan.name}</Text>
                </View>
                <View className="items-end bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <Text className="text-base font-black text-white tracking-tighter">${item.membershipPlan.price.toFixed(0)}</Text>
                </View>
            </View>

            <View className="flex-row justify-between pt-1 border-t border-white/5 pt-4">
                <View>
                    <Text className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 opacity-60">Initialization</Text>
                    <View className="flex-row items-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        <Calendar size={12} color="#f59e0b" className="mr-2" />
                        <Text className="text-[10px] font-black text-white tracking-tight">{format(new Date(item.startDate), "MMM d, yyyy")}</Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 opacity-60">Termination</Text>
                    <View className="flex-row items-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        <Calendar size={12} color="#a855f7" className="mr-2" />
                        <Text className="text-[10px] font-black text-white tracking-tight">{format(new Date(item.endDate), "MMM d, yyyy")}</Text>
                    </View>
                </View>
            </View>
        </GlassCard>
    );

    if (showForm) {
        return (
            <View className="flex-1 bg-obsidian">
                <LinearGradient colors={['#1a1d24', '#0f1115']} className="absolute inset-0" />
                
                <View style={{ paddingTop: Math.max(insets.top, 20) + 12, paddingBottom: 24, paddingHorizontal: 24 }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <TouchableOpacity 
                                onPress={() => setShowForm(false)}
                                className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10"
                            >
                                <ArrowLeft size={22} color="#ffffff" />
                            </TouchableOpacity>
                            <View>
                                <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">MEMBERSHIP</Text>
                                <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Protocol Assign</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    className="flex-1"
                >
                    <ScrollView 
                        className="flex-1" 
                        contentContainerStyle={{ padding: 24, paddingBottom: 150 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <GlassCard className="p-8 border-white/5" intensity="medium">
                            <View className="mb-10">
                                <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-4 ml-1 opacity-60">Operative Selection</Text>
                                <TouchableOpacity 
                                    onPress={() => setActivePicker(activePicker === 'trainee' ? null : 'trainee')}
                                    className="flex-row items-center justify-between bg-white/5 border border-white/10 px-5 h-16 rounded-2xl"
                                >
                                    <View className="flex-row items-center">
                                        <User size={18} color="#f59e0b" className="mr-4 opacity-70" />
                                        <Text className={`text-[11px] font-black tracking-[1px] uppercase ${selectedTraineeId ? 'text-white' : 'text-slate-500'}`}>
                                            {selectedTraineeId ? trainees.find(t => t.id === selectedTraineeId)?.name : 'SELECT OPERATIVE...'}
                                        </Text>
                                    </View>
                                    <ChevronDown size={18} color="#475569" className={activePicker === 'trainee' ? 'rotate-180' : ''} />
                                </TouchableOpacity>

                                {activePicker === 'trainee' && (
                                    <View className="mt-4 bg-obsidian-light/50 border border-white/10 rounded-2xl overflow-hidden max-h-60">
                                        <ScrollView nestedScrollEnabled>
                                            {trainees.map(t => (
                                                <TouchableOpacity 
                                                    key={t.id} 
                                                    onPress={() => { setSelectedTraineeId(t.id); setActivePicker(null); }}
                                                    className={`p-5 border-b border-white/5 flex-row items-center justify-between ${selectedTraineeId === t.id ? 'bg-amber-500/10' : 'active:bg-white/5'}`}
                                                >
                                                    <Text className={`font-black text-[11px] tracking-[1px] uppercase ${selectedTraineeId === t.id ? 'text-amber-400' : 'text-white'}`}>{t.name}</Text>
                                                    {selectedTraineeId === t.id && <CheckCircle2 size={16} color="#f59e0b" />}
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            <View className="mb-12">
                                <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-4 ml-1 opacity-60">Protocol Selection</Text>
                                <TouchableOpacity 
                                    onPress={() => setActivePicker(activePicker === 'plan' ? null : 'plan')}
                                    className="flex-row items-center justify-between bg-white/5 border border-white/10 px-5 h-16 rounded-2xl"
                                >
                                    <View className="flex-row items-center">
                                        <Tag size={18} color="#a855f7" className="mr-4 opacity-70" />
                                        <Text className={`text-[11px] font-black tracking-[1px] uppercase ${selectedPlanId ? 'text-white' : 'text-slate-500'}`}>
                                            {selectedPlanId ? plans.find(p => p.id === selectedPlanId)?.name : 'SELECT PROTOCOL...'}
                                        </Text>
                                    </View>
                                    <ChevronDown size={18} color="#475569" className={activePicker === 'plan' ? 'rotate-180' : ''} />
                                </TouchableOpacity>

                                {activePicker === 'plan' && (
                                    <View className="mt-4 bg-obsidian-light/50 border border-white/10 rounded-2xl overflow-hidden max-h-60">
                                        <ScrollView nestedScrollEnabled>
                                            {plans.map(p => (
                                                <TouchableOpacity 
                                                    key={p.id} 
                                                    onPress={() => { setSelectedPlanId(p.id); setActivePicker(null); }}
                                                    className={`p-5 border-b border-white/5 flex-row items-center justify-between ${selectedPlanId === p.id ? 'bg-purple-500/10' : 'active:bg-white/5'}`}
                                                >
                                                    <View>
                                                        <Text className={`font-black text-[11px] tracking-[1px] uppercase ${selectedPlanId === p.id ? 'text-purple-400' : 'text-white'}`}>{p.name}</Text>
                                                        <Text className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">${p.price.toFixed(0)} / PERIOD</Text>
                                                    </View>
                                                    {selectedPlanId === p.id && <CheckCircle2 size={16} color="#a855f7" />}
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity 
                                onPress={handleAssign}
                                disabled={isSubmitting}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={['#f59e0b', '#0891b2']}
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 0}}
                                    className={`py-5 rounded-2xl items-center flex-row justify-center shadow-lg shadow-amber-500/20 ${isSubmitting ? 'opacity-50' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <Zap size={18} color="white" className="mr-3" />
                                            <Text className="text-white font-black text-[11px] uppercase tracking-[4px]">Authorize Assignment</Text>
                                            <CheckCircle2 size={18} color="white" className="ml-2" />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </GlassCard>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-obsidian">
            <LinearGradient colors={['#1a1d24', '#0f1115']} className="absolute inset-0" />
            
            <View style={{ paddingTop: Math.max(insets.top, 20) + 12, paddingBottom: 24, paddingHorizontal: 24 }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10"
                        >
                            <ArrowLeft size={22} color="#ffffff" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">ADMIN CORE</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Registry</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        onPress={() => setShowForm(true)}
                        activeOpacity={0.85}
                        className="shadow-xl shadow-amber-500/20"
                    >
                        <LinearGradient
                            colors={['#f59e0b', '#0891b2']}
                            className="w-12 h-12 rounded-2xl items-center justify-center"
                        >
                            <Plus size={24} color="#ffffff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="small" color="#f59e0b" />
                </View>
            ) : (
                <View className="flex-1">
                    <FlatList
                        data={memberships}
                        renderItem={renderMembership}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ padding: 24, paddingBottom: 150 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
                        }
                        ListHeaderComponent={
                            <View className="mb-8 ml-1 flex-row items-center">
                                <Search size={14} color="#f59e0b" className="mr-3 opacity-60" />
                                <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] opacity-60">Synchronized Assignments</Text>
                            </View>
                        }
                        ListEmptyComponent={
                            <View className="items-center justify-center px-4 pt-10">
                                <GlassCard className="p-12 items-center w-full border-white/5" intensity="low">
                                    <View className="h-20 w-20 bg-white/5 rounded-full items-center justify-center mb-8 border border-white/5">
                                        <Activity size={32} color="#272a33" />
                                    </View>
                                    <Text className="text-2xl font-black text-white tracking-tight mb-3">Registry Void</Text>
                                    <Text className="text-slate-500 text-center text-[10px] font-black uppercase tracking-[2px] leading-relaxed px-6">
                                        No active protocol links detected in system core.
                                    </Text>
                                </GlassCard>
                            </View>
                        }
                    />
                    <View className="absolute bottom-10 left-0 right-0 items-center pointer-events-none">
                        <Cpu size={24} color="#272a33" />
                        <Text className="text-slate-800 text-[8px] font-black uppercase tracking-[5px] mt-4">System Core v2.0.4</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

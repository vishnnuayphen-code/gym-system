import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { CreditCard, Receipt, Calendar, User, CheckCircle2, XCircle, Clock, ArrowLeft, ArrowRight, Wallet, Activity, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

interface Payment {
    id: number;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    paymentStatus: string;
    transactionReference: string;
    traineeMembership?: {
        trainee?: { name: string };
        membershipPlan?: { name: string };
    };
}

export default function PaymentsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuthStore();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

    const fetchPayments = React.useCallback(async () => {
        try {
            if (isAdmin) {
                const traineesRes = await api.get('/trainees');
                const trainees = traineesRes.data || [];
                
                const allPaymentProms = trainees.map((t: any) => 
                    api.get(`/memberships/payments/${t.id}`).catch(() => ({ data: { data: [] } }))
                );
                
                const results = await Promise.all(allPaymentProms);
                const flattened: Payment[] = results.flatMap((r: any) => r.data?.data || r.data || []);
                
                flattened.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
                setPayments(flattened);
            } else {
                const res = await api.get('/memberships/me/payments');
                const data = res.data?.data || res.data || [];
                setPayments(data);
            }
        } catch (err) {
            console.error("Failed to fetch payments", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPayments();
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const getStyles = () => {
            switch (status) {
                case 'SUCCESS': return { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: <CheckCircle2 size={10} color="#10b981" />, border: 'border-amber-500/20' };
                case 'FAILED': return { bg: 'bg-rose-500/10', text: 'text-rose-500', icon: <XCircle size={10} color="#f43f5e" />, border: 'border-rose-500/20' };
                default: return { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: <Clock size={10} color="#fbbf24" />, border: 'border-amber-500/20' };
            }
        };
        const styles = getStyles();
        return (
            <View className={`${styles.bg} ${styles.border} px-3 py-1 rounded-full flex-row items-center border`}>
                <View className="mr-1.5">{styles.icon}</View>
                <Text className={`${styles.text} text-[8px] font-black tracking-widest uppercase`}>{status}</Text>
            </View>
        );
    };

    const renderPayment = ({ item }: { item: Payment }) => (
        <GlassCard className="p-6 mb-5 border-white/5" intensity="medium">
            <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1 mr-4">
                    <Text className="text-white text-lg font-black tracking-tighter" numberOfLines={1}>
                        {item.traineeMembership?.trainee?.name || "Anonymous Entity"}
                    </Text>
                    <Text className="text-text-secondary text-[10px] font-black uppercase tracking-[2px] mt-1 opacity-60">
                        {item.traineeMembership?.membershipPlan?.name || "Core Transmission"}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-2xl font-black text-white tracking-tighter">${item.amount.toFixed(0)}</Text>
                    <Text className="text-[9px] font-black text-primary uppercase tracking-[2px]">CREDIT DEPLOYED</Text>
                </View>
            </View>

            <View className="h-[1px] bg-white/5 mb-6" />

            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View className="h-10 w-10 bg-white/5 rounded-2xl items-center justify-center mr-4 border border-white/10">
                        <Wallet size={18} color="#f59e0b" />
                    </View>
                    <View>
                        <Text className="text-[8px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1">Interface</Text>
                        <Text className="text-[11px] font-black text-white tracking-tight">
                            {item.paymentMethod.replace('_', ' ')}
                        </Text>
                    </View>
                </View>
                <StatusBadge status={item.paymentStatus} />
            </View>

            <View className="flex-row items-center justify-between mt-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                <View className="flex-row items-center">
                    <Calendar size={12} color="#64748b" className="mr-3" />
                    <Text className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none">
                        {format(new Date(item.paymentDate), "MMM dd • yyyy")}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <Shield size={10} color="#f59e0b" className="mr-2 opacity-50" />
                    <Text className="text-[9px] font-black text-text-secondary tracking-widest font-mono opacity-40 uppercase">REF: {item.transactionReference.slice(-8)}</Text>
                </View>
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
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">VECTOR LEDGER</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Credit Matrix</Text>
                        </View>
                    </View>
                    <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10">
                        <Activity size={20} color="#f59e0b" />
                    </View>
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="small" color="#f59e0b" />
                </View>
            ) : (
                <FlatList
                    data={payments}
                    renderItem={renderPayment}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 24, paddingTop: 12, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
                    }
                    ListEmptyComponent={
                        <View className="px-6 pt-20">
                            <GlassCard className="p-12 items-center w-full">
                                <View className="h-20 w-20 bg-white/5 rounded-3xl items-center justify-center mb-8 border border-white/10 shadow-2xl">
                                    <CreditCard size={36} color="#64748b" />
                                </View>
                                <Text className="text-2xl font-black text-white tracking-tighter mb-4 text-center">Ledger Empty</Text>
                                <Text className="text-text-secondary text-center text-sm font-medium leading-relaxed opacity-70">
                                    {isAdmin 
                                        ? "No recursive transaction entries detected in the financial database." 
                                        : "Your encrypted transaction history is currently decentralized or empty."}
                                </Text>
                            </GlassCard>
                        </View>
                    }
                />
            )}
        </View>
    );
}

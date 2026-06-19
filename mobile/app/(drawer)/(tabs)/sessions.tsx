import * as React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, Dimensions, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { Calendar, Clock, XCircle, Edit2, Plus, ChevronRight, User, ArrowLeft, Search, Activity, Shield, Hash } from 'lucide-react-native';
import api from '@/lib/api';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

interface Session {
    id: number;
    coach: { id: number; name: string };
    trainee: { id: number; name: string };
    sessionDate: string;
    startTime: string;
    endTime: string;
    sessionType: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
    notes?: string;
}

export default function SessionsScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const router = useRouter();
    const [sessions, setSessions] = React.useState<Session[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchSessions = React.useCallback(async () => {
        try {
            let endpoint = "/sessions";
            if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
                endpoint = "/sessions";
            } else if (user?.role === 'COACH') {
                endpoint = `/sessions/coach/${user.id}`;
            } else {
                endpoint = `/sessions/trainee/${user?.id}`;
            }

            const res = await api.get(endpoint);
            const data = res.data.data || res.data;
            if (Array.isArray(data)) {
                setSessions(data);
            } else {
                setSessions([]);
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    React.useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSessions();
    };

    const filteredSessions = sessions.filter(session =>
        session.trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.sessionType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCancelSession = (sessionId: number) => {
        Alert.alert(
            "Terminate Protocol",
            "Are you sure you want to terminate this engagement protocol?",
            [
                { text: "Abort", style: "cancel" },
                {
                    text: "Confirm Termination",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/sessions/${sessionId}`);
                            Alert.alert("Success", "Protocol has been terminated.");
                            fetchSessions();
                        } catch (err) {
                            Alert.alert("Error", "Failed to terminate protocol. System error.");
                        }
                    }
                }
            ]
        );
    };

    const renderSessionCard = ({ item }: { item: Session }) => (
        <GlassCard
            className="mx-6 mb-5 border-white/5"
            intensity="medium"
        >
            <View className="p-6">
                <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-1">
                        <View className={`self-start px-3 py-1 rounded-full mb-3 border ${item.status === 'COMPLETED' ? 'bg-amber-500/10 border-amber-500/20' :
                                item.status === 'SCHEDULED' ? 'bg-primary/10 border-primary/20' :
                                    item.status === 'CANCELLED' ? 'bg-rose-500/10 border-rose-500/20' :
                                        'bg-white/5 border-white/10'
                            }`}>
                            <Text className={`text-[8px] font-black uppercase tracking-widest ${item.status === 'COMPLETED' ? 'text-amber-500' :
                                    item.status === 'SCHEDULED' ? 'text-primary' :
                                        item.status === 'CANCELLED' ? 'text-rose-500' :
                                            'text-text-secondary'
                                }`}>
                                {item.status}
                            </Text>
                        </View>
                        <Text className="text-white text-xl font-black tracking-tighter uppercase">
                            {item.sessionType.replace('_', ' ')}
                        </Text>
                    </View>
                    
                    {item.status === 'SCHEDULED' && (user?.role === 'ADMIN' || user?.role === 'OWNER' || user?.role === 'COACH') && (
                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => router.push({ pathname: "/(drawer)/schedule-session", params: { id: item.id } })}
                                className="h-10 w-10 bg-white/5 rounded-2xl items-center justify-center border border-white/10 active:bg-white/15"
                            >
                                <Edit2 size={16} color="#f59e0b" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleCancelSession(item.id)}
                                className="h-10 w-10 bg-rose-500/10 rounded-2xl items-center justify-center border border-rose-500/20 active:bg-rose-500/15"
                            >
                                <XCircle size={16} color="#f43f5e" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View className="flex-row items-center mb-6">
                    <View className="h-10 w-10 bg-white/5 rounded-2xl items-center justify-center mr-4 border border-white/10">
                        <Clock size={16} color="#f59e0b" />
                    </View>
                    <View>
                        <Text className="text-text-secondary text-[8px] font-black uppercase tracking-[2px] mb-1 opacity-60">Uplink Time</Text>
                        <Text className="text-white font-black text-[13px] tracking-tight">
                            {new Date(item.sessionDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {item.startTime} - {item.endTime}
                        </Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-center pt-5 border-t border-white/5">
                    <View className="flex-row items-center flex-1">
                        <View className="h-9 w-9 bg-white/5 rounded-full items-center justify-center mr-4 border border-white/10">
                            <User size={16} color="#f59e0b" className="opacity-70" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-text-secondary text-[8px] font-black uppercase tracking-[2px] mb-1 opacity-60">
                                {user?.role === 'TRAINEE' ? 'Strategist' : 'Operator'}
                            </Text>
                            <Text className="text-white font-black text-xs tracking-tight uppercase" numberOfLines={1}>
                                {user?.role === 'TRAINEE' ? item.coach.name : item.trainee.name}
                            </Text>
                        </View>
                    </View>
                    <View className="h-8 w-8 bg-white/5 rounded-xl items-center justify-center border border-white/5">
                        <ChevronRight size={14} color="#64748b" />
                    </View>
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
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10 active:bg-white/15"
                        >
                            <ArrowLeft size={22} color="#ffffff" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">ENGAGEMENT LAYER</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Protocol Ledger</Text>
                        </View>
                    </View>
                    {(user?.role === 'ADMIN' || user?.role === 'OWNER' || user?.role === 'COACH') && (
                        <TouchableOpacity
                            onPress={() => router.push("/(drawer)/schedule-session")}
                            className="h-12 w-12 rounded-2xl bg-primary items-center justify-center shadow-xl shadow-amber-500/20 active:opacity-90"
                        >
                            <Plus color="#0f1115" size={26} />
                        </TouchableOpacity>
                    )}
                </View>

                <GlassCard className="flex-row items-center px-5 py-0.5 border-white/5" intensity="low">
                    <Search size={18} color="#f59e0b" className="opacity-50" />
                    <TextInput
                        className="flex-1 ml-4 h-12 text-sm font-black text-white"
                        placeholder="FILTER BY NODENAME..."
                        placeholderTextColor="rgba(148, 163, 184, 0.4)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <XCircle size={18} color="#64748b" />
                        </TouchableOpacity>
                    )}
                </GlassCard>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="small" color="#f59e0b" />
                </View>
            ) : (
                <FlatList
                    data={filteredSessions}
                    renderItem={renderSessionCard}
                    keyExtractor={(item) => item.id.toString()}
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center px-8 pt-20">
                            <GlassCard className="p-12 items-center w-full" intensity="medium">
                                <View className="h-20 w-20 bg-white/5 rounded-3xl items-center justify-center mb-8 border border-white/10 shadow-2xl">
                                    <Activity size={36} color="#64748b" />
                                </View>
                                <Text className="text-2xl font-black text-white tracking-tighter mb-4 text-center uppercase">
                                    {searchQuery ? "Null Result" : "Void Registry"}
                                </Text>
                                <Text className="text-text-secondary text-center text-sm font-medium leading-relaxed opacity-60 mb-10">
                                    {searchQuery
                                        ? `No active data streams matching "${searchQuery}" located in the local database.`
                                        : "No scheduled engagement protocols found. Initialize new sessions to begin data acquisition."
                                    }
                                </Text>
                                {!searchQuery && (
                                    <TouchableOpacity
                                        className="bg-primary px-10 py-5 rounded-2xl active:opacity-90 shadow-2xl shadow-amber-500/20"
                                        onPress={() => router.push("/(drawer)/membership-plans")}
                                    >
                                        <Text className="text-obsidian font-black text-xs uppercase tracking-widest">Access Infrastructure</Text>
                                    </TouchableOpacity>
                                )}
                                {searchQuery && (
                                    <TouchableOpacity
                                        className="bg-white/5 px-10 py-5 rounded-2xl active:opacity-90 border border-white/10"
                                        onPress={() => setSearchQuery("")}
                                    >
                                        <Text className="text-white font-black text-xs uppercase tracking-widest">Reset Filter</Text>
                                    </TouchableOpacity>
                                )}
                            </GlassCard>
                        </View>
                    }
                />
            )}
        </View>
    );
}

import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, ScrollView, TouchableOpacity, View, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Dimensions } from 'react-native';
import { UserCog, ChevronDown, CheckCircle2, User, Users, ArrowLeft, Info, Shield, Zap, Target, Cpu } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api, { resolvePhotoUrl } from '@/lib/api';
import { Image } from 'expo-image';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

interface UserData {
    id: number;
    name: string;
    email: string;
    profilePhotoUrl?: string;
}

export default function AssignTraineeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [coaches, setCoaches] = useState<UserData[]>([]);
    const [trainees, setTrainees] = useState<UserData[]>([]);
    const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);
    const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activePicker, setActivePicker] = useState<'coach' | 'trainee' | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coachesRes, traineesRes] = await Promise.all([
                    api.get('/coaches'),
                    api.get('/trainees'),
                ]);
                setCoaches(coachesRes.data);
                setTrainees(traineesRes.data);
            } catch (err) {
                console.error("Failed to load data", err);
                Alert.alert("Error", "Failed to load coaches and trainees.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAssign = async () => {
        if (!selectedCoachId || !selectedTraineeId) {
            Alert.alert("Warning", "Please select both a coach and a trainee.");
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/coaches/assign-trainee', {
                coachId: selectedCoachId,
                traineeId: selectedTraineeId
            });
            Alert.alert("Success", "Trainee successfully assigned to coach!");
            setSelectedCoachId(null);
            setSelectedTraineeId(null);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to assign trainee.";
            Alert.alert("Error", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-surface-soft">
                <ActivityIndicator size="small" color="#6366f1" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-obsidian">
            <LinearGradient colors={['#1a1d24', '#0f1115']} className="absolute inset-0" />
            
            <View style={{ paddingTop: Math.max(insets.top, 20) + 12, paddingBottom: 24, paddingHorizontal: 24 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10"
                    >
                        <ArrowLeft size={22} color="#ffffff" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">ADMIN HUB</Text>
                        <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Command Binding</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                className="flex-1"
            >
                <ScrollView 
                    className="flex-1" 
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <GlassCard className="p-8 border-white/5 mb-8" intensity="medium">
                        <View className="flex-row items-center mb-10">
                            <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-4 border border-white/10">
                                <UserCog size={24} color="#f59e0b" />
                            </View>
                            <View>
                                <Text className="text-xl font-black text-white tracking-tighter">Link Establishment</Text>
                                <Text className="text-[9px] text-text-muted font-black uppercase tracking-[2px] opacity-60">Initialize Coach-Trainee Uplink</Text>
                            </View>
                        </View>

                        {/* Strategist Picker */}
                        <View className="mb-8">
                            <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] ml-1 mb-4 opacity-60">Strategist Selection</Text>
                            <TouchableOpacity 
                                onPress={() => setActivePicker(activePicker === 'coach' ? null : 'coach')}
                                className="flex-row items-center justify-between bg-white/5 border border-white/10 px-5 h-16 rounded-2xl"
                            >
                                <View className="flex-row items-center">
                                    <Users size={18} color="#f59e0b" className="mr-4 opacity-70" />
                                    <Text className={`text-[11px] font-black tracking-[1px] uppercase ${selectedCoachId ? 'text-white' : 'text-slate-500'}`}>
                                        {selectedCoachId ? coaches.find(c => c.id === selectedCoachId)?.name : 'SELECT STRATEGIST...'}
                                    </Text>
                                </View>
                                <ChevronDown size={18} color="#475569" className={activePicker === 'coach' ? 'rotate-180' : ''} />
                            </TouchableOpacity>

                            {activePicker === 'coach' && (
                                <View className="mt-4 bg-obsidian-light/50 border border-white/10 rounded-2xl overflow-hidden max-h-60">
                                    <ScrollView nestedScrollEnabled>
                                        {coaches.map(coach => (
                                            <TouchableOpacity 
                                                key={coach.id} 
                                                onPress={() => { setSelectedCoachId(coach.id); setActivePicker(null); }}
                                                className={`p-5 border-b border-white/5 flex-row items-center justify-between ${selectedCoachId === coach.id ? 'bg-amber-500/10' : 'active:bg-white/5'}`}
                                            >
                                                <View className="flex-row items-center flex-1">
                                                    <View className="h-10 w-10 bg-white/5 rounded-xl items-center justify-center mr-4 border border-white/10 overflow-hidden">
                                                        {resolvePhotoUrl(coach.profilePhotoUrl) ? (
                                                            <Image source={{ uri: resolvePhotoUrl(coach.profilePhotoUrl)! }} className="w-full h-full" />
                                                        ) : (
                                                            <Users size={18} color="#f59e0b" className="opacity-70" />
                                                        )}
                                                    </View>
                                                    <View>
                                                        <Text className={`font-black text-[11px] tracking-[1px] uppercase ${selectedCoachId === coach.id ? 'text-amber-400' : 'text-white'}`}>{coach.name}</Text>
                                                        <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{coach.email}</Text>
                                                    </View>
                                                </View>
                                                {selectedCoachId === coach.id && <CheckCircle2 size={16} color="#f59e0b" />}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Operative Picker */}
                        <View className="mb-12">
                            <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] ml-1 mb-4 opacity-60">Operative Selection</Text>
                            <TouchableOpacity 
                                onPress={() => setActivePicker(activePicker === 'trainee' ? null : 'trainee')}
                                className="flex-row items-center justify-between bg-white/5 border border-white/10 px-5 h-16 rounded-2xl"
                            >
                                <View className="flex-row items-center">
                                    <User size={18} color="#a855f7" className="mr-4 opacity-70" />
                                    <Text className={`text-[11px] font-black tracking-[1px] uppercase ${selectedTraineeId ? 'text-white' : 'text-slate-500'}`}>
                                        {selectedTraineeId ? trainees.find(t => t.id === selectedTraineeId)?.name : 'SELECT OPERATIVE...'}
                                    </Text>
                                </View>
                                <ChevronDown size={18} color="#475569" className={activePicker === 'trainee' ? 'rotate-180' : ''} />
                            </TouchableOpacity>

                            {activePicker === 'trainee' && (
                                <View className="mt-4 bg-obsidian-light/50 border border-white/10 rounded-2xl overflow-hidden max-h-60">
                                    <ScrollView nestedScrollEnabled>
                                        {trainees.map(trainee => (
                                            <TouchableOpacity 
                                                key={trainee.id} 
                                                onPress={() => { setSelectedTraineeId(trainee.id); setActivePicker(null); }}
                                                className={`p-5 border-b border-white/5 flex-row items-center justify-between ${selectedTraineeId === trainee.id ? 'bg-purple-500/10' : 'active:bg-white/5'}`}
                                            >
                                                <View className="flex-row items-center flex-1">
                                                    <View className="h-10 w-10 bg-white/5 rounded-xl items-center justify-center mr-4 border border-white/10 overflow-hidden">
                                                        {resolvePhotoUrl(trainee.profilePhotoUrl) ? (
                                                            <Image source={{ uri: resolvePhotoUrl(trainee.profilePhotoUrl)! }} className="w-full h-full" />
                                                        ) : (
                                                            <User size={18} color="#a855f7" className="opacity-70" />
                                                        )}
                                                    </View>
                                                    <View>
                                                        <Text className={`font-black text-[11px] tracking-[1px] uppercase ${selectedTraineeId === trainee.id ? 'text-purple-400' : 'text-white'}`}>{trainee.name}</Text>
                                                        <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{trainee.email}</Text>
                                                    </View>
                                                </View>
                                                {selectedTraineeId === trainee.id && <CheckCircle2 size={16} color="#a855f7" />}
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
                                        <Text className="text-white font-black text-[11px] uppercase tracking-[4px]">Authorize Binding</Text>
                                        <CheckCircle2 size={18} color="white" className="ml-2" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </GlassCard>

                    {/* Strategic Insight Card */}
                    <GlassCard className="p-8 border-white/5 flex-row items-start" intensity="low">
                        <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/10">
                            <Shield size={22} color="#f59e0b" className="opacity-70" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-black text-[13px] tracking-tight mb-2">Strategic Insight</Text>
                            <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[2px] leading-relaxed opacity-80">
                                Activating a direct command link between Strategist and Operative ensures optimal field performance and synchronized performance telemetry.
                            </Text>
                        </View>
                    </GlassCard>
                </ScrollView>
            </KeyboardAvoidingView>
            <View className="absolute bottom-10 left-0 right-0 items-center pointer-events-none">
                <Cpu size={24} color="#272a33" />
                <Text className="text-slate-800 text-[8px] font-black uppercase tracking-[5px] mt-4">Command Core v4.1.2</Text>
            </View>
        </View>
    );
}

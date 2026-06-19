import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import { Calendar as CalendarIcon, Clock, Users, User, Info, ChevronDown, CheckCircle2, ArrowLeft, Save, Shield, Zap, Target, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

interface UserData {
    id: number;
    name: string;
}

export default function ScheduleSessionScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const router = useRouter();
    const { id } = useLocalSearchParams(); 
    const isEditMode = !!id;

    const [coaches, setCoaches] = useState<UserData[]>([]);
    const [trainees, setTrainees] = useState<UserData[]>([]);
    const [selectedCoachId, setSelectedCoachId] = useState<number | null>(user?.role === 'COACH' ? user.id : null);
    const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(null);
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [sessionType, setSessionType] = useState<'PERSONAL_TRAINING' | 'GROUP_SESSION' | 'ONLINE_SESSION'>('PERSONAL_TRAINING');
    const [notes, setNotes] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activePicker, setActivePicker] = useState<'coach' | 'trainee' | 'type' | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const promises: Promise<any>[] = [];
                if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
                    promises.push(api.get('/coaches'));
                    promises.push(api.get('/trainees'));
                } else if (user?.role === 'COACH') {
                    promises.push(api.get('/coaches/me/trainees'));
                }

                if (isEditMode) {
                    promises.push(api.get(`/sessions`)); 
                }

                const results = await Promise.all(promises);
                let resultIdx = 0;

                if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
                    setCoaches(results[resultIdx++].data);
                    setTrainees(results[resultIdx++].data);
                } else if (user?.role === 'COACH') {
                    setTrainees(results[resultIdx++].data);
                }

                if (isEditMode) {
                    const sessionsRes = results[resultIdx];
                    const sessions = sessionsRes.data.data || sessionsRes.data;
                    const session = Array.isArray(sessions) ? sessions.find((s: any) => s.id.toString() === id) : null;

                    if (session) {
                        setSelectedCoachId(session.coach.id);
                        setSelectedTraineeId(session.trainee.id);
                        setSessionDate(session.sessionDate);
                        setStartTime(session.startTime);
                        setEndTime(session.endTime);
                        setSessionType(session.sessionType);
                        setNotes(session.notes || "");
                    }
                }
            } catch (err) {
                console.error("Failed to load data", err);
                Alert.alert("Uplink Error", "Failed to synchronize node data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user, id, isEditMode]);

    const handleSchedule = async () => {
        if (!selectedCoachId || !selectedTraineeId || !sessionDate || !startTime || !endTime) {
            Alert.alert("Parameter Mismatch", "All mission critical parameters must be defined.");
            return;
        }

        // Ensure HH:mm format (pad single digit hours with leading zero)
        const padTime = (t: string) => {
            const clean = t.trim();
            if (/^\d:\d{2}$/.test(clean)) {
                return '0' + clean;
            }
            return clean;
        };

        const formattedStartTime = padTime(startTime);
        const formattedEndTime = padTime(endTime);

        if (formattedStartTime >= formattedEndTime) {
            Alert.alert("Temporal Conflict", "Start coordinates must precede end coordinates. Ensure you use 24h format (e.g., 13:00 for 1 PM).");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                coachId: selectedCoachId,
                traineeId: selectedTraineeId,
                sessionDate,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                sessionType,
                notes
            };

            if (isEditMode) {
                await api.put(`/sessions/${id}`, payload);
                Alert.alert("Uplink Success", "Temporal slice has been recalibrated.", [
                    { text: "Confirm", onPress: () => router.back() }
                ]);
            } else {
                await api.post('/sessions', payload);
                Alert.alert("Uplink Success", "New synchronization node established.", [
                    { text: "Confirm", onPress: () => router.back() }
                ]);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to commit node sequence.";
            Alert.alert("Deployment Failure", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-obsidian">
                <ActivityIndicator size="small" color="#f59e0b" />
            </View>
        );
    }

    const sessionTypes = [
        { label: 'PERSONAL TRAINING', value: 'PERSONAL_TRAINING' },
        { label: 'GROUP SESSION', value: 'GROUP_SESSION' },
        { label: 'ONLINE SESSION', value: 'ONLINE_SESSION' }
    ];

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
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">LOGISTICS</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">
                                {isEditMode ? 'Recalibrate Node' : 'Squadron Sync'}
                            </Text>
                        </View>
                    </View>
                    <GlassCard className="px-5 py-2 border-white/10" intensity="low">
                        <Text className="text-primary font-black text-[9px] uppercase tracking-[3px]">
                            {isEditMode ? 'MOD' : 'NEW'}
                        </Text>
                    </GlassCard>
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
                    <View className="mb-10">
                        <View className="flex-row items-center mb-6 ml-1">
                            <Zap size={14} color="#f59e0b" className="mr-3 opacity-60" />
                            <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] opacity-60">Operative Selection</Text>
                        </View>
                        
                        <GlassCard className="p-7 border-white/5" intensity="medium">
                            {/* Coach Picker */}
                            {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                                <View className="mb-8">
                                    <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-3 ml-1 opacity-60">COMMAND STRATEGIST</Text>
                                    <TouchableOpacity
                                        onPress={() => setActivePicker(activePicker === 'coach' ? null : 'coach')}
                                        activeOpacity={0.8}
                                    >
                                        <GlassCard className="flex-row items-center justify-between px-5 h-16 border-white/5" intensity="low">
                                            <View className="flex-row items-center">
                                                <Users size={18} color="#f59e0b" className="mr-4 opacity-60" />
                                                <Text className="text-white font-black text-[11px] tracking-[1px] uppercase">
                                                    {selectedCoachId ? coaches.find(c => c.id === selectedCoachId)?.name : 'SELECT STRATEGIST...'}
                                                </Text>
                                            </View>
                                            <View className={activePicker === 'coach' ? 'rotate-180' : ''}>
                                                <ChevronDown size={18} color="#475569" />
                                            </View>
                                        </GlassCard>
                                    </TouchableOpacity>
                                    {activePicker === 'coach' && (
                                        <GlassCard className="mt-3 border-white/10 overflow-hidden" intensity="high">
                                            <ScrollView nestedScrollEnabled className="max-h-56">
                                                {coaches.map(coach => (
                                                    <TouchableOpacity
                                                        key={coach.id}
                                                        onPress={() => {
                                                            setSelectedCoachId(coach.id);
                                                            setActivePicker(null);
                                                        }}
                                                        className={`p-5 border-b border-white/5 flex-row items-center justify-between active:bg-white/5 ${selectedCoachId === coach.id ? 'bg-amber-500/10' : ''}`}
                                                    >
                                                        <Text className={`font-black text-[11px] tracking-[1px] uppercase ${selectedCoachId === coach.id ? 'text-primary' : 'text-white'}`}>{coach.name}</Text>
                                                        {selectedCoachId === coach.id && <CheckCircle2 size={16} color="#f59e0b" />}
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </GlassCard>
                                    )}
                                </View>
                            )}

                            {/* Trainee Picker */}
                            <View className="mb-2">
                                <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-3 ml-1 opacity-60">TARGET OPERATIVE</Text>
                                <TouchableOpacity
                                    onPress={() => setActivePicker(activePicker === 'trainee' ? null : 'trainee')}
                                    activeOpacity={0.8}
                                >
                                    <GlassCard className="flex-row items-center justify-between px-5 h-16 border-white/5" intensity="low">
                                        <View className="flex-row items-center">
                                            <User size={18} color="#a855f7" className="mr-4 opacity-60" />
                                            <Text className="text-white font-black text-[11px] tracking-[1px] uppercase">
                                                {selectedTraineeId ? trainees.find(t => t.id === selectedTraineeId)?.name : 'SELECT ASSET...'}
                                            </Text>
                                        </View>
                                        <View className={activePicker === 'trainee' ? 'rotate-180' : ''}>
                                            <ChevronDown size={18} color="#475569" />
                                        </View>
                                    </GlassCard>
                                </TouchableOpacity>
                                {activePicker === 'trainee' && (
                                    <GlassCard className="mt-3 border-white/10 overflow-hidden" intensity="high">
                                        <ScrollView nestedScrollEnabled className="max-h-56">
                                            {trainees.map(trainee => (
                                                <TouchableOpacity
                                                    key={trainee.id}
                                                    onPress={() => {
                                                        setSelectedTraineeId(trainee.id);
                                                        setActivePicker(null);
                                                    }}
                                                    className={`p-5 border-b border-white/5 flex-row items-center justify-between active:bg-white/5 ${selectedTraineeId === trainee.id ? 'bg-purple-500/10' : ''}`}
                                                >
                                                    <Text className={`font-black text-[11px] tracking-[1px] uppercase ${selectedTraineeId === trainee.id ? 'text-purple-400' : 'text-white'}`}>{trainee.name}</Text>
                                                    {selectedTraineeId === trainee.id && <CheckCircle2 size={16} color="#a855f7" />}
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </GlassCard>
                                )}
                            </View>
                        </GlassCard>
                    </View>

                    <View className="mb-10">
                        <View className="flex-row items-center mb-6 ml-1">
                            <Clock size={14} color="#10b981" className="mr-3 opacity-60" />
                            <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] opacity-60">Temporal Coordinates</Text>
                        </View>
                        
                        <GlassCard className="p-7 border-white/5" intensity="medium">
                            {/* Date Input */}
                            <View className="mb-8">
                                <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-3 ml-1 opacity-60">TARGET DATE (YYYY-MM-DD)</Text>
                                <GlassCard className="flex-row items-center px-5 h-16 border-white/5" intensity="low">
                                    <CalendarIcon size={18} color="#f59e0b" className="mr-4 opacity-60" />
                                    <TextInput
                                        value={sessionDate}
                                        onChangeText={setSessionDate}
                                        placeholder="2026-03-16"
                                        placeholderTextColor="#475569"
                                        className="flex-1 text-white font-black text-[11px] tracking-[1px] uppercase"
                                    />
                                </GlassCard>
                            </View>

                            <View className="flex-row space-x-6">
                                <View className="flex-1">
                                    <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-3 ml-1 opacity-60">START T-0</Text>
                                    <GlassCard className="flex-row items-center px-4 h-16 border-white/5" intensity="low">
                                        <Clock size={18} color="#f59e0b" className="mr-3 opacity-60" />
                                        <TextInput
                                            value={startTime}
                                            onChangeText={setStartTime}
                                            placeholder="09:00"
                                            placeholderTextColor="#475569"
                                            className="flex-1 text-white font-black text-[11px] tracking-[1px] uppercase"
                                        />
                                    </GlassCard>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-3 ml-1 opacity-60">END T-MAX</Text>
                                    <GlassCard className="flex-row items-center px-4 h-16 border-white/5" intensity="low">
                                        <Clock size={18} color="#f59e0b" className="mr-3 opacity-60" />
                                        <TextInput
                                            value={endTime}
                                            onChangeText={setEndTime}
                                            placeholder="10:00"
                                            placeholderTextColor="#475569"
                                            className="flex-1 text-white font-black text-[11px] tracking-[1px] uppercase"
                                        />
                                    </GlassCard>
                                </View>
                            </View>
                        </GlassCard>
                    </View>

                    <View className="mb-10">
                        <View className="flex-row items-center mb-6 ml-1">
                            <Info size={14} color="#f59e0b" className="mr-3 opacity-60" />
                            <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] opacity-60">Mission Parameters</Text>
                        </View>
                        
                        <GlassCard className="p-7 border-white/5" intensity="medium">
                            {/* Session Type Picker */}
                            <View className="mb-8">
                                <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-3 ml-1 opacity-60">SYNC PROTOCOL</Text>
                                <TouchableOpacity
                                    onPress={() => setActivePicker(activePicker === 'type' ? null : 'type')}
                                    activeOpacity={0.8}
                                >
                                    <GlassCard className="flex-row items-center justify-between px-5 h-16 border-white/5" intensity="low">
                                        <View className="flex-row items-center">
                                            <Shield size={18} color="#f59e0b" className="mr-4 opacity-60" />
                                            <Text className="text-white font-black text-[11px] tracking-[1px] uppercase">
                                                {sessionTypes.find(t => t.value === sessionType)?.label}
                                            </Text>
                                        </View>
                                        <View className={activePicker === 'type' ? 'rotate-180' : ''}>
                                            <ChevronDown size={18} color="#475569" />
                                        </View>
                                    </GlassCard>
                                </TouchableOpacity>
                                {activePicker === 'type' && (
                                    <GlassCard className="mt-3 border-white/10 overflow-hidden" intensity="high">
                                        {sessionTypes.map(type => (
                                            <TouchableOpacity
                                                key={type.value}
                                                onPress={() => {
                                                    setSessionType(type.value as any);
                                                    setActivePicker(null);
                                                }}
                                                className={`p-5 border-b border-white/5 flex-row items-center justify-between active:bg-white/5 ${sessionType === type.value ? 'bg-amber-500/10' : ''}`}
                                            >
                                                <Text className={`font-black text-[11px] tracking-[1px] uppercase ${sessionType === type.value ? 'text-primary' : 'text-white'}`}>{type.label}</Text>
                                                {sessionType === type.value && <CheckCircle2 size={16} color="#f59e0b" />}
                                            </TouchableOpacity>
                                        ))}
                                    </GlassCard>
                                )}
                            </View>

                            {/* Notes */}
                            <View>
                                <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-3 ml-1 opacity-60">DIRECTIVE INTEL (OPTIONAL)</Text>
                                <TextInput
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="DEFINE MISSION OBJECTIVES..."
                                    placeholderTextColor="#475569"
                                    multiline
                                    numberOfLines={3}
                                    className="bg-white/5 border border-white/5 px-6 py-5 rounded-[28px] text-[11px] font-black text-white min-h-[120px] text-left leading-relaxed uppercase tracking-[1px]"
                                    textAlignVertical="top"
                                />
                            </View>
                        </GlassCard>
                    </View>

                    <TouchableOpacity
                        onPress={handleSchedule}
                        disabled={isSubmitting}
                        activeOpacity={0.9}
                        className="shadow-2xl shadow-amber-500/20"
                    >
                        <LinearGradient
                            colors={['#f59e0b', '#0ea5e9']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            className={`py-5 rounded-2xl items-center flex-row justify-center ${isSubmitting ? 'opacity-50' : ''}`}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#0f1115" size="small" />
                            ) : (
                                <>
                                    <Zap size={18} color="#0f1115" className="mr-3" />
                                    <Text className="text-obsidian font-black text-[11px] uppercase tracking-[4px]">
                                        {isEditMode ? 'Recalibrate Sequence' : 'Initialize Sync'}
                                    </Text>
                                    {isEditMode ? <Save size={18} color="#0f1115" className="ml-2" /> : <ChevronRight size={18} color="#0f1115" className="ml-2" />}
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

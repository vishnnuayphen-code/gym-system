import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, Plus, Trash2, Dumbbell, Hash, Repeat, Clock, FileText, User as UserIcon, Calendar } from 'lucide-react-native';
import { workoutService, WorkoutDayRequest, ExerciseRequest } from '@/lib/workout';
import api from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface Trainee {
    id: number;
    name: string;
}

export default function CreateWorkoutPlanScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();
    const incomingTraineeId = params.traineeId ? parseInt(params.traineeId as string) : null;

    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    const [workoutDays, setWorkoutDays] = useState<WorkoutDayRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        fetchTrainees();
    }, []);

    const fetchTrainees = async () => {
        try {
            const res = await api.get('/coaches/me/trainees');
            setTrainees(res.data);
            
            // Pre-select trainee if incoming from params or fallback to first one
            if (incomingTraineeId) {
                setSelectedTraineeId(incomingTraineeId);
            } else if (res.data.length > 0) {
                setSelectedTraineeId(res.data[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch trainees", err);
        }
    };

    const addDay = () => {
        setWorkoutDays([...workoutDays, { dayLabel: `Day ${workoutDays.length + 1}`, focusArea: '', exercises: [] }]);
    };

    const removeDay = (index: number) => {
        const newDays = [...workoutDays];
        newDays.splice(index, 1);
        setWorkoutDays(newDays);
    };

    const addExercise = (dayIndex: number) => {
        const newDays = [...workoutDays];
        newDays[dayIndex].exercises.push({ name: '', sets: 3, reps: 12, restSeconds: 60, notes: '', videoUrl: '' });
        setWorkoutDays(newDays);
    };

    const removeExercise = (dayIndex: number, exerciseIndex: number) => {
        const newDays = [...workoutDays];
        newDays[dayIndex].exercises.splice(exerciseIndex, 1);
        setWorkoutDays(newDays);
    };

    const updateDayLabel = (index: number, label: string) => {
        const newDays = [...workoutDays];
        newDays[index].dayLabel = label;
        setWorkoutDays(newDays);
    };

    const updateDayFocus = (index: number, focus: string) => {
        const newDays = [...workoutDays];
        newDays[index].focusArea = focus;
        setWorkoutDays(newDays);
    };

    const updateExercise = (dayIndex: number, exIndex: number, field: keyof ExerciseRequest, value: any) => {
        const newDays = [...workoutDays];
        (newDays[dayIndex].exercises[exIndex] as any)[field] = value;
        setWorkoutDays(newDays);
    };

    const handleSave = async () => {
        if (!title || !selectedTraineeId) {
            Alert.alert("Error", "Please provide a title and select a trainee.");
            return;
        }

        setIsLoading(true);
        try {
            await workoutService.createPlan({
                title,
                description,
                traineeId: selectedTraineeId,
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
                workoutDays
            });
            Alert.alert("Success", "Workout plan created successfully.");
            router.back();
        } catch (err) {
            console.error("Failed to create workout plan", err);
            Alert.alert("Error", "Failed to create workout plan.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-obsidian">
            <LinearGradient colors={['#1a1d24', '#0f1115']} className="absolute inset-0" />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                    <View style={{ paddingTop: Math.max(insets.top, 20) + 12, paddingHorizontal: 24 }}>
                        <View className="flex-row items-center justify-between mb-8">
                            <TouchableOpacity 
                                onPress={() => router.back()}
                                className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10"
                            >
                                <ArrowLeft size={22} color="#ffffff" />
                            </TouchableOpacity>
                            <Text className="text-white text-xl font-black tracking-tight flex-1 ml-4 uppercase">Build Protocol</Text>
                            <TouchableOpacity 
                                onPress={handleSave}
                                disabled={isLoading}
                                className="bg-primary px-6 py-3 rounded-2xl flex-row items-center"
                            >
                                {isLoading ? <ActivityIndicator size="small" color="#0f1115" /> : (
                                    <>
                                        <Save size={18} color="#0f1115" className="mr-2" />
                                        <Text className="text-obsidian font-black text-xs uppercase tracking-wider">Save</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Metadata Section */}
                        <GlassCard className="p-6 border-white/5 mb-8" intensity="low">
                            <Text className="text-[9px] font-black text-primary uppercase tracking-[3px] mb-4">Core Identification</Text>
                            
                            <View className="mb-4">
                                <Text className="text-white text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">Operative</Text>
                                <View className="bg-white/5 rounded-2xl border border-white/10 p-4">
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {trainees.map(t => (
                                            <TouchableOpacity 
                                                key={t.id}
                                                onPress={() => setSelectedTraineeId(t.id)}
                                                className={`px-4 py-2 rounded-xl mr-3 border ${selectedTraineeId === t.id ? 'bg-primary border-primary' : 'bg-white/5 border-white/10'}`}
                                            >
                                                <Text className={`text-[10px] font-black uppercase ${selectedTraineeId === t.id ? 'text-obsidian' : 'text-white opacity-60'}`}>{t.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <TextInput
                                className="bg-white/5 rounded-2xl border border-white/10 p-5 text-white mb-4 font-bold"
                                placeholder="PROTOCOL TITLE (E.G. HYPERTROPHY ALPHA)"
                                placeholderTextColor="#475569"
                                value={title}
                                onChangeText={setTitle}
                            />
                            
                            <TextInput
                                className="bg-white/5 rounded-2xl border border-white/10 p-5 text-white mb-6 font-medium min-h-[100px]"
                                placeholder="MISSION OBJECTIVES / DESCRIPTION"
                                placeholderTextColor="#475569"
                                multiline
                                value={description}
                                onChangeText={setDescription}
                            />

                            <View className="flex-row justify-between">
                                <TouchableOpacity onPress={() => setShowStartPicker(true)} className="bg-white/5 flex-1 mr-2 p-4 rounded-xl border border-white/10">
                                    <Text className="text-text-muted text-[8px] font-black uppercase tracking-widest mb-1">Commencement</Text>
                                    <Text className="text-white text-xs font-black">{format(startDate, 'MMM dd, yyyy').toUpperCase()}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowEndPicker(true)} className="bg-white/5 flex-1 ml-2 p-4 rounded-xl border border-white/10">
                                    <Text className="text-text-muted text-[8px] font-black uppercase tracking-widest mb-1">Termination</Text>
                                    <Text className="text-white text-xs font-black">{format(endDate, 'MMM dd, yyyy').toUpperCase()}</Text>
                                </TouchableOpacity>
                            </View>

                            {showStartPicker && (
                                <DateTimePicker
                                    value={startDate}
                                    mode="date"
                                    onChange={(e, date) => {
                                        setShowStartPicker(false);
                                        if (date) setStartDate(date);
                                    }}
                                />
                            )}
                            {showEndPicker && (
                                <DateTimePicker
                                    value={endDate}
                                    mode="date"
                                    onChange={(e, date) => {
                                        setShowEndPicker(false);
                                        if (date) setEndDate(date);
                                    }}
                                />
                            )}
                        </GlassCard>

                        {/* Days Section */}
                        <View className="mb-10">
                            <View className="flex-row justify-between items-center mb-6 px-1">
                                <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px]">Operational Cycle</Text>
                                <TouchableOpacity onPress={addDay} className="flex-row items-center">
                                    <Plus size={14} color="#f59e0b" className="mr-2" />
                                    <Text className="text-primary text-[9px] font-black uppercase tracking-[2px]">Initialize Day</Text>
                                </TouchableOpacity>
                            </View>

                            {workoutDays.map((day, dIdx) => (
                                <GlassCard key={dIdx} className="p-6 border-white/5 mb-6" intensity="medium">
                                    <View className="flex-row justify-between items-center mb-6">
                                        <View className="flex-1 mr-4">
                                            <TextInput
                                                className="text-white text-lg font-black tracking-tighter uppercase"
                                                value={day.dayLabel}
                                                onChangeText={(val) => updateDayLabel(dIdx, val)}
                                                placeholder="DAY LABEL"
                                                placeholderTextColor="#475569"
                                            />
                                            <TextInput
                                                className="text-primary text-[10px] font-black uppercase tracking-[1px] mt-1"
                                                value={day.focusArea}
                                                onChangeText={(val) => updateDayFocus(dIdx, val)}
                                                placeholder="FOCUS AREA (E.G. CORE)"
                                                placeholderTextColor="#475569"
                                            />
                                        </View>
                                        <TouchableOpacity onPress={() => removeDay(dIdx)} className="h-10 w-10 bg-rose-500/10 rounded-xl items-center justify-center border border-rose-500/20">
                                            <Trash2 size={16} color="#f43f5e" />
                                        </TouchableOpacity>
                                    </View>

                                    {day.exercises.map((ex, eIdx) => (
                                        <View key={eIdx} className="bg-white/5 rounded-2xl p-5 mb-4 border border-white/5">
                                            <View className="flex-row justify-between items-center mb-4">
                                                <TextInput
                                                    className="text-white text-sm font-black uppercase flex-1"
                                                    value={ex.name}
                                                    onChangeText={(val) => updateExercise(dIdx, eIdx, 'name', val)}
                                                    placeholder="EXERCISE NAME"
                                                    placeholderTextColor="#475569"
                                                />
                                                <TouchableOpacity onPress={() => removeExercise(dIdx, eIdx)}>
                                                    <Trash2 size={14} color="#64748b" />
                                                </TouchableOpacity>
                                            </View>
                                            
                                            <View className="flex-row mb-4">
                                                <View className="flex-1 mr-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                                                    <Text className="text-[7px] font-black text-text-muted mb-1 uppercase tracking-widest">Sets</Text>
                                                    <TextInput
                                                        keyboardType="numeric"
                                                        value={ex.sets.toString()}
                                                        onChangeText={(val) => updateExercise(dIdx, eIdx, 'sets', parseInt(val) || 0)}
                                                        className="text-white font-black text-xs"
                                                    />
                                                </View>
                                                <View className="flex-1 mx-1 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                                                    <Text className="text-[7px] font-black text-text-muted mb-1 uppercase tracking-widest">Reps</Text>
                                                    <TextInput
                                                        keyboardType="numeric"
                                                        value={ex.reps.toString()}
                                                        onChangeText={(val) => updateExercise(dIdx, eIdx, 'reps', parseInt(val) || 0)}
                                                        className="text-white font-black text-xs"
                                                    />
                                                </View>
                                                <View className="flex-1 ml-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                                                    <Text className="text-[7px] font-black text-text-muted mb-1 uppercase tracking-widest">Rest (s)</Text>
                                                    <TextInput
                                                        keyboardType="numeric"
                                                        value={ex.restSeconds?.toString()}
                                                        onChangeText={(val) => updateExercise(dIdx, eIdx, 'restSeconds', parseInt(val) || 0)}
                                                        className="text-white font-black text-xs"
                                                    />
                                                </View>
                                            </View>

                                            <TextInput
                                                className="text-[10px] text-text-secondary bg-white/5 p-3 rounded-xl border border-white/5 font-medium"
                                                placeholder="TECHNICAL NOTES / VIDEO URL"
                                                placeholderTextColor="#475569"
                                                value={ex.notes}
                                                onChangeText={(val) => updateExercise(dIdx, eIdx, 'notes', val)}
                                            />
                                        </View>
                                    ))}

                                    <TouchableOpacity 
                                        onPress={() => addExercise(dIdx)}
                                        className="py-4 rounded-xl border border-dashed border-white/20 items-center justify-center flex-row"
                                    >
                                        <Plus size={14} color="#94a3b8" className="mr-2" />
                                        <Text className="text-text-muted text-[9px] font-black uppercase tracking-[2px]">Deploy Exercise</Text>
                                    </TouchableOpacity>
                                </GlassCard>
                            ))}

                            {workoutDays.length === 0 && (
                                <TouchableOpacity 
                                    onPress={addDay}
                                    className="h-32 rounded-[32px] border border-dashed border-primary/20 items-center justify-center bg-primary/[0.02]"
                                >
                                    <View className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center mb-3">
                                        <Plus size={24} color="#f59e0b" />
                                    </View>
                                    <Text className="text-primary font-black text-[10px] uppercase tracking-[3px]">Initialize Workflow</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

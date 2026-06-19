import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Tag, FileText, Clock, DollarSign, PlusCircle, CheckCircle2, Shield, Zap, Target, Cpu } from 'lucide-react-native';
import api from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

export default function CreateMembershipPlanScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        description: '',
        durationDays: '',
        price: ''
    });

    const handleCreate = async () => {
        const { name, description, durationDays, price } = form;

        if (!name || !description || !durationDays || !price) {
            Alert.alert("Parameter Mismatch", "All mission parameters must be defined to initialize tier.");
            return;
        }

        try {
            setIsLoading(true);
            await api.post('/memberships/plans', {
                name,
                description,
                durationDays: parseInt(durationDays),
                price: parseFloat(price)
            });
            Alert.alert("Uplink Success", "Membership tier has been successfully initialized.", [
                { text: "Continue", onPress: () => router.back() }
            ]);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to establish tier protocol.";
            Alert.alert("Authorization Error", msg);
        } finally {
            setIsLoading(false);
        }
    };

    const InputField = ({ label, value, onChangeText, placeholder, icon: Icon, multiline = false, keyboardType = 'default' as any, height }: any) => (
        <View className="mb-6">
            <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-3 ml-1 opacity-60">{label}</Text>
            <GlassCard className={`flex-row items-center px-5 border-white/5 ${multiline ? 'py-4' : 'h-14'}`} intensity="low">
                <Icon size={18} color="#f59e0b" className={`mr-4 opacity-60 ${multiline ? 'self-start mt-1' : ''}`} />
                <TextInput
                    className={`flex-1 text-white font-black text-[11px] tracking-[1px] uppercase ${multiline ? 'min-h-[100px]' : ''}`}
                    placeholder={placeholder}
                    placeholderTextColor="#475569"
                    value={value}
                    onChangeText={onChangeText}
                    multiline={multiline}
                    keyboardType={keyboardType}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
            </GlassCard>
        </View>
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
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">MANAGEMENT</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Initialize Tier</Text>
                        </View>
                    </View>
                    <GlassCard className="px-5 py-2 border-white/10" intensity="low">
                        <Text className="text-primary font-black text-[9px] uppercase tracking-[3px]">PLAN CORE</Text>
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
                            <Shield size={14} color="#a855f7" className="mr-3 opacity-60" />
                            <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] opacity-60">Plan Parameters</Text>
                        </View>
                        
                        <GlassCard className="p-7 border-white/5" intensity="medium">
                            <InputField 
                                label="Tier Designation"
                                icon={Tag}
                                placeholder="ENTER PLAN NAME..."
                                value={form.name}
                                onChangeText={(val: string) => setForm({...form, name: val})}
                            />

                            <InputField 
                                label="Protocol Description"
                                icon={FileText}
                                placeholder="DEFINE TIER BENEFITS..."
                                value={form.description}
                                onChangeText={(val: string) => setForm({...form, description: val})}
                                multiline
                            />

                            <View className="flex-row space-x-6">
                                <View className="flex-1">
                                    <InputField 
                                        label="Temporal Scope (DAYS)"
                                        icon={Clock}
                                        placeholder="30"
                                        keyboardType="numeric"
                                        value={form.durationDays}
                                        onChangeText={(val: string) => setForm({...form, durationDays: val})}
                                    />
                                </View>
                                <View className="flex-1">
                                    <InputField 
                                        label="Credit Requirement"
                                        icon={DollarSign}
                                        placeholder="49.99"
                                        keyboardType="numeric"
                                        value={form.price}
                                        onChangeText={(val: string) => setForm({...form, price: val})}
                                    />
                                </View>
                            </View>
                        </GlassCard>
                    </View>

                    <TouchableOpacity 
                        onPress={handleCreate}
                        disabled={isLoading}
                        activeOpacity={0.9}
                        className="shadow-2xl shadow-purple-500/20"
                    >
                        <LinearGradient
                            colors={['#a855f7', '#7e22ce']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            className={`py-5 rounded-2xl items-center flex-row justify-center ${isLoading ? 'opacity-50' : ''}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Zap size={18} color="white" className="mr-3" />
                                    <Text className="text-white font-black text-[11px] uppercase tracking-[4px]">Authorize Tier Protocol</Text>
                                    <CheckCircle2 size={18} color="white" className="ml-2" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View className="mt-12 items-center">
                        <Cpu size={24} color="#272a33" />
                        <Text className="text-slate-800 text-[8px] font-black uppercase tracking-[5px] mt-4">System Core v2.0.4</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

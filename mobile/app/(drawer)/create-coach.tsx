import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User, Mail, Lock, Award, Briefcase, GraduationCap, ChevronRight, CheckCircle2, Clock, Camera, Upload, Shield, Zap } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';

const { width } = Dimensions.get('window');

export default function CreateCoachScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        specialization: '',
        experienceYears: '',
        certification: '',
        profilePhotoUrl: ''
    });

    const handleFileSelect = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setPreviewUrl(asset.uri);
            setSelectedFile({
                uri: asset.uri,
                name: asset.fileName || `profile_${Date.now()}.jpg`,
                type: asset.mimeType || 'image/jpeg'
            });
        }
    };

    const handleCreate = async () => {
        const { name, email, password, specialization, experienceYears, certification } = form;
        
        if (!name || !email || !password || !specialization || !experienceYears || !certification) {
            Alert.alert("Required Fields", "Please complete all command and expertise parameters.");
            return;
        }

        try {
            setIsLoading(true);
            
            let photoUrl = "";
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', {
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: selectedFile.type,
                } as any);

                const uploadRes = await api.post('/files/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                const fileUrl = uploadRes.data.fileUrl;
                if (fileUrl) {
                    try {
                        const index = fileUrl.indexOf('/uploads/');
                        if (index !== -1) {
                            photoUrl = fileUrl.substring(index);
                        } else {
                            photoUrl = new URL(fileUrl).pathname;
                        }
                    } catch (e) {
                        photoUrl = `/uploads/${uploadRes.data.fileName}`;
                    }
                } else {
                    photoUrl = `/uploads/${uploadRes.data.fileName}`;
                }
            }

            await api.post('/coaches', {
                ...form,
                experienceYears: parseInt(experienceYears),
                profilePhotoUrl: photoUrl
            });
            
            Alert.alert("Success", "New strategist has been successfully synchronized!", [
                { text: "Continue", onPress: () => router.back() }
            ]);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Uplink failure. Please re-initiate sequence.";
            Alert.alert("Onboarding Failed", msg);
        } finally {
            setIsLoading(false);
        }
    };

    const InputField = ({ label, value, onChangeText, placeholder, icon: Icon, secure = false, keyboardType = 'default' as any }: any) => (
        <View className="mb-6">
            <Text className="text-[9px] font-black text-text-muted uppercase tracking-[3px] mb-3 ml-1 opacity-60">{label}</Text>
            <GlassCard className="flex-row items-center px-5 h-14 border-white/5" intensity="low">
                <Icon size={18} color="#f59e0b" className="mr-4 opacity-60" />
                <TextInput
                    className="flex-1 text-white font-black text-[11px] tracking-[1px] uppercase"
                    placeholder={placeholder}
                    placeholderTextColor="#475569"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secure}
                    keyboardType={keyboardType}
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
                            <Text className="text-text-muted font-black text-[9px] uppercase tracking-[4px]">LOGISTICS</Text>
                            <Text className="text-white text-2xl font-black tracking-tighter mt-0.5">Strategist Onboarding</Text>
                        </View>
                    </View>
                    <GlassCard className="px-5 py-2 border-white/10" intensity="low">
                        <Text className="text-primary font-black text-[9px] uppercase tracking-[3px]">STAFF NODE</Text>
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
                            <Shield size={14} color="#f59e0b" className="mr-3 opacity-60" />
                            <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] opacity-60">Command Parameters</Text>
                        </View>
                        
                        <GlassCard className="p-7 border-white/5" intensity="medium">
                            {/* Image Picker Block */}
                            <TouchableOpacity 
                                onPress={handleFileSelect}
                                className="mb-8 items-center justify-center p-6 border border-white/5 rounded-[32px] bg-white/5 active:bg-white/10"
                            >
                                <View className="relative">
                                    <View className="absolute -inset-1 bg-amber-500/20 rounded-[30px] blur-md" />
                                    <View className="w-24 h-24 bg-obsidian rounded-[24px] flex items-center justify-center border border-white/10 overflow-hidden shadow-2xl">
                                        {previewUrl ? (
                                            <Image
                                                source={{ uri: previewUrl }}
                                                className="w-full h-full"
                                                style={{ resizeMode: 'cover' }}
                                            />
                                        ) : (
                                            <Camera size={32} color="#f59e0b" className="opacity-40" />
                                        )}
                                    </View>
                                    <View className="absolute -bottom-1 -right-1 p-2 bg-primary rounded-xl shadow-lg border-2 border-obsidian">
                                        <Upload size={12} color="#0f1115" />
                                    </View>
                                </View>
                                <Text className="text-white text-[10px] font-black tracking-[2px] uppercase mt-5">Visual Identification</Text>
                                <Text className="text-[8px] text-text-muted font-black uppercase tracking-[2.5px] mt-1 opacity-60">UPLINK PORTAL</Text>
                            </TouchableOpacity>

                            <InputField 
                                label="Strategist Designation"
                                icon={User}
                                placeholder="ENTER FULL NAME..."
                                value={form.name}
                                onChangeText={(t: string) => setForm(f => ({ ...f, name: t }))}
                            />

                            <InputField 
                                label="Communication Uplink"
                                icon={Mail}
                                placeholder="ENTER EMAIL ADDRESS..."
                                value={form.email}
                                onChangeText={(t: string) => setForm(f => ({ ...f, email: t }))}
                                keyboardType="email-address"
                            />

                            <InputField 
                                label="Access Cipher"
                                icon={Lock}
                                placeholder="SECURE KEYCODE..."
                                value={form.password}
                                onChangeText={(t: string) => setForm(f => ({ ...f, password: t }))}
                                secure
                            />
                        </GlassCard>
                    </View>

                    <View className="mb-10">
                        <View className="flex-row items-center mb-6 ml-1">
                            <Award size={14} color="#a855f7" className="mr-3 opacity-60" />
                            <Text className="text-[9px] font-black text-text-muted uppercase tracking-[4px] opacity-60">Expertise Verification</Text>
                        </View>
                        
                        <GlassCard className="p-7 border-white/5" intensity="medium">
                            <InputField 
                                label="Core Specialization"
                                icon={Briefcase}
                                placeholder="e.g. STRENGTH & FLOW..."
                                value={form.specialization}
                                onChangeText={(t: string) => setForm(f => ({ ...f, specialization: t }))}
                            />

                            <View className="flex-row space-x-6">
                                <View className="flex-1">
                                    <InputField 
                                        label="Experience (CYCLES)"
                                        icon={Clock}
                                        placeholder="5"
                                        value={form.experienceYears}
                                        onChangeText={(t: string) => setForm(f => ({ ...f, experienceYears: t }))}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View className="flex-1">
                                    <InputField 
                                        label="Certification ID"
                                        icon={GraduationCap}
                                        placeholder="NASM, ACE..."
                                        value={form.certification}
                                        onChangeText={(t: string) => setForm(f => ({ ...f, certification: t }))}
                                    />
                                </View>
                            </View>
                        </GlassCard>
                    </View>

                    <TouchableOpacity 
                        onPress={handleCreate}
                        disabled={isLoading}
                        activeOpacity={0.9}
                        className="shadow-2xl shadow-amber-500/20"
                    >
                        <LinearGradient
                            colors={['#f59e0b', '#0ea5e9']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            className={`py-5 rounded-2xl items-center flex-row justify-center ${isLoading ? 'opacity-50' : ''}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#0f1115" size="small" />
                            ) : (
                                <>
                                    <Zap size={18} color="#0f1115" className="mr-3" />
                                    <Text className="text-obsidian font-black text-[11px] uppercase tracking-[4px]">Synchronize Strategist</Text>
                                    <ChevronRight size={18} color="#0f1115" className="ml-2" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

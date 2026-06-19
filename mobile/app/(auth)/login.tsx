import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { StatusBar } from 'expo-status-bar';
import api from '@/lib/api';
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const login = useAuthStore((state) => state.login);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.post('/auth/login', { email, password });
            
            if (response.data.token) {
                await login(response.data.token);
            }
        } catch (error: any) {
            if (error.response) {
                Alert.alert('Login Failed', error.response.data?.message || 'Invalid credentials');
            } else if (error.request) {
                Alert.alert('Connection Error', 'Cannot reach the server.');
            } else {
                Alert.alert('Error', 'An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <StatusBar style="dark" />
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView 
                        className="flex-1" 
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="items-start mb-10">
                            <View className="h-16 w-16 bg-black rounded-2xl items-center justify-center mb-8 shadow-sm border border-gray-100">
                                <Zap size={32} color="#ffffff" />
                            </View>
                            <Text className="text-3xl font-black text-black tracking-tighter leading-tight">
                                Transform Your{'\n'}Fitness Journey
                            </Text>
                            <View className="flex-row items-center mt-4">
                                <View className="h-1.5 w-10 bg-black rounded-full mr-2" />
                                <Text className="text-gray-400 font-bold text-sm tracking-tight">Login to continue</Text>
                            </View>
                        </View>

                        <View className="space-y-6">
                            <View className="space-y-2">
                                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">Email Address</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                                    <Mail size={18} color="#AEAEB2" className="mr-3" />
                                    <TextInput
                                        className="flex-1 text-black font-bold text-sm"
                                        placeholder="name@example.com"
                                        placeholderTextColor="#AEAEB2"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                            </View>
 
                            <View className="space-y-2 mt-5">
                                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">Secure Password</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                                    <Lock size={18} color="#AEAEB2" className="mr-3" />
                                    <TextInput
                                        className="flex-1 text-black font-bold text-sm"
                                        placeholder="••••••••"
                                        placeholderTextColor="#AEAEB2"
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity 
                                className={`bg-black h-14 rounded-2xl flex-row items-center justify-center mt-10 active:opacity-90 ${isLoading ? 'opacity-70' : 'active:scale-[0.98]'}`}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" size="small" />
                                ) : (
                                    <>
                                        <Text className="text-white font-black text-xs uppercase tracking-[2px] mr-3">Authentication</Text>
                                        <ArrowRight size={18} color="#ffffff" />
                                    </>
                                )}
                            </TouchableOpacity>

                            <View className="mt-8 items-center">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                    New to Ayphen Fit? 
                                    <Text className="text-black"> Contact Admin</Text>
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

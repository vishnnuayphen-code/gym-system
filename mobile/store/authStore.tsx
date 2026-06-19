import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: number;
    email: string;
    role: string;
    name?: string;
    profilePhotoUrl?: string;
    gymId?: number;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,
    login: async (token: string) => {
        try {
            await SecureStore.setItemAsync('token', token);
            const decoded: any = jwtDecode(token);
            console.log('DECODED JWT:', JSON.stringify(decoded, null, 2));
            const roleString = decoded.role || decoded.roles;
            const role = Array.isArray(roleString) ? roleString[0] : roleString;
            
            // Try common ID fields
            const rawId = decoded.userId ?? decoded.id ?? decoded.sub;
            const numericId = (rawId != null && !isNaN(Number(rawId))) ? Number(rawId) : null;
            
            set({ 
                token, 
                user: {
                    id: numericId as any,
                    email: decoded.email || (typeof decoded.sub === 'string' && decoded.sub.includes('@') ? decoded.sub : ''),
                    role: role,
                    name: decoded.name,
                    profilePhotoUrl: decoded.profilePhotoUrl,
                    gymId: decoded.gymId != null ? Number(decoded.gymId) : undefined
                },
                isLoading: false 
            });
        } catch (e) {
            console.error("Login storage failed", e);
        }
    },
    logout: async () => {
        try {
            await SecureStore.deleteItemAsync('token');
            set({ user: null, token: null, isLoading: false });
        } catch (e) {
            console.error("Logout storage failed", e);
        }
    },
    checkAuth: async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                const decoded: any = jwtDecode(token);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    await SecureStore.deleteItemAsync('token');
                    set({ user: null, token: null, isLoading: false });
                    return;
                }
                const roleString = decoded.role || decoded.roles;
                const role = Array.isArray(roleString) ? roleString[0] : roleString;
                
                const rawId = decoded.userId ?? decoded.id ?? decoded.sub;
                const numericId = (rawId != null && !isNaN(Number(rawId))) ? Number(rawId) : null;
                
                set({ 
                    token, 
                    user: {
                        id: numericId as any,
                        email: decoded.email || (typeof decoded.sub === 'string' && decoded.sub.includes('@') ? decoded.sub : ''),
                        role: role,
                        name: decoded.name,
                        profilePhotoUrl: decoded.profilePhotoUrl,
                        gymId: decoded.gymId != null ? Number(decoded.gymId) : undefined
                    },
                    isLoading: false 
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            set({ user: null, token: null, isLoading: false });
        }
    }
}));

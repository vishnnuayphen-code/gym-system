import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For local testing on simulators/emulators
const getBaseHost = () => {
    return 'http://localhost:8080';
};

export const BASE_URL: string = getBaseHost();
export const API_URL = `${BASE_URL}/api`;

export const resolvePhotoUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) {
        // Replace localhost with our base host if it's an absolute URL from the server
        return url.replace('http://localhost:8080', BASE_URL);
    }
    // For machine images stored as just filenames, we need to prefix with /uploads/
    const path = url.includes('/') ? url : `/uploads/${url}`;
    const normalizedUrl = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${normalizedUrl}`;
};

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        console.error("Error reading token from secure store", e);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;

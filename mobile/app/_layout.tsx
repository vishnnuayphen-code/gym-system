import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { RoleRouter } from '../src/navigation/RoleRouter';
import { OnboardingGuard } from '../src/navigation/OnboardingGuard';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// In Expo SDK 53+, remote notifications are not supported in Expo Go on Android.
// We must avoid calling notification methods to prevent the red error screen.
const isExpoGoAndroid = Constants.appOwnership === 'expo' && Platform.OS === 'android';

if (!isExpoGoAndroid) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function registerForPushNotificationsAsync() {
  if (isExpoGoAndroid) {
    console.log('Push notifications are not supported in Expo Go on Android SDK 53+. Use a development build.');
    return;
  }

  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
      if (!projectId) {
        console.log('Skipping push notifications: No projectId found.');
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })).data;
    } catch (e) {
      console.log('Push notification registration failed silently:', e);
    }
  } else {
    // Silence logs for simulators
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();

    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          // We'll send this to backend once user is confirmed authenticated
        }
      })
      .catch(err => console.log('Push Token Error:', err.message));
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
            <ActivityIndicator size="large" color="#000000" />
          </View>
        ) : (
          <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <StatusBar style="dark" />
            <ThemeProvider value={DefaultTheme}>
              <OnboardingGuard>
                <Stack screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#FFFFFF' }
                }}>
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(drawer)" />
                  <Stack.Screen name="(coach)" />
                  <Stack.Screen name="(trainee)" />
                  <Stack.Screen name="(superadmin)" />
                  <Stack.Screen name="(admin)" />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <RoleRouter />
              </OnboardingGuard>
            </ThemeProvider>
          </View>
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

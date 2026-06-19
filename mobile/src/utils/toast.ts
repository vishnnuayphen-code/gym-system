import { Platform, ToastAndroid } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

// Simple cross-platform toast
// On Android: uses native ToastAndroid
// On iOS: logs to console (a proper toast overlay can be added later)
export function showToast(message: string, type: ToastType = 'info') {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // iOS: log for now — replace with a toast library if needed
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    console.log(`${prefix} Toast: ${message}`);
  }
}

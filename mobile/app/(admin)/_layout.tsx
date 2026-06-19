import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: '#0F1115' }
    }}>
      <Stack.Screen name="coach-workload" />
      <Stack.Screen name="sessions" />
    </Stack>
  );
}

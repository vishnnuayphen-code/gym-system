import { Tabs } from 'expo-router';
import { Home, Dumbbell, Calendar, ClipboardCheck, User } from 'lucide-react-native';
import { nebulaGold } from '../../src/theme/nebulaGold';

export default function TraineeLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        height: 64,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: '#000000',
      tabBarInactiveTintColor: '#8E8E93',
    }}>
      <Tabs.Screen name="home" options={{ 
        tabBarLabel: 'Home', 
        tabBarIcon: ({ color }) => <Home color={color} size={24} /> 
      }} />
      <Tabs.Screen name="workout" options={{ 
        tabBarLabel: 'Workout', 
        tabBarIcon: ({ color }) => <Dumbbell color={color} size={24} /> 
      }} />
      <Tabs.Screen name="sessions" options={{ 
        tabBarLabel: 'Sessions', 
        tabBarIcon: ({ color }) => <Calendar color={color} size={24} /> 
      }} />
      <Tabs.Screen name="attendance" options={{ 
        tabBarLabel: 'Attendance', 
        tabBarIcon: ({ color }) => <ClipboardCheck color={color} size={24} /> 
      }} />
      <Tabs.Screen name="profile" options={{ 
        tabBarLabel: 'Profile', 
        tabBarIcon: ({ color }) => <User color={color} size={24} /> 
      }} />

      {/* Hidden Routes */}
      <Tabs.Screen 
        name="plans" 
        options={{ 
          href: null,
          headerShown: false
        }} 
      />
      <Tabs.Screen name="booking" options={{ href: null }} />
      <Tabs.Screen name="booking/index" options={{ href: null }} />
      <Tabs.Screen name="booking/success" options={{ href: null }} />
    </Tabs>
  );
}

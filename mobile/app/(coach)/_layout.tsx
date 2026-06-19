import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, Calendar, User } from 'lucide-react-native';
import { nebulaGold } from '../../src/theme/nebulaGold';

export default function CoachLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: nebulaGold.colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: 'rgba(201, 168, 76, 0.3)',
        height: 64,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: nebulaGold.colors.gold.primary,
      tabBarInactiveTintColor: nebulaGold.colors.text.secondary,
    }}>
      <Tabs.Screen name="dashboard" options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} />
      }} />
      <Tabs.Screen name="trainees" options={{
        tabBarLabel: 'My Trainees',
        tabBarIcon: ({ color }) => <Users color={color} size={24} />
      }} />
      <Tabs.Screen name="schedule" options={{
        tabBarLabel: 'Schedule',
        tabBarIcon: ({ color }) => <Calendar color={color} size={24} />
      }} />
      <Tabs.Screen name="availability" options={{
        tabBarLabel: 'Availability',
        tabBarIcon: ({ color }) => <Calendar color={color} size={24} />
      }} />
    </Tabs>
  );
}

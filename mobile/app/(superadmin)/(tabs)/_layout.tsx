import { Tabs } from 'expo-router';
import { Home, Shield, Users, FileText, User } from 'lucide-react-native';
import { nebulaGold } from '../../../src/theme/nebulaGold';

export default function SuperAdminTabs() {
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
      <Tabs.Screen name="overview" options={{ 
        tabBarLabel: 'Overview', 
        tabBarIcon: ({ color }) => <Home color={color} size={24} /> 
      }} />
      <Tabs.Screen name="gyms" options={{ 
        tabBarLabel: 'Gyms', 
        tabBarIcon: ({ color }) => <Shield color={color} size={24} /> 
      }} />
      <Tabs.Screen name="members" options={{ 
        tabBarLabel: 'Members', 
        tabBarIcon: ({ color }) => <Users color={color} size={24} /> 
      }} />
      <Tabs.Screen name="admins" options={{ 
        tabBarLabel: 'Admins', 
        tabBarIcon: ({ color }) => <Shield color={color} size={24} /> 
      }} />
      <Tabs.Screen name="profile" options={{ 
        tabBarLabel: 'Profile', 
        tabBarIcon: ({ color }) => <User color={color} size={24} /> 
      }} />
    </Tabs>
  );
}

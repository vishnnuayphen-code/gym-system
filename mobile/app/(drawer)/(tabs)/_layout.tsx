import { Tabs } from 'expo-router';
import { Home, Calendar, Search } from 'lucide-react-native';
import { View, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f1115', // obsidian
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
        },
        tabBarActiveTintColor: '#f59e0b', // amber gold
        tabBarInactiveTintColor: '#a1a1aa', // zinc 400
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View className={`h-12 w-12 rounded-2xl items-center justify-center ${focused ? 'bg-primary/10' : ''}`}>
              <Home color={color} size={focused ? 26 : 24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, focused }) => (
            <View className={`h-12 w-12 rounded-2xl items-center justify-center ${focused ? 'bg-primary/10' : ''}`}>
              <Calendar color={color} size={focused ? 26 : 24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View className={`h-12 w-12 rounded-2xl items-center justify-center ${focused ? 'bg-primary/10' : ''}`}>
              <Search color={color} size={focused ? 26 : 24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

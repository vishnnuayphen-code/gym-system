import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Users, Briefcase, ClipboardCheck, FileText, Cpu } from 'lucide-react-native';
import { nebulaGold } from '../../src/theme/nebulaGold';

/**
 * TripGlide Tab Icon - Precision match to Screen 1.
 * Larger circle, thinner icons, perfectly centered.
 */
function TabIcon({ Icon, color, focused }: { Icon: any, color: string, focused: boolean }) {
  return (
    <View style={[
      styles.iconWrapper,
      focused && styles.activeWrapper
    ]}>
      <Icon
        color={focused ? '#000000' : color}
        size={20}
        strokeWidth={focused ? 2.5 : 2} // Slightly bolder when active
      />
    </View>
  );
}

export default function GymAdminLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#1A1A1A',
        position: 'absolute',
        bottom: 30,
        left: 10,
        right: 10,
        height: 76,
        borderRadius: 38,
        marginRight: 10,
        marginLeft: 10,
        borderTopWidth: 0,
        paddingBottom: 0,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 18,
        elevation: 15,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      tabBarItemStyle: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      tabBarActiveTintColor: '#000000',
      tabBarInactiveTintColor: '#FFFFFF',
      tabBarShowLabel: false,
    }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Home} color={color} focused={focused} />
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Users} color={color} focused={focused} />
        }}
      />
      <Tabs.Screen
        name="coaches"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Briefcase} color={color} focused={focused} />
        }}
      />
      <Tabs.Screen
        name="machines/index"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Cpu} color={color} focused={focused} />
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={ClipboardCheck} color={color} focused={focused} />
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={FileText} color={color} focused={focused} />
        }}
      />

      {/* Hide Utility screens */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="sessions" options={{ href: null }} />
      <Tabs.Screen name="machines/[id]" options={{ href: null }} />
      <Tabs.Screen name="machines/create" options={{ href: null }} />
      <Tabs.Screen name="machines/edit/[id]" options={{ href: null }} />
      <Tabs.Screen name="member-detail" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="coach-detail" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 56,
    height: 56,
    paddingTop: 35,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeWrapper: {
    backgroundColor: '#FFFFFF',
    marginTop: 35,
    paddingBottom: 25,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',

  },
});

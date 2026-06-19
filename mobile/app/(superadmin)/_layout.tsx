import { Tabs } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { nebulaGold } from '../../src/theme/nebulaGold';
import { AvatarRing } from '../../src/components/nebula/AvatarRing';
import { StatBadge } from '../../src/components/nebula/StatBadge';
import { useAuthStore } from '../../store/authStore';
import { Home, Users, Briefcase, FileText, Settings, Shield } from 'lucide-react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

const CustomDrawerContent = (props: any) => {
  const { user } = useAuthStore();
  return (
    <View style={{ flex: 1, backgroundColor: nebulaGold.colors.background.primary }}>
      <View style={styles.drawerHeader}>
        <AvatarRing size="lg" name={user?.name || 'Admin'} imageUri={user?.profilePhotoUrl} />
        <Text style={styles.drawerName}>{user?.name || 'Super Admin'}</Text>
        <StatBadge value="Super" label="Admin" style={styles.drawerBadge} />
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
};

export default function SuperAdminLayout() {
  return (
    <Drawer 
      screenOptions={{
        drawerStyle: { backgroundColor: nebulaGold.colors.background.primary },
        drawerActiveTintColor: nebulaGold.colors.gold.primary,
        drawerInactiveTintColor: nebulaGold.colors.text.secondary,
        headerShown: false,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen 
        name="(tabs)" 
        options={{ 
          drawerLabel: 'Overview',
          drawerIcon: ({ color }) => <Home color={color} size={20} />
        }} 
      />
      <Drawer.Screen 
        name="analytics" 
        options={{ 
          drawerLabel: 'Analytics',
          drawerIcon: ({ color }) => <FileText color={color} size={20} />
        }} 
      />
      <Drawer.Screen 
        name="gyms" 
        options={{ 
          drawerLabel: 'All Gyms',
          drawerIcon: ({ color }) => <Shield color={color} size={20} />
        }} 
      />
      <Drawer.Screen 
        name="members" 
        options={{ 
          drawerLabel: 'All Members',
          drawerIcon: ({ color }) => <Users color={color} size={20} />
        }} 
      />
      <Drawer.Screen 
        name="coaches" 
        options={{ 
          drawerLabel: 'All Coaches',
          drawerIcon: ({ color }) => <Briefcase color={color} size={20} />
        }} 
      />
      <Drawer.Screen 
        name="reports" 
        options={{ 
          drawerLabel: 'Financial Reports',
          drawerIcon: ({ color }) => <FileText color={color} size={20} />
        }} 
      />
      <Drawer.Screen 
        name="settings" 
        options={{ 
          drawerLabel: 'Settings',
          drawerIcon: ({ color }) => <Settings color={color} size={20} />
        }} 
      />
      <Drawer.Screen 
        name="gym/[id]" 
        options={{ 
          drawerItemStyle: { display: 'none' }
        }} 
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 24,
    backgroundColor: nebulaGold.colors.background.secondary,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 168, 76, 0.2)',
  },
  drawerName: {
    ...nebulaGold.typography.heading3,
    color: nebulaGold.colors.text.primary,
    marginTop: 12,
  },
  drawerBadge: {
    marginTop: 8,
  },
});

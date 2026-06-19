import { Drawer } from 'expo-router/drawer';
import { useAuthStore } from '@/store/authStore';
import { resolvePhotoUrl } from '@/lib/api';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { 
  User as UserIcon, 
  LogOut, 
  Home, 
  Users, 
  Contact, 
  Tags, 
  BarChart2, 
  Settings as SettingsIcon, 
  CreditCard, 
  CalendarClock, 
  Cpu,
  UserCog,
  CheckCircle,
  CalendarDays,
  LayoutGrid,
  Dumbbell
} from 'lucide-react-native';
import { Redirect } from 'expo-router';

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuthStore();

  return (
    <View style={{ flex: 1 }} className="bg-obsidian">
      <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: '#0f1115', paddingTop: 0 }}>
        {/* Profile Header Block - Nebula Gold */}
        <View className="bg-obsidian-soft p-6 pt-16 border-b border-surface-border mb-4 items-start">
          <View className="h-16 w-16 bg-surface-glass rounded-2xl items-center justify-center border border-primary/20 shadow-2xl mb-4 overflow-hidden">
            {resolvePhotoUrl(user?.profilePhotoUrl) ? (
              <Image 
                source={{ uri: resolvePhotoUrl(user?.profilePhotoUrl)! }}
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
              />
            ) : (
              <UserIcon size={32} color="#f59e0b" />
            )}
          </View>
          <Text className="text-xl font-black text-white tracking-tight">
            {user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">
            {user?.email || 'user@example.com'}
          </Text>
          <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Text className="text-primary text-[9px] font-black uppercase tracking-widest">{user?.role}</Text>
          </View>
        </View>

        {/* Standard Drawer Items */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout Footer - Nebula Gold */}
      <View className="p-6 border-t border-surface-border bg-obsidian pb-10">
        <TouchableOpacity 
          onPress={logout}
          className="flex-row items-center justify-center h-14 rounded-2xl bg-surface-glass border border-destructive/20 active:bg-destructive/10"
        >
          <LogOut size={18} color="#ef4444" style={{ marginRight: 12 }} />
          <Text className="text-destructive font-black text-xs uppercase tracking-[2px]">Terminate Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const isAdmin = user.role === 'ADMIN' || user.role === 'OWNER';

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#f59e0b',
        drawerInactiveTintColor: '#a1a1aa',
        drawerActiveBackgroundColor: 'rgba(245, 158, 11, 0.08)',
        drawerLabelStyle: {
          fontWeight: '900',
          fontSize: 10.5,
          textTransform: 'uppercase',
          letterSpacing: 2.2,
          marginLeft: 4,
        },
        drawerItemStyle: {
          borderRadius: 16,
          paddingHorizontal: 8,
          marginVertical: 4,
          marginHorizontal: 12,
        },
        drawerStyle: {
          backgroundColor: '#0f1115',
          width: 300,
          borderRightWidth: 1,
          borderRightColor: 'rgba(255,255,255,0.05)',
        }
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
          drawerIcon: ({ focused }) => <LayoutGrid size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      
      <Drawer.Screen
        name="trainees"
        options={{
          drawerLabel: 'Members',
          title: 'Members',
          drawerIcon: ({ focused }) => <Users size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
          drawerItemStyle: isAdmin ? {} : { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="coaches"
        options={{
          drawerLabel: 'Coaches',
          title: 'Coaches',
          drawerIcon: ({ focused }) => <Contact size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
          drawerItemStyle: isAdmin ? {} : { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="membership-plans"
        options={{
          drawerLabel: 'Plans',
          title: 'Plans',
          drawerIcon: ({ focused }) => <Tags size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />

      <Drawer.Screen
        name="payments"
        options={{
          drawerLabel: 'Payments',
          title: 'Payments',
          drawerIcon: ({ focused }) => <CreditCard size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />

      <Drawer.Screen
        name="coach-availability"
        options={{
          drawerLabel: 'Schedules',
          title: 'Schedules',
          drawerIcon: ({ focused }) => <CalendarClock size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />

      <Drawer.Screen
        name="attendance"
        options={{
          drawerLabel: 'Attendance',
          title: 'Attendance',
          drawerIcon: ({ focused }) => <CheckCircle size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
          drawerItemStyle: (isAdmin || user.role === 'COACH') ? {} : { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="reports"
        options={{
          drawerLabel: 'Reports',
          title: 'Reports',
          drawerIcon: ({ focused }) => <BarChart2 size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
          drawerItemStyle: isAdmin ? {} : { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="machines"
        options={{
          drawerLabel: 'Inventory',
          title: 'Machines',
          drawerIcon: ({ focused }) => <Cpu size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
          drawerItemStyle: isAdmin ? {} : { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'System',
          title: 'Settings',
          drawerIcon: ({ focused }) => <SettingsIcon size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      
      <Drawer.Screen
        name="workout-plans"
        options={{
          drawerLabel: 'Training',
          title: 'Workout Plans',
          drawerIcon: ({ focused }) => <Dumbbell size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Identity',
          title: 'My Profile',
          drawerIcon: ({ focused }) => <UserIcon size={20} color={focused ? '#f59e0b' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
          headerShown: false,
        }}
      />

      {/* Utility/Action screens hidden from drawer */}
      <Drawer.Screen
        name="create-workout-plan"
        options={{
          drawerLabel: 'Build Protocol',
          title: 'Build Protocol',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="workout-plan-details/[id]"
        options={{
          drawerLabel: 'Protocol Intelligence',
          title: 'Protocol Intelligence',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="schedule-session"
        options={{
          drawerLabel: 'Schedule Session',
          title: 'Schedule Session',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="assign-membership"
        options={{
          drawerLabel: 'Assign Membership',
          title: 'Assign Membership',
          drawerIcon: ({ focused }) => <CreditCard size={20} color={focused ? '#fbbf24' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
          drawerItemStyle: isAdmin ? {} : { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="assign-trainee"
        options={{
          drawerLabel: 'Assign Trainee',
          title: 'Assign Trainee',
          drawerIcon: ({ focused }) => <UserCog size={20} color={focused ? '#fbbf24' : '#71717a'} strokeWidth={focused ? 2.5 : 2} />,
          drawerItemStyle: isAdmin ? {} : { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="create-coach"
        options={{
          drawerLabel: 'Create Coach',
          title: 'Create Coach',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="coach-details/[id]"
        options={{
          drawerLabel: 'Coach Details',
          title: 'Coach Details',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="create-trainee"
        options={{
          drawerLabel: 'Create Trainee',
          title: 'Create Trainee',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="trainee-details/[id]"
        options={{
          drawerLabel: 'Trainee Details',
          title: 'Trainee Details',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="create-membership-plan"
        options={{
          drawerLabel: 'Create Membership Plan',
          title: 'Create Membership Plan',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}

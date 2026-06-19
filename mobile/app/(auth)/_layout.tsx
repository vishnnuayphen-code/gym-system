import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function AuthLayout() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return null;

  // RoleRouter will handle the redirection after login based on the user's role

  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // RoleRouter will handle the specific dashboard redirect 
  // but we can provide a default here too for safety
  return <Redirect href="/(auth)/login" />;
}

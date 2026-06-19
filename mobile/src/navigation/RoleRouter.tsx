import React, { useEffect } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export const RoleRouter = () => {
  const { user, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    console.log(`RoleRouter: user=${user?.role}, segments=${segments.join('/')}, inAuth=${inAuthGroup}`);

    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      const role = user.role;
      const isAtRoot = (segments.length as number) === 0;
      
      if (inAuthGroup || isAtRoot) {
        // Only route to the correct dashboard based on role if at root or just logged in
        switch (role) {
          case 'SUPER_ADMIN':
            router.replace('/(superadmin)/overview' as any);
            break;
          case 'GYM_ADMIN':
          case 'ADMIN':
          case 'OWNER':
            router.replace('/(gym)/dashboard');
            break;
          case 'COACH':
            router.replace('/(coach)/dashboard');
            break;
          case 'TRAINEE':
            router.replace('/(trainee)/home');
            break;
          default:
            router.replace('/(auth)/login');
        }
      }
    }
  }, [user, isLoading, segments, rootNavigationState?.key]);

  return null;
};

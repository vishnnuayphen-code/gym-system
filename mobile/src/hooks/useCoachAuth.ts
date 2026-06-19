import { useRef } from 'react';
import { useAuthStore } from '../../store/authStore';

interface CoachAuth {
  coachId: string;
  firstName: string;
  lastName: string;
  gymId: string;
  role: string;
  name: string;
}

export function useCoachAuth(): CoachAuth {
  const { user } = useAuthStore();
  const cacheRef = useRef<CoachAuth | null>(null);

  if (cacheRef.current && cacheRef.current.coachId === String(user?.id)) {
    return cacheRef.current;
  }

  const name = user?.name || '';
  const parts = name.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';

  const result: CoachAuth = {
    coachId: String(user?.id || ''),
    firstName,
    lastName,
    gymId: String(user?.gymId || ''),
    role: user?.role || '',
    name,
  };

  cacheRef.current = result;
  return result;
}

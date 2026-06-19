import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingData {
  // Step 2
  photoUri: string | null;

  // Step 3
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  // Step 4
  heightCm: number | null;
  weightKg: number | null;
  bodyFatPercent: number | null;
  unitSystem: 'metric' | 'imperial';

  // Step 5
  primaryGoal: string;
  secondaryGoals: string[];
  targetWeightKg: number | null;

  // Step 6
  experienceLevel: string;
  workoutsPerWeek: number;
  preferredWorkoutTime: string;

  // Step 7
  membershipPlan: any | null;
  
  // Progress
  currentStep: number;
}

interface OnboardingState extends OnboardingData {
  updateData: (data: Partial<OnboardingData>) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const initialState: OnboardingData = {
  photoUri: null,
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phone: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  heightCm: null,
  weightKg: null,
  bodyFatPercent: null,
  unitSystem: 'metric',
  primaryGoal: '',
  secondaryGoals: [],
  targetWeightKg: null,
  experienceLevel: '',
  workoutsPerWeek: 3,
  preferredWorkoutTime: 'Morning',
  membershipPlan: null,
  currentStep: 1,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      updateData: (data) => set((state) => ({ ...state, ...data })),
      setStep: (step) => set({ currentStep: step }),
      reset: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import { create } from 'zustand';
import { TimeSlot } from './availabilityStore';

export interface Coach {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  photoUrl?: string;
  availableDays: string[]; // e.g. ["MON", "WED"]
}

interface BookingState {
  // Selections
  selectedCoachId: string | null;
  selectedCoach: Coach | null;
  selectedDate: string | null;       // "2024-03-15"
  selectedSlot: TimeSlot | null;
  selectedSessionType: 'PERSONAL_TRAINING' | 'GROUP_SESSION' | 'ONLINE_SESSION' | null;
  focusAreas: string[];
  notes: string;

  // UI state
  currentStep: 1 | 2 | 3 | 4;

  // Actions
  setCoach: (coach: Coach) => void;
  setDate: (date: string) => void;
  setSlot: (slot: TimeSlot | null) => void;
  setSessionType: (type: 'PERSONAL_TRAINING' | 'GROUP_SESSION' | 'ONLINE_SESSION') => void;
  setFocusAreas: (areas: string[]) => void;
  setNotes: (notes: string) => void;
  setStep: (step: 1 | 2 | 3 | 4) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedCoachId: null,
  selectedCoach: null,
  selectedDate: null,
  selectedSlot: null,
  selectedSessionType: null,
  focusAreas: [],
  notes: '',
  currentStep: 1,

  setCoach: (coach) => set({ 
    selectedCoach: coach, 
    selectedCoachId: coach.id,
    selectedDate: null, // Reset dependent fields
    selectedSlot: null 
  }),
  setDate: (date) => set({ selectedDate: date, selectedSlot: null }),
  setSlot: (slot) => set({ selectedSlot: slot }),
  setSessionType: (type) => set({ selectedSessionType: type }),
  setFocusAreas: (areas) => set({ focusAreas: areas }),
  setNotes: (notes) => set({ notes }),
  setStep: (step) => set({ currentStep: step }),
  reset: () => set({
    selectedCoachId: null,
    selectedCoach: null,
    selectedDate: null,
    selectedSlot: null,
    selectedSessionType: null,
    focusAreas: [],
    notes: '',
    currentStep: 1,
  }),
}));

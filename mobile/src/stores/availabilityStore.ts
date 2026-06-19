import { create } from 'zustand';

export type Day = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface TimeSlot {
  id: string; // The ID from backend, or a temp ID if unsaved
  day: Day;
  startTime: string;   // "07:00"
  endTime: string;     // "12:00"
  isAvailable: boolean;
  maxSessions: number;
  bookedCount: number;
  specificDate?: string; // e.g., "2026-06-01"
}

interface AvailabilityStore {
  slots: TimeSlot[];
  overrides: TimeSlot[];
  savedSnapshot: { slots: TimeSlot[], overrides: TimeSlot[] }; 
  isDirty: boolean;
  lastSaved: string | null;

  setAllSlots: (slots: TimeSlot[], overrides: TimeSlot[]) => void;
  setSlot: (day: Day, updates: Partial<TimeSlot>) => void;
  addOverride: (override: TimeSlot) => void;
  removeOverride: (id: string) => void;
  resetToSaved: () => void;
  markSaved: () => void;
}

export const useAvailabilityStore = create<AvailabilityStore>((set) => ({
  slots: [],
  overrides: [],
  savedSnapshot: { slots: [], overrides: [] },
  isDirty: false,
  lastSaved: null,

  setAllSlots: (slots, overrides) => set({
    slots,
    overrides,
    savedSnapshot: JSON.parse(JSON.stringify({ slots, overrides })),
    isDirty: false,
  }),

  setSlot: (day, updates) =>
    set((state) => ({
      slots: state.slots.map((s) =>
        s.day === day
          ? { ...s, ...updates }
          : s
      ),
      isDirty: true,
    })),

  addOverride: (override) =>
    set((state) => ({
      overrides: [...state.overrides, override],
      isDirty: true,
    })),

  removeOverride: (id) =>
    set((state) => ({
      overrides: state.overrides.filter(o => o.id !== id),
      isDirty: true,
    })),

  resetToSaved: () =>
    set((state) => ({
      slots: JSON.parse(JSON.stringify(state.savedSnapshot.slots)),
      overrides: JSON.parse(JSON.stringify(state.savedSnapshot.overrides)),
      isDirty: false,
    })),

  markSaved: () =>
    set((state) => ({
      savedSnapshot: JSON.parse(JSON.stringify({ slots: state.slots, overrides: state.overrides })),
      isDirty: false,
      lastSaved: new Date().toISOString(),
    })),
}));

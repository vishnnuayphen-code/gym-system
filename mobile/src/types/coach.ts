export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  photoUrl: string | null;
  gym: { id: string; name: string };
  rating?: number;
  reviewCount?: number;
}

export interface Session {
  id: string;
  traineeId: string;
  traineeName: string;
  traineePhoto: string | null;
  coachId: string;
  date: string;         // ISO string
  startTime: string;    // "09:00"
  endTime: string;      // "10:00"
  type: 'ONE_ON_ONE' | 'GROUP';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
}

export interface Trainee {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  membershipPlan: { name: string } | null;
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  lastAttendanceDate: string | null;
}

export interface TimeSlot {
  id: string;
  day: 'MON'|'TUE'|'WED'|'THU'|'FRI'|'SAT'|'SUN';
  period: 'MORNING'|'AFTERNOON'|'EVENING';
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxSessions: number;
  bookedCount: number;
}

export interface CoachProfile extends Coach {
  dateOfBirth: string | null;
  phone: string | null;
  bio: string | null;
  experienceYears: number | null;
  certifications: string[];
}

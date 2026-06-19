import api from '../../lib/api';
import { Coach, Session, Trainee, TimeSlot, CoachProfile } from '../types/coach';

export interface AssignedTraineeSummary {
  traineeId: string
  traineeName: string
  traineePhotoUrl: string | null
  preferredTime: string | null
  membershipStatus: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'NO_PLAN'
  upcomingSessions: number
}

export interface CoachWorkload {
  coachId: string
  coachName: string
  coachPhotoUrl: string | null
  specialization: string | null
  employmentType: 'FULL_TIME' | 'SESSION_BASED' | null
  sessionType: 'MORNING' | 'EVENING' | 'BOTH' | null
  traineeCount: number
  personalTraineeCount: number
  upcomingSessionCount: number
  workloadLevel: 'UNASSIGNED' | 'LOW' | 'MEDIUM' | 'HIGH' | 'OVERLOADED'
  assignedTrainees: AssignedTraineeSummary[]
}

export const coachService = {
    // Dashboard
    getAll: async () => {
        const response = await api.get('/coaches');
        return response.data;
    },
    getCoachDashboard: async (coachId: string) => {
        const response = await api.get(`/dashboard/coach/${coachId}`);
        const data = response.data;
        
        // Map backend stats to dashboard expected format
        return {
            todaySessions: data.todaySessions || 0,
            activeTrainees: data.myTrainees || 0,
            pendingCheckins: 0, // TODO: backend pendingCheckins needed
            upcomingSessions: data.upcomingSessions || []
        };
    },

    create: async (payload: any) => {
        const response = await api.post('/coaches', payload);
        return response.data;
    },

    update: async (coachId: string, payload: any) => {
        const response = await api.put(`/coaches/${coachId}`, payload);
        return response.data;
    },

    getById: async (coachId: string) => {
        const response = await api.get(`/coaches/${coachId}`);
        return response.data;
    },

    // Trainees
    getAssignedTrainees: async (coachId: string): Promise<any[]> => {
        console.log('[coachService] getAssignedTrainees coachId=', coachId);
        try {
            // Use /coaches/me/trainees for the logged-in coach (JWT authenticated)
            const response = await api.get('/coaches/me/trainees');
            return Array.isArray(response.data) ? response.data : [];
        } catch (e: any) {
            console.error('[coachService] getAssignedTrainees error:', e?.response?.status, JSON.stringify(e?.response?.data));
            throw e;
        }
    },

    getTraineeDetail: async (traineeId: string): Promise<any> => {
        const response = await api.get(`/trainees/${traineeId}`);
        return response.data;
    },

    // Sessions
    getCoachSessions: async (coachId: string, date?: string): Promise<Session[]> => {
        const response = await api.get(`/sessions/coach/${coachId}`);
        let sessions = response.data.data || [];
        
        if (date) {
            // Frontend filtering if backend doesn't support ?date=
            sessions = sessions.filter((s: any) => s.sessionDate === date);
        }
        
        return sessions.map((s: any) => ({
            id: s.id.toString(),
            traineeId: s.trainee.id.toString(),
            traineeName: s.trainee.name,
            traineePhoto: s.trainee.profilePhotoUrl,
            coachId: s.coach.id.toString(),
            date: s.sessionDate,
            startTime: s.startTime.substring(0, 5),
            endTime: s.endTime.substring(0, 5),
            type: s.sessionType || 'ONE_ON_ONE',
            status: s.status,
            notes: s.sessionNotes
        }));
    },

    updateSessionStatus: async (sessionId: string, status: string, notes?: string) => {
        const response = await api.put(`/sessions/${sessionId}`, {
            status,
            sessionNotes: notes
        });
        return response.data.data;
    },

    // Availability
    getAvailability: async (coachId: string): Promise<{weekly: TimeSlot[], overrides: TimeSlot[]}> => {
        console.log('[coachService] getAvailability coachId=', coachId, 'type=', typeof coachId);
        try {
            const numericId = Number(coachId);
            if (isNaN(numericId) || numericId <= 0) {
                console.error('[coachService] Invalid coachId for availability:', coachId);
                return { weekly: [], overrides: [] };
            }
            const response = await api.get(`/coach-availability/${numericId}`);
            if (response.data.success) {
                const slots = response.data.data;
                const weekly = slots.filter((s: any) => !s.specificDate).map((s: any) => ({
                    id: s.id.toString(),
                    day: s.dayOfWeek.substring(0, 3) as any,
                    startTime: s.startTime.substring(0, 5),
                    endTime: s.endTime.substring(0, 5),
                    isAvailable: s.isAvailable !== false,
                    maxSessions: 3,
                    bookedCount: 0
                }));
                const overrides = slots.filter((s: any) => s.specificDate).map((s: any) => ({
                    id: s.id.toString(),
                    day: s.dayOfWeek ? s.dayOfWeek.substring(0, 3) : 'MON',
                    specificDate: s.specificDate,
                    startTime: s.startTime.substring(0, 5),
                    endTime: s.endTime.substring(0, 5),
                    isAvailable: s.isAvailable !== false,
                    maxSessions: 3,
                    bookedCount: 0
                }));
                return { weekly, overrides };
            }
            return { weekly: [], overrides: [] };
        } catch (e: any) {
            console.error('[coachService] getAvailability error:', e?.response?.status, JSON.stringify(e?.response?.data));
            throw e;
        }
    },

    updateAvailability: async (coachId: string, slots: any[], overrides: any[], existingIdsToDelete: string[]) => {
        // First delete the old slots to avoid duplicates
        if (existingIdsToDelete && existingIdsToDelete.length > 0) {
            const deletePromises = existingIdsToDelete.map(id => 
                api.delete(`/coach-availability/${id}`).catch(err => {
                    console.log('Failed to delete old slot', id, err);
                })
            );
            await Promise.all(deletePromises);
        }
        
        const slotPromises = slots.filter(s => s.isAvailable).map(slot => {
            return api.post('/coach-availability', {
                coachId: Number(coachId),
                dayOfWeek: mapDayToBackend(slot.day),
                startTime: slot.startTime + ":00",
                endTime: slot.endTime + ":00",
                recurrenceType: 'WEEKLY',
                isAvailable: true
            });
        });

        const overridePromises = overrides.map(override => {
            return api.post('/coach-availability', {
                coachId: Number(coachId),
                specificDate: override.specificDate,
                startTime: override.startTime + ":00",
                endTime: override.endTime + ":00",
                recurrenceType: 'NONE',
                isAvailable: override.isAvailable
            });
        });

        return Promise.all([...slotPromises, ...overridePromises]);
    },

    // Profile
    getCoachProfile: async (coachId: string): Promise<CoachProfile> => {
        const response = await api.get(`/coaches/${coachId}`);
        const data = response.data;
        return {
            id: data.id.toString(),
            firstName: data.name ? data.name.split(' ')[0] : '',
            lastName: data.name ? data.name.split(' ').slice(1).join(' ') : '',
            specialty: data.specialization || '',
            photoUrl: data.profilePhotoUrl,
            gym: { id: data.gymId?.toString() || '', name: data.gymName || '' },
            bio: data.bio || '',
            experienceYears: data.experienceYears || 0,
            certifications: data.certificationName ? [data.certificationName] : [],
            dateOfBirth: null,
            phone: null,
        };
    },

    updateCoachProfile: async (coachId: string, data: any) => {
        const response = await api.put(`/coaches/me`, {
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            specialization: data.specialty,
            bio: data.bio,
            experienceYears: data.experienceYears,
            profilePhotoUrl: data.photoUrl
        });
        return response.data;
    },

    getCoachTrainees: async (coachId: string) => {
        const response = await api.get(`/coaches/${coachId}/trainees`);
        return response.data;
    },
    assignTrainee: async (coachId: string, traineeId: string) => {
        const response = await api.post('/coaches/assign-trainee', { coachId, traineeId });
        return response.data;
    },
    getWorkload: async (): Promise<CoachWorkload[]> => {
        console.log('[coachService] getWorkload started');
        try {
            const response = await api.get('/coaches/workload');
            console.log('[coachService] getWorkload response count:', response.data?.length || 0);
            return response.data;
        } catch (e: any) {
            console.error('[coachService] getWorkload error:', e?.response?.status, JSON.stringify(e?.response?.data));
            throw e;
        }
    }
};

const mapDayToBackend = (day: string) => {
    const mapping: any = {
        'MON': 'MONDAY', 'TUE': 'TUESDAY', 'WED': 'WEDNESDAY',
        'THU': 'THURSDAY', 'FRI': 'FRIDAY', 'SAT': 'SATURDAY', 'SUN': 'SUNDAY'
    };
    return mapping[day];
};

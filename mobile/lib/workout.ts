import api from './api';

export interface ExerciseRequest {
    name: string;
    sets: number;
    reps: number;
    restSeconds?: number;
    notes?: string;
    videoUrl?: string;
}

export interface WorkoutDayRequest {
    dayLabel: string;
    focusArea?: string;
    exercises: ExerciseRequest[];
}

export interface CreateWorkoutPlanRequest {
    title: string;
    description?: string;
    traineeId: number;
    startDate?: string;
    endDate?: string;
    workoutDays: WorkoutDayRequest[];
}

export interface WorkoutPlanResponse {
    id: number;
    title: string;
    description: string;
    coachId: number;
    coachName: string;
    traineeId: number;
    traineeName: string;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
    workoutDays: WorkoutDayResponse[];
}

export interface WorkoutDayResponse {
    id: number;
    dayLabel: string;
    focusArea: string;
    exercises: ExerciseResponse[];
}

export interface ExerciseResponse {
    id: number;
    name: string;
    sets: number;
    reps: number;
    restSeconds: number;
    notes: string;
    videoUrl: string;
}

export const workoutService = {
    createPlan: async (request: CreateWorkoutPlanRequest) => {
        const response = await api.post<WorkoutPlanResponse>('/workout-plans', request);
        return response.data;
    },
    getTraineePlans: async (traineeId: number) => {
        const response = await api.get<WorkoutPlanResponse[]>(`/workout-plans/trainee/${traineeId}`);
        return response.data;
    },
    getPlanById: async (id: number) => {
        const response = await api.get<WorkoutPlanResponse>(`/workout-plans/${id}`);
        return response.data;
    },
    updatePlan: async (id: number, request: any) => {
        const response = await api.put<WorkoutPlanResponse>(`/workout-plans/${id}`, request);
        return response.data;
    },
    deletePlan: async (id: number) => {
        await api.delete(`/workout-plans/${id}`);
    },
    addDay: async (planId: number, day: WorkoutDayRequest) => {
        const response = await api.post<WorkoutPlanResponse>(`/workout-plans/${planId}/days`, day);
        return response.data;
    },
    addExercise: async (dayId: number, exercise: ExerciseRequest) => {
        const response = await api.post<WorkoutPlanResponse>(`/workout-days/${dayId}/exercises`, exercise);
        return response.data;
    }
};

import api from '../../lib/api';

export const workoutService = {
  getAll: async () => {
    const res = await api.get('/workout-plans');
    return res.data.data || res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/workout-plans/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/workout-plans', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/workout-plans/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/workout-plans/${id}`);
    return res.data;
  },
  addDay: async (planId: string, data: any) => {
    const res = await api.post(`/workout-plans/${planId}/days`, data);
    return res.data;
  },
  addExercise: async (dayId: string, data: any) => {
    const res = await api.post(`/workout-days/${dayId}/exercises`, data);
    return res.data;
  },
  getForTrainee: async (traineeId: string) => {
    const res = await api.get(`/workout-plans/trainee/${traineeId}`);
    return res.data.data || res.data;
  }
};

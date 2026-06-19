import api from '../../lib/api';

export const sessionService = {
  getAll: async () => {
    const res = await api.get('/sessions');
    return res.data.data || res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/sessions', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/sessions/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/sessions/${id}`);
    return res.data;
  },
  getForTrainee: async (traineeId: string) => {
    const res = await api.get(`/sessions/trainee/${traineeId}`);
    return res.data.data || res.data;
  },
  getForCoach: async (coachId: string) => {
    const res = await api.get(`/sessions/coach/${coachId}`);
    return res.data.data || res.data;
  },
  accept: async (id: number, data?: any) => {
    const res = await api.post(`/sessions/${id}/accept`, data);
    return res.data;
  },
  reject: async (id: number) => {
    const res = await api.post(`/sessions/${id}/reject`);
    return res.data;
  },
  bookMachine: async (sessionId: number, machineId: number) => {
    const res = await api.post(`/sessions/${sessionId}/book-machine?machineId=${machineId}`);
    return res.data;
  }
};

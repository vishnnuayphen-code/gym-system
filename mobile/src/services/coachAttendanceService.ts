import api from '../../lib/api';

export const coachAttendanceService = {
  markAttendance: async (data: any) => {
    const res = await api.post('/coach-attendance', data);
    return res.data;
  },
  getForCoach: async (coachId: string) => {
    const res = await api.get(`/coach-attendance/coach/${coachId}`);
    return res.data;
  },
  getByDate: async (date: string) => {
    const res = await api.get(`/coach-attendance/date/${date}`);
    return res.data;
  },
  update: async (id: string, data: {
    checkOutTime?: string   // "HH:mm"
    notes?: string
  }) => {
    const res = await api.put(`/coach-attendance/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/coach-attendance/${id}`);
    return res.data;
  }
};

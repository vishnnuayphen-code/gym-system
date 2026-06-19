import api from '../../lib/api';

export const traineeService = {
  getAll: async () => {
    const res = await api.get('/trainees');
    // Backend often wraps lists in a data field or returns an array directly
    return res.data.data || res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/trainees/${id}`);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/trainees/me');
    return res.data;
  },
  updateMe: async (data: any) => {
    const res = await api.put('/trainees/me', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/trainees/${id}`, data);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/trainees', data);
    return res.data;
  }
};

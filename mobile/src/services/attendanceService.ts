import api from '../../lib/api';

export const attendanceService = {
  checkIn: async (data: any) => {
    const res = await api.post('/attendance', data);
    return res.data;
  },
  getForTrainee: async (traineeId: string) => {
    const res = await api.get(`/attendance/trainee/${traineeId}`);
    const data = res.data.data || res.data;
    return data.map((r: any) => ({
      ...r,
      date: r.attendanceDate || r.date,
      markedBy: r.markedByName || r.markedBy,
      traineePhoto: r.traineePhotoUrl || r.traineePhoto || null,
    }));
  },
  getByDate: async (date: string) => {
    const res = await api.get(`/attendance/date/${date}`);
    const data = res.data.data || res.data;
    return data.map((r: any) => ({
      ...r,
      date: r.attendanceDate || r.date,
      markedBy: r.markedByName || r.markedBy,
      traineePhoto: r.traineePhotoUrl || r.traineePhoto || null,
    }));
  },
  update: async (id: string, data: {
    status?: 'PRESENT' | 'ABSENT' | 'EXCUSED'
    checkOutTime?: string   // "HH:mm"
    notes?: string
  }) => {
    const res = await api.put(`/attendance/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/attendance/${id}`);
    return res.data;
  }
};

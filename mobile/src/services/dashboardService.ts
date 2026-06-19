import api from '../../lib/api';

export const dashboardService = {
  getOwnerDashboard: async () => {
    const res = await api.get('/dashboard/owner');
    return res.data;
  },
  getCoachDashboard: async (coachId: string) => {
    const res = await api.get(`/dashboard/coach/${coachId}`);
    return res.data;
  },
  getTraineeDashboard: async (traineeId: string) => {
    const res = await api.get(`/dashboard/trainee/${traineeId}`);
    return res.data;
  }
};

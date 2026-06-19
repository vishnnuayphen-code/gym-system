import api from '../../lib/api';

export const analyticsService = {
  getDashboardSummary: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await api.get(`/super-admin/analytics/dashboard?${params.toString()}`);
    return res.data.data || res.data;
  },
  getRevenueAnalytics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await api.get(`/super-admin/analytics/revenue?${params.toString()}`);
    return res.data.data || res.data;
  },
  getMemberAnalytics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await api.get(`/super-admin/analytics/members?${params.toString()}`);
    return res.data.data || res.data;
  },
  getAttendanceAnalytics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await api.get(`/super-admin/analytics/attendance?${params.toString()}`);
    return res.data.data || res.data;
  },
  getCoachAnalytics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await api.get(`/super-admin/analytics/coaches?${params.toString()}`);
    return res.data.data || res.data;
  },
  getSessionAnalytics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await api.get(`/super-admin/analytics/sessions?${params.toString()}`);
    return res.data.data || res.data;
  },
  getGymComparison: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await api.get(`/super-admin/analytics/gyms?${params.toString()}`);
    return res.data.data || res.data;
  }
};

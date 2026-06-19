import api from '../../lib/api';

export const superAdminService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/super-admin/dashboard');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard stats');
    } catch (e: any) {
      console.error('[superAdminService] getDashboardStats error:', e);
      throw e;
    }
  },

  getAllGyms: async () => {
    try {
      const response = await api.get('/super-admin/gyms');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch gyms');
    } catch (e: any) {
      console.error('[superAdminService] getAllGyms error:', e);
      throw e;
    }
  },

  createGymTenant: async (payload: any) => {
    try {
      const response = await api.post('/super-admin/gyms', payload);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create tenant');
    } catch (e: any) {
      console.error('[superAdminService] createGymTenant error:', e?.response?.data || e.message);
      throw e;
    }
  },

  toggleGymStatus: async (gymId: number) => {
    try {
      const response = await api.patch(`/super-admin/gyms/${gymId}/toggle-status`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to toggle gym status');
    } catch (e: any) {
      console.error('[superAdminService] toggleGymStatus error:', e);
      throw e;
    }
  },

  getAllMembers: async () => {
    try {
      const response = await api.get('/super-admin/members');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch members');
    } catch (e: any) {
      console.error('[superAdminService] getAllMembers error:', e);
      throw e;
    }
  },

  getAllCoaches: async () => {
    try {
      const response = await api.get('/super-admin/coaches');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch coaches');
    } catch (e: any) {
      console.error('[superAdminService] getAllCoaches error:', e);
      throw e;
    }
  },

  getGymDetails: async (gymId: number) => {
    try {
      const response = await api.get(`/super-admin/gyms/${gymId}/details`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch gym details');
    } catch (e: any) {
      console.error('[superAdminService] getGymDetails error:', e);
      throw e;
    }
  },

  updateGym: async (gymId: number, payload: any) => {
    try {
      const { openingTime, closingTime, ...basicInfo } = payload;

      // Update basic gym info
      const response = await api.put(`/super-admin/gyms/${gymId}`, basicInfo);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update gym');
      }

      // Update gym settings (hours) if provided
      if (openingTime || closingTime) {
        const settingsPayload: any = {};
        if (openingTime) settingsPayload.openingTime = openingTime;
        if (closingTime) settingsPayload.closingTime = closingTime;

        const settingsResponse = await api.put('/api/gym/settings', settingsPayload);
        if (!settingsResponse.data.openingTime) {
          throw new Error('Failed to update gym hours');
        }
      }

      return response.data.data;
    } catch (e: any) {
      console.error('[superAdminService] updateGym error:', e?.response?.data || e.message);
      throw e;
    }
  },

  getAllAdmins: async () => {
    try {
      const response = await api.get('/super-admin/admins');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch admins');
    } catch (e: any) {
      console.error('[superAdminService] getAllAdmins error:', e);
      throw e;
    }
  },

  createAdmin: async (payload: any) => {
    try {
      const response = await api.post('/super-admin/admins', payload);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create admin');
    } catch (e: any) {
      console.error('[superAdminService] createAdmin error:', e?.response?.data || e.message);
      throw e;
    }
  },

  updateAdmin: async (adminId: number, payload: any) => {
    try {
      const response = await api.put(`/super-admin/admins/${adminId}`, payload);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update admin');
    } catch (e: any) {
      console.error('[superAdminService] updateAdmin error:', e?.response?.data || e.message);
      throw e;
    }
  },

  toggleAdminStatus: async (adminId: number) => {
    try {
      const response = await api.patch(`/super-admin/admins/${adminId}/toggle-status`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to toggle admin status');
    } catch (e: any) {
      console.error('[superAdminService] toggleAdminStatus error:', e);
      throw e;
    }
  },

  resetAdminPassword: async (adminId: number, newPassword: string) => {
    try {
      const response = await api.patch(`/super-admin/admins/${adminId}/reset-password`, { newPassword });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to reset admin password');
    } catch (e: any) {
      console.error('[superAdminService] resetAdminPassword error:', e);
      throw e;
    }
  }
};

import api from '../../lib/api';

export const membershipService = {
  getPlans: async () => {
    const res = await api.get('/memberships/plans');
    return res.data.data || res.data;
  },
  getPlanById: async (planId: string) => {
    const res = await api.get(`/memberships/plans/${planId}`);
    return res.data;
  },
  createPlan: async (data: any) => {
    const res = await api.post('/memberships/plans', data);
    return res.data;
  },
  updatePlan: async (planId: string, data: any) => {
    const res = await api.put(`/memberships/plans/${planId}`, data);
    return res.data;
  },
  assign: async (traineeId: string, planId: string, startDate: string) => {
    const res = await api.post('/memberships/assign', { 
      traineeId: parseInt(traineeId), 
      membershipPlanId: parseInt(planId), 
      startDate 
    });
    return res.data;
  },
  recordPayment: async (data: {
    traineeId: string;
    planId: string;
    membershipId?: string | number | null;
    amount: number;
    method: 'CASH' | 'CARD' | 'TRANSFER';
    date: string;
  }) => {
    // Map to backend field names
    const backendData = {
      traineeMembershipId: data.membershipId,
      amount: data.amount,
      paymentMethod: data.method,
      // Default other fields for now
      taxAmount: 0,
      discountAmount: 0,
    };
    const res = await api.post('/memberships/payment', backendData);
    return res.data;
  },
  getMembershipsForTrainee: async (traineeId: string) => {
    const res = await api.get(`/memberships/trainee/${traineeId}`);
    return res.data.data || res.data;
  },
  getAllMembershipsForTrainee: async (traineeId: string) => {
    const res = await api.get(`/memberships/trainee/${traineeId}/all`);
    return res.data.data || res.data;
  },
  getPaymentsForTrainee: async (traineeId: string) => {
    const res = await api.get(`/memberships/payments/${traineeId}`);
    return res.data.data || res.data;
  },
  getRecentPayments: async () => {
    const res = await api.get('/memberships/payments/recent');
    return res.data.data || res.data;
  },
  validateMembership: async (traineeId: string) => {
    const res = await api.get(`/memberships/validate/${traineeId}`);
    return res.data;
  },
  getMyMembership: async () => {
    const res = await api.get('/memberships/me');
    return res.data;
  },
  getMyPayments: async () => {
    const res = await api.get('/memberships/me/payments');
    return res.data.data || res.data;
  },
  getSubscribersForPlan: async (planId: string): Promise<PlanSubscriber[]> => {
    const res = await api.get(`/memberships/plans/${planId}/subscribers`);
    return res.data;
  },
  getAllActiveMemberships: async (): Promise<PlanSubscriber[]> => {
    const res = await api.get('/memberships/active');
    return res.data;
  }
};

export interface PlanSubscriber {
  traineeId: string;
  traineeName: string;
  traineeEmail: string;
  traineePhotoUrl: string | null;
  traineePhone: string | null;
  planId: string;
  planName: string;
  planPrice: number;
  planDurationDays: number;
  membershipId: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  membershipStatus: 'ACTIVE' | 'EXPIRING' | 'EXPIRED';
  amountPaid: number | null;
  paymentMethod: string | null;
  paymentDate: string | null;
}

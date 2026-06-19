import api from '../../lib/api';

// Interfaces
export interface MachineBooking {
  id: number;
  machineName?: string;
  machineId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  coachName?: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt?: string;
  notes?: string;
}

export interface BookMachineRequest {
  machineId: number;
  bookingDate: string; // 'YYYY-MM-DD'
  startTime: string;   // 'HH:mm'
  endTime: string;     // 'HH:mm'
}

export interface RescheduleBookingRequest {
  newDate: string;     // 'YYYY-MM-DD'
  newStartTime: string; // 'HH:mm'
  newEndTime: string;   // 'HH:mm'
}

export interface Waitlist {
  id: number;
  position: number;
  status: 'WAITING' | 'NOTIFIED' | 'BOOKED' | 'EXPIRED';
  expiresAt?: string;
}

export interface WaitlistRequest {
  machineId: number;
  requestedDate: string; // 'YYYY-MM-DD'
}

// Service
export const machineBookingService = {
  /**
   * Book a machine for the current trainee
   */
  bookMachine: async (request: BookMachineRequest): Promise<MachineBooking> => {
    const res = await api.post('/machines/bookings/book', request);
    return res.data;
  },

  /**
   * Get all bookings for current trainee
   */
  getMyBookings: async (status?: string) => {
    const res = await api.get('/machines/bookings/my-bookings', {
      params: status ? { status } : undefined,
    });
    return res.data;
  },

  /**
   * Get upcoming bookings from today onwards
   */
  getUpcomingBookings: async (): Promise<MachineBooking[]> => {
    const res = await api.get('/machines/bookings/upcoming');
    return res.data;
  },

  /**
   * Reschedule an existing booking
   */
  rescheduleBooking: async (
    bookingId: number,
    request: RescheduleBookingRequest
  ): Promise<MachineBooking> => {
    const res = await api.put(`/machines/bookings/${bookingId}/reschedule`, request);
    return res.data;
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (bookingId: number, reason?: string) => {
    const res = await api.put(`/machines/bookings/${bookingId}/cancel`, {
      reason: reason || 'User cancelled',
    });
    return res.data;
  },

  /**
   * Coach pre-books a machine for a trainee
   */
  coachBookMachine: async (request: any) => {
    const res = await api.post('/machines/bookings/coach-book', request);
    return res.data;
  },

  // ============= WAITLIST OPERATIONS =============

  /**
   * Join waitlist for a machine on a specific date
   */
  joinWaitlist: async (request: WaitlistRequest): Promise<Waitlist> => {
    const res = await api.post('/machines/waitlist/join', request);
    return res.data;
  },

  /**
   * Get current waitlist position
   */
  getWaitlistPosition: async (
    machineId: number,
    date: string // 'YYYY-MM-DD'
  ): Promise<Waitlist | null> => {
    try {
      const res = await api.get('/machines/waitlist/my-position', {
        params: { machineId, date },
      });
      // Check if user is in waitlist
      if (res.data.message === 'Not in waitlist') {
        return null;
      }
      return res.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Leave waitlist
   */
  leaveWaitlist: async (waitlistId: number) => {
    const res = await api.delete(`/machines/waitlist/${waitlistId}`);
    return res.data;
  },
};

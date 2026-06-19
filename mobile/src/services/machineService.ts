import api from '../../lib/api';

export interface Machine {
  id: number;
  name: string;
  type: string;
  description?: string;
  quantity: number;
  imageUrl?: string;
  serialNumber?: string;
  locationInGym?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
  availabilitySlots?: AvailabilitySlot[];
  totalBookingsToday?: number;
}

export interface AvailabilitySlot {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxBookings: number;
  currentBookings: number;
  isActive: boolean;
  isFull: boolean;
}

export const machineService = {
  getAll: async (search?: string) => {
    const res = await api.get('/machines', { params: { search } });
    return res.data;
  },

  getById: async (id: string | number) => {
    const res = await api.get(`/machines/${id}`);
    return res.data;
  },

  create: async (machineData: any, image?: { uri: string; type: string; name: string }) => {
    const formData = new FormData();
    // Spring Boot expects a part named "machine"
    // We send it as a stringified JSON string
    formData.append('machine', JSON.stringify(machineData));

    if (image) {
      formData.append('image', {
        uri: image.uri,
        type: image.type,
        name: image.name,
      } as any);
    }

    const res = await api.post('/machines', formData);
    return res.data;
  },

  update: async (id: string | number, data: any) => {
    const res = await api.put(`/machines/${id}`, data);
    return res.data;
  },

  delete: async (id: string | number) => {
    const res = await api.delete(`/machines/${id}`);
    return res.data;
  },

  uploadImage: async (id: string | number, image: { uri: string; type: string; name: string }) => {
    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      type: image.type,
      name: image.name,
    } as any);

    const res = await api.post(`/machines/${id}/image`, formData);
    return res.data;
  },

  getAvailability: async (id: string | number) => {
    const res = await api.get(`/machines/${id}/availability`);
    return res.data;
  },

  addSlot: async (id: string | number, slotData: any) => {
    const res = await api.post(`/machines/${id}/availability`, slotData);
    return res.data;
  },

  deleteSlot: async (machineId: string | number, slotId: string | number) => {
    const res = await api.delete(`/machines/${machineId}/availability/${slotId}`);
    return res.data;
  }
};

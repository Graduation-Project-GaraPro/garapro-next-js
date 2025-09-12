import { apiRequest } from '@/services/apiClient';

export const AppointmentsService = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = `/appointments${query ? `?${query}` : ''}`;
    return apiRequest(path);
  },

  async getById(id) {
    return apiRequest(`/appointments/${id}`);
  }
};



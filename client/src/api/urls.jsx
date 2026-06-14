import api from './axios';

const USE_MOCK = false;

export const urlApi = {
  getUrls: async () => {
    const response = await api.get('/api/urls');
    return response.data.data.urls;
  },
  createUrl: async (data) => {
    const response = await api.post('/api/urls', data);
    return response.data.data.url;
  },
  updateUrl: async (id, data) => {
    const response = await api.put(`/api/urls/${id}`, data);
    return response.data.data.url;
  },
  deleteUrl: async (id) => {
    const response = await api.delete(`/api/urls/${id}`);
    return response.data;
  },
  bulkCreate: async (urls) => {
    const response = await api.post('/api/urls/bulk', { urls });
    return response.data.data;
  }
};


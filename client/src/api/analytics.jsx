import api from './axios';

const USE_MOCK = false;

export const analyticsApi = {
  getAnalytics: async (urlId) => {
    const response = await api.get(`/api/analytics/${urlId}`);
    return response.data.data;
  },
  getPublicStats: async (shortCode) => {
    const response = await api.get(`/api/analytics/stats/${shortCode}`);
    return response.data.data;
  }
};


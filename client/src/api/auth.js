import api from './axios';

// To be toggled when backend is ready
const USE_MOCK = false;

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data.data;
  },
  register: async (name, email, password) => {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data.data;
  },
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data.data;
  }
};

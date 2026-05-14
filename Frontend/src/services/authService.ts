import apiClient from './apiClient';

export const authService = {
  login: (payload: { email: string; password: string }) => apiClient.post('/auth/login', payload),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me')
};

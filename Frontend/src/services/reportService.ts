import apiClient from './apiClient';

export const reportService = {
  monthly: (params?: Record<string, any>) => apiClient.get('/reports/monthly', { params }).then((response) => response.data.data),
  employeeWise: () => apiClient.get('/reports/employees').then((response) => response.data.data),
  assetWise: () => apiClient.get('/reports/assets').then((response) => response.data.data),
  overdue: (params?: Record<string, any>) => apiClient.get('/reports/overdue', { params }).then((response) => response.data.data)
};

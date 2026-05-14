import { Employee } from '../types';
import apiClient from './apiClient';
import { normalizeEmployee } from './transformers';

export const employeeService = {
  list: () => apiClient.get('/employees').then((response) => (response.data.data as any[]).map(normalizeEmployee) as Employee[]),
  create: (payload: Employee) => apiClient.post('/employees', payload).then((response) => normalizeEmployee(response.data.data) as Employee),
  update: (id: string, payload: Partial<Employee>) => apiClient.put(`/employees/${id}`, payload).then((response) => normalizeEmployee(response.data.data) as Employee),
  remove: (id: string) => apiClient.delete(`/employees/${id}`)
};

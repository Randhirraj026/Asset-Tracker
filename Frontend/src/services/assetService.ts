import { Asset } from '../types';
import apiClient from './apiClient';
import { normalizeAsset } from './transformers';

export const assetService = {
  list: () => apiClient.get('/assets').then((response) => (response.data.data as any[]).map(normalizeAsset) as Asset[]),
  create: (payload: Partial<Asset>) => apiClient.post('/assets', payload).then((response) => normalizeAsset(response.data.data) as Asset),
  update: (id: string, payload: Partial<Asset>) => apiClient.put(`/assets/${id}`, payload).then((response) => normalizeAsset(response.data.data) as Asset),
  remove: (id: string) => apiClient.delete(`/assets/${id}`),
  assign: (assetId: string, employeeId: string) => apiClient.post(`/assets/${assetId}/assign`, { employeeId }),
  generateQr: (assetId: string) => apiClient.post('/qr/generate', { assetId }).then((response) => response.data.data)
};

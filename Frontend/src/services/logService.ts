import { LogEntry, MovementType } from '../types';
import apiClient from './apiClient';
import { normalizeLog } from './transformers';

export const logService = {
  list: () => apiClient.get('/logs').then((response) => response.data.data.map(normalizeLog) as LogEntry[]),
  scan: (payload: { qrData?: string; assetId?: string; employeeId?: string; serialNumber?: string; movementType: MovementType }) => apiClient.post('/logs/scan', payload).then((response) => response.data.data)
};

import { Asset, Employee, LogEntry } from '../types';

export const normalizeEmployee = (employee: any): Employee => ({
  id: employee.id,
  employeeId: employee.employeeId || employee.empId || '',
  empId: employee.empId || employee.employeeId || '',
  name: employee.name || '',
  email: employee.email || '',
  department: employee.department || '',
  designation: employee.designation || '',
  phone: employee.phone || ''
});

export const normalizeAsset = (asset: any): Asset => ({
  id: asset.id,
  assetId: asset.assetId || '',
  type: asset.assetType || asset.type || '',
  deviceName: asset.deviceName || undefined,
  serialNumber: asset.serialNumber || '',
  model: asset.model || '',
  assignedEmployee: asset.assignedEmployee?.name || asset.assignedEmployee || '',
  employeeId: asset.assignedEmployee?.empId || asset.employeeId || asset.assignedEmployeeId || '',
  status: asset.status || 'IN_OFFICE'
});

export const normalizeLog = (log: any): LogEntry => ({
  id: log.id,
  employeeName: log.employee?.name || log.employeeName || '',
  asset: log.asset?.assetId || log.asset || '',
  exitTime: log.exitTime ? new Date(log.exitTime).toLocaleString() : '',
  entryTime: log.entryTime ? new Date(log.entryTime).toLocaleString() : '',
  duration: log.totalHours ? `${log.totalHours}h` : log.duration || '',
  status: log.status || 'IN'
});

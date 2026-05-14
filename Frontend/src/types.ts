export type AssetStatus = 'IN_OFFICE' | 'OUTSIDE' | 'RETURNED' | 'MAINTENANCE' | 'LOST';
export type ScanStatus = 'IN' | 'OUT' | 'OVERDUE';
export type MovementType = 'OUT' | 'IN' | 'MAINTENANCE';

export interface Employee {
  id?: string;
  employeeId: string;
  empId?: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  phone: string;
}

export interface Asset {
  id?: string;
  assetId: string;
  type: string;
  deviceName?: string;
  serialNumber: string;
  model: string;
  assignedEmployee: string;
  employeeId: string;
  status: AssetStatus;
}

export interface LogEntry {
  id: string;
  employeeName: string;
  asset: string;
  exitTime: string;
  entryTime: string;
  duration: string;
  status: ScanStatus;
}

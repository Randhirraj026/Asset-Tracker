import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Boxes, Building2, Clock, Users } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { assetService } from '../services/assetService';
import { employeeService } from '../services/employeeService';
import { logService } from '../services/logService';
import { ColumnDef } from '@tanstack/react-table';
import { Asset, Employee, LogEntry } from '../types';

const colors = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([assetService.list(), employeeService.list(), logService.list()])
      .then(([assetData, employeeData, logData]) => {
        setAssets(assetData);
        setEmployees(employeeData);
        setLogs(logData);
      })
      .catch((error) => {
        console.error('Dashboard data load failed:', error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const categoryData = useMemo(() => Object.entries(assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })), [assets]);

  const usageData = useMemo(() => Object.entries(assets.reduce((acc, asset) => {
    if (!asset.assignedEmployee) return acc;
    acc[asset.assignedEmployee] = (acc[asset.assignedEmployee] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, assets]) => ({ name, assets })), [assets]);

  const monthlyMovement = useMemo(() => {
    const grouped = logs.reduce((acc, log) => {
      const timestamp = log.exitTime || log.entryTime;
      if (!timestamp) return acc;
      const month = new Date(timestamp).toLocaleString('default', { month: 'short' });
      const entry = acc[month] || { month, exits: 0, entries: 0 };
      if (log.status === 'OUT') entry.exits += 1;
      if (log.status === 'IN') entry.entries += 1;
      acc[month] = entry;
      return acc;
    }, {} as Record<string, { month: string; exits: number; entries: number }>);

    return monthNames.filter((month) => grouped[month]).map((month) => grouped[month]);
  }, [logs]);

  const columns: ColumnDef<LogEntry>[] = [
    { header: 'Employee', accessorKey: 'employeeName' },
    { header: 'Asset', accessorKey: 'asset' },
    { header: 'Exit Time', accessorKey: 'exitTime' },
    { header: 'Duration', accessorKey: 'duration' },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];

  const outsideCount = assets.filter((asset) => asset.status === 'OUTSIDE').length;
  const inOfficeCount = assets.filter((asset) => asset.status === 'IN_OFFICE').length;
  const overdueCount = logs.filter((log) => log.status === 'OVERDUE').length;

  if (isLoading) {
    return <div className="py-8 text-center text-slate-500">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">Asset Operations Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live overview of custody, movement, overdue risk, and scan activity.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardCard title="Total Employees" value={String(employees.length)} trend="Live from database" icon={Users} />
        <DashboardCard title="Total Assets" value={String(assets.length)} trend="Live from database" icon={Boxes} />
        <DashboardCard title="Outside Office" value={String(outsideCount)} trend="Current status" icon={Clock} />
        <DashboardCard title="Inside Office" value={String(inOfficeCount)} trend="Current status" icon={Building2} />
        <DashboardCard title="Overdue Assets" value={String(overdueCount)} trend="Latest log status" icon={AlertTriangle} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Monthly Asset Movement">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyMovement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area dataKey="exits" stroke="#2563eb" fill="#bfdbfe" />
              <Area dataKey="entries" stroke="#14b8a6" fill="#99f6e4" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Asset Category Mix">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={96} label>
                {categoryData.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Employee Asset Usage">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="assets" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Weekly Entry/Exit Graph">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyMovement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="exits" stroke="#f59e0b" strokeWidth={3} />
              <Line dataKey="entries" stroke="#22c55e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <section className="glass-panel rounded-2xl p-5">
        <h2 className="mb-4 text-lg font-bold">Recent Logs and Scans</h2>
        <DataTable data={logs} columns={columns} />
      </section>
    </div>
  );
}

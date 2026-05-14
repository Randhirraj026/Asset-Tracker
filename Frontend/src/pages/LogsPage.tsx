import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import { logService } from '../services/logService';
import { exportService } from '../services/exportService';
import { LogEntry } from '../types';

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    logService.list()
      .then(setLogs)
      .catch((error) => {
        console.error('Unable to load logs:', error);
        toast.error('Failed to load logs');
      });
  }, []);

  const filtered = useMemo(() => {
    let result = logs.filter((log) => {
      const matchesQuery = Object.values(log).join(' ').toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'All' || log.status === status;
      
      let matchesDate = true;
      if (startDate || endDate) {
        // Get the log date - prefer exitTime over entryTime
        const logDateTime = log.exitTime || log.entryTime;
        if (!logDateTime) {
          matchesDate = false;
        } else {
          const logDate = new Date(logDateTime);
          logDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
          
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (logDate < start) matchesDate = false;
          }
          
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Set to end of day for comparison
            if (logDate > end) matchesDate = false;
          }
        }
      }
      
      return matchesQuery && matchesStatus && matchesDate;
    });
    return result;
  }, [logs, query, status, startDate, endDate]);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const headers = ['Employee Name', 'Asset', 'Exit Time', 'Entry Time', 'Duration', 'Status'];
      const data = filtered.map((log) => [
        log.employeeName || '',
        log.asset || '',
        log.exitTime || '',
        log.entryTime || '',
        log.duration || '',
        log.status || ''
      ]);

      exportService.exportToExcel({
        filename: 'movement-logs',
        title: 'Movement Logs Report',
        headers,
        data,
        dateRange: startDate || endDate ? { from: startDate || 'N/A', to: endDate || 'N/A' } : undefined
      });

      toast.success('CSV export successful');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const headers = ['Employee Name', 'Asset', 'Exit Time', 'Entry Time', 'Duration', 'Status'];
      const data = filtered.map((log) => [
        log.employeeName || '',
        log.asset || '',
        log.exitTime || '',
        log.entryTime || '',
        log.duration || '',
        log.status || ''
      ]);

      exportService.exportToPDF({
        filename: 'movement-logs',
        title: 'Movement Logs Report',
        headers,
        data,
        dateRange: startDate || endDate ? { from: startDate || 'N/A', to: endDate || 'N/A' } : undefined
      });

      toast.success('Export to PDF successful');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export to PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const columns: ColumnDef<LogEntry>[] = [
    { header: 'Employee Name', accessorKey: 'employeeName' },
    { header: 'Asset', accessorKey: 'asset' },
    { header: 'Exit Time', accessorKey: 'exitTime' },
    { header: 'Entry Time', accessorKey: 'entryTime' },
    { header: 'Duration', accessorKey: 'duration' },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Movement Logs</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search, sort, filter, and export entry and exit records.</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn-secondary" 
            onClick={handleExportExcel}
            disabled={isExporting || filtered.length === 0}
          >
            <Download size={17} />
            CSV
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleExportPDF}
            disabled={isExporting || filtered.length === 0}
          >
            <Download size={17} />
            PDF
          </button>
        </div>
      </div>
      <section className="glass-panel rounded-2xl p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_220px]">
          <SearchBar value={query} onChange={setQuery} placeholder="Search employee, asset, date" />
          <input 
            type="date" 
            className="control" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="From date"
          />
          <input 
            type="date" 
            className="control" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="To date"
          />
          <select className="control" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            <option>IN</option>
            <option>OUT</option>
            <option>OVERDUE</option>
          </select>
        </div>
        <div className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Showing {filtered.length} of {logs.length} records
        </div>
        <DataTable data={filtered} columns={columns} />
      </section>
    </div>
  );
}

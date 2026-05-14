import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Plus, QrCode, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import QRCard from '../components/QRCard';
import { Asset, AssetStatus, Employee } from '../types';
import { assetService } from '../services/assetService';
import { employeeService } from '../services/employeeService';

const statuses: AssetStatus[] = ['IN_OFFICE', 'OUTSIDE', 'RETURNED', 'MAINTENANCE', 'LOST'];
const assetTypes = ['Laptop', 'Phone', 'Smartphone', 'Others'];

const generateAssetId = (type: string, deviceName: string | undefined, employeeId: string): string => {
  const assetName = type === 'Others' && deviceName ? deviceName : type;
  const assetCode = assetName.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'AST';
  const employeeCode = employeeId.trim().toUpperCase();
  return employeeCode ? `${assetCode}-${employeeCode}` : assetCode;
};

export default function AssetsPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [editing, setEditing] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState<Asset | null>(null);
  const [qr, setQr] = useState<Asset | null>(null);
  const [qrValue, setQrValue] = useState('');
  const { register, handleSubmit, reset, watch, setValue } = useForm<Asset>();
  const selectedType = watch('type');
  const selectedEmployeeId = watch('employeeId');
  const selectedDeviceName = watch('deviceName');

  useEffect(() => {
    Promise.all([assetService.list(), employeeService.list()])
      .then(([assetData, employeeData]) => {
        setItems(assetData);
        setEmployees(employeeData);
      })
      .catch((error) => {
        console.error('Unable to load data:', error);
        toast.error('Unable to load assets or employees.');
      });
  }, []);

  const filtered = useMemo(() => items.filter((asset) => Object.values(asset).join(' ').toLowerCase().includes(query.toLowerCase()) && (status === 'All' || asset.status === status)), [items, query, status]);

  const columns: ColumnDef<Asset>[] = [
    { header: 'Asset ID', accessorKey: 'assetId' },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Serial Number', accessorKey: 'serialNumber' },
    { header: 'Model', accessorKey: 'model' },
    { header: 'Assigned Employee', accessorKey: 'assignedEmployee' },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button className="btn-secondary !p-2" onClick={async () => {
            try {
              if (!row.original.id) throw new Error('Missing asset id');
              const generated = await assetService.generateQr(row.original.id);
              setQrValue(JSON.stringify(generated.qrPayload));
              setQr(row.original);
            } catch (error: any) {
              console.error('QR generation failed:', error);
              toast.error(error?.message || 'Unable to generate QR');
            }
          }} aria-label="Preview QR"><QrCode size={16} /></button>
          <button className="btn-secondary !p-2" onClick={() => { setEditing(row.original); reset(row.original); }} aria-label="Edit asset"><Edit size={16} /></button>
          <button className="btn-secondary !p-2 text-rose-600" onClick={() => setDeleting(row.original)} aria-label="Delete asset"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  async function save(values: Asset) {
    try {
      const { status: _status, ...assetPayload } = values;
      // Auto-generate asset ID if not already set
      if (!assetPayload.assetId && assetPayload.type && assetPayload.employeeId) {
        assetPayload.assetId = generateAssetId(assetPayload.type, assetPayload.deviceName, assetPayload.employeeId);
      }
      if (editing?.id) {
        const asset = await assetService.update(editing.id, assetPayload);
        setItems((current) => current.map((item) => (item.id === asset.id ? asset : item)));
      } else {
        const asset = await assetService.create(assetPayload as Asset);
        setItems((current) => [asset, ...current]);
      }
      setEditing(null);
      toast.success('Asset saved');
    } catch (error: any) {
      console.error('Asset save failed:', error);
      toast.error(error?.message || 'Unable to save asset');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Asset Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track inventory, assignment, QR identity, and lifecycle status.</p>
        </div>
        <button className="btn-primary" onClick={() => {
          reset({ assetId: '', type: '', serialNumber: '', model: '', assignedEmployee: '', employeeId: '', status: 'IN_OFFICE' });
          setEditing({ assetId: '', type: '', serialNumber: '', model: '', assignedEmployee: '', employeeId: '', status: 'IN_OFFICE' });
        }}><Plus size={18} />Add Asset</button>
      </div>
      
      <section className="glass-panel rounded-2xl p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
          <SearchBar value={query} onChange={setQuery} placeholder="Search assets" />
          <select className="control" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            {statuses.map((value) => <option key={value}>{value}</option>)}
          </select>
        </div>
        <DataTable data={filtered} columns={columns} />
      </section>
      <Modal open={Boolean(editing)} title={editing?.assetId ? 'Edit Asset' : 'Add Asset'} onClose={() => setEditing(null)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(save)}>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Asset Type</span>
            <select className="control w-full" {...register('type', { required: 'Asset type is required' })}>
              <option value="">Select Asset Type</option>
              {assetTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          {selectedType === 'Others' && (
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Device Name</span>
              <input className="control w-full" {...register('deviceName', { required: 'Device name is required for Others' })} placeholder="e.g., Smartphone, Tablet, Monitor" />
            </label>
          )}
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Assigned Employee</span>
            <select className="control w-full" {...register('employeeId', { required: 'Employee is required' })} onChange={(e) => {
              const employeeCode = e.target.value;
              const selected = employees.find((emp) => emp.employeeId === employeeCode);
              setValue('employeeId', employeeCode);
              setValue('assignedEmployee', selected?.name || '');
            }}>
              <option value="">Select Employee</option>
              {employees.map((emp) => <option key={emp.id || emp.employeeId} value={emp.employeeId}>{emp.name}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Serial Number</span>
            <input className="control w-full" {...register('serialNumber', { required: 'Serial number is required' })} placeholder="e.g., DLX-5520-AX91" />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Model</span>
            <input className="control w-full" {...register('model', { required: 'Model is required' })} placeholder="e.g., Dell Latitude 5520" />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold">Asset ID (Auto-generated)</span>
            <input className="control w-full bg-slate-100 dark:bg-slate-800" value={selectedType && selectedEmployeeId ? generateAssetId(selectedType, selectedDeviceName, selectedEmployeeId) : ''} disabled />
          </label>
          <div className="md:col-span-2 rounded-lg bg-slate-100 p-3 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Status changes are recorded only through QR movement scans.
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-primary">Save Asset</button>
          </div>
        </form>
      </Modal>
      <Modal open={Boolean(qr)} title="QR Preview" onClose={() => { setQr(null); setQrValue(''); }}>
        {qr && qrValue && (
          <div className="space-y-4">
            <QRCard 
              title={`${qr.assetId} QR`} 
              value={qrValue} 
            />

          </div>
        )}
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} title="Delete asset" description={`Remove ${deleting?.assetId || 'this asset'} from inventory?`} onCancel={() => setDeleting(null)} onConfirm={async () => {
        try {
          if (!deleting?.id) throw new Error('Missing asset id');
          await assetService.remove(deleting.id);
          setItems((current) => current.filter((asset) => asset.id !== deleting.id));
          setDeleting(null);
          toast.success('Asset deleted');
        } catch (error: any) {
          console.error('Delete failed:', error);
          toast.error(error?.message || 'Unable to delete asset');
        }
      }} />
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import { employeeService } from '../services/employeeService';
import { Employee } from '../types';

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('All');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Employee>();

  useEffect(() => {
    employeeService.list()
      .then(setItems)
      .catch((error) => {
        console.error('Unable to load employees:', error);
        toast.error('Unable to load employees.');
      });
  }, []);

  const departmentOptions = useMemo(() => {
    const uniqueDepartments = new Set(
      items
        .map((employee) => employee.department?.trim())
        .filter((value): value is string => Boolean(value))
    );
    return ['All', ...Array.from(uniqueDepartments).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  useEffect(() => {
    if (!departmentOptions.includes(department)) setDepartment('All');
  }, [department, departmentOptions]);

  const filtered = useMemo(() => items.filter((employee) => {
    const matchesQuery = Object.values(employee).join(' ').toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (department === 'All' || employee.department === department);
  }), [items, query, department]);

  const columns: ColumnDef<Employee>[] = [
    { header: 'Employee ID', accessorKey: 'employeeId' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Department', accessorKey: 'department' },
    { header: 'Designation', accessorKey: 'designation' },
    { header: 'Phone', accessorKey: 'phone' },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button className="btn-secondary !p-2" onClick={() => { setEditing(row.original); reset(row.original); }} aria-label="Edit employee"><Edit size={16} /></button>
          <button className="btn-secondary !p-2 text-rose-600" onClick={() => setDeleting(row.original)} aria-label="Delete employee"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  function openAdd() {
    const blankEmployee: Employee = { employeeId: '', name: '', email: '', department: '', designation: '', phone: '' };
    reset(blankEmployee);
    setEditing(blankEmployee);
  }

  async function save(values: Employee) {
    try {
      if (editing?.id) {
        const employee = await employeeService.update(editing.id, values);
        setItems((current) => current.map((item) => (item.id === employee.id ? employee : item)));
      } else {
        const employee = await employeeService.create(values);
        setItems((current) => [employee, ...current]);
      }
      setEditing(null);
      toast.success('Employee saved');
    } catch (error: any) {
      console.error('Employee save failed:', error);
      toast.error(error?.message || 'Unable to save employee');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Employee Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create, update, filter, and audit employee asset ownership.</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={18} />Add Employee</button>
      </div>
      <section className="glass-panel rounded-2xl p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
          <SearchBar value={query} onChange={setQuery} placeholder="Search employees" />
          <select className="control" value={department} onChange={(event) => setDepartment(event.target.value)}>
            {departmentOptions.map((value) => <option key={value}>{value}</option>)}
          </select>
        </div>
        <DataTable data={filtered} columns={columns} />
      </section>
      <Modal open={Boolean(editing)} title={editing?.employeeId ? 'Edit Employee' : 'Add Employee'} onClose={() => setEditing(null)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(save)}>
          {(['employeeId', 'name', 'email', 'department', 'designation', 'phone'] as const).map((field) => (
            <label key={field} className="block">
              <span className="mb-1.5 block text-sm font-semibold capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
              <input className="control w-full" {...register(field, { required: `${field} is required` })} />
              {errors[field] && <span className="mt-1 block text-xs text-rose-500">{errors[field]?.message}</span>}
            </label>
          ))}
          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-primary">Save Employee</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} title="Delete employee" description={`Remove ${deleting?.name || 'this employee'} from the registry?`} onCancel={() => setDeleting(null)} onConfirm={async () => {
        try {
          if (!deleting?.id) throw new Error('Missing employee id');
          await employeeService.remove(deleting.id);
          setItems((current) => current.filter((employee) => employee.id !== deleting.id));
          setDeleting(null);
          toast.success('Employee deleted');
        } catch (error: any) {
          console.error('Employee delete failed:', error);
          toast.error(error?.message || 'Unable to delete employee');
        }
      }} />
    </div>
  );
}

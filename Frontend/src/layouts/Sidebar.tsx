import { NavLink } from 'react-router-dom';
import { BarChart3, Boxes, FileText, LayoutDashboard, QrCode, ScanLine, Settings, Users } from 'lucide-react';
import { clsx } from 'clsx';
import logo from '../assets/image.png';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/assets', label: 'Assets', icon: Boxes },
  { to: '/qr-scanner', label: 'QR Scanner', icon: ScanLine },
  { to: '/logs', label: 'Logs', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={clsx('fixed inset-y-0 left-0 z-40 w-72 border-r border-white/60 bg-white/85 p-5 backdrop-blur-xl transition dark:border-white/10 dark:bg-slate-950/90 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
      <div className="mb-8 flex flex-col items-center text-center">
        <img src={logo} alt="Kristellar Aerospace" className="h-auto w-44 object-contain" />
        <h1 className="mt-5 text-xl font-extrabold text-slate-950 dark:text-white">Asset Tracker</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Management Console</p>
      </div>
      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              clsx('flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition', isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
